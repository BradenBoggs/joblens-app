import * as Crypto from 'expo-crypto';
import { File } from 'expo-file-system';
import * as Network from 'expo-network';

import { ApiError, apiRequest } from '@/lib/api';
import { getDatabase } from '@/lib/database';

import { type Capture, updateCapture } from './captures';

type UploadAuthorization = {
  multipart: boolean;
  url?: string;
  headers?: Record<string, string | string[]>;
  expires_at: string;
};

type ServerMedia = {
  public_id: string;
  upload_status: 'pending' | 'accepted' | 'failed';
  upload_failure_reason?: string | null;
};

/** Upload sessions group a run of photos; the server ends a session after 24 hours, so rotate well before. */
const SESSION_LIFETIME_MS = 6 * 60 * 60 * 1000;
const MAX_BACKOFF_MS = 5 * 60 * 1000;

let running: Promise<void> | null = null;

/**
 * Send every photo that is waiting, then check the ones the server is processing.
 * Safe to call often (network change, app foreground, after capture, background task):
 * only one run happens at a time, and it does nothing without a connection.
 */
export function runUploadQueue(): Promise<void> {
  running ??= processQueue().finally(() => {
    running = null;
  });

  return running;
}

async function processQueue(): Promise<void> {
  const db = await getDatabase();

  // A run that was interrupted (app killed mid-transfer) starts those photos again.
  await db.runAsync(
    `UPDATE captures SET state = 'waiting' WHERE state = 'uploading' AND updated_at < ?`,
    Date.now() - 2 * 60 * 1000,
  );

  for (;;) {
    const network = await Network.getNetworkStateAsync();

    if (!network.isConnected || network.isInternetReachable === false) {
      return;
    }

    const concurrency = network.type === Network.NetworkStateType.WIFI ? 6 : 3;
    const batch = await db.getAllAsync<Capture>(
      `SELECT * FROM captures WHERE state = 'waiting' AND next_attempt_at <= ? ORDER BY captured_at LIMIT ?`,
      Date.now(),
      concurrency,
    );

    if (batch.length === 0) {
      break;
    }

    const results = await Promise.all(batch.map(sendCapture));

    if (results.includes('stop')) {
      return;
    }
  }

  await checkProcessing();
}

type SendResult = 'sent' | 'retry' | 'stop';

async function sendCapture(capture: Capture): Promise<SendResult> {
  await updateCapture(capture.id, { state: 'uploading', error: null });

  try {
    const file = new File(capture.file_uri);

    if (!file.exists) {
      await updateCapture(capture.id, {
        state: 'rejected',
        error: 'The photo file is missing on this phone.',
      });

      return 'sent';
    }

    const sessionKey = capture.session_key ?? (await currentSessionKey(capture.project_public_id));
    const started = await apiRequest<{ media: ServerMedia; upload: UploadAuthorization }>(
      `/projects/${capture.project_public_id}/media/uploads`,
      {
        method: 'POST',
        body: {
          idempotency_key: capture.idempotency_key,
          session_key: sessionKey,
          filename: capture.filename,
          content_type: capture.content_type,
          size: capture.size,
        },
      },
    );
    await updateCapture(capture.id, {
      session_key: sessionKey,
      media_public_id: started.media.public_id,
    });

    if (started.media.upload_status !== 'pending') {
      return finishFromStatus(capture.id, started.media);
    }

    let authorization = started.upload;
    let transfer = await transferFile(file, authorization);

    // An address that expired while waiting gets refreshed once.
    if (transfer === 'expired') {
      const refreshed = await apiRequest<{ upload: UploadAuthorization }>(
        `/projects/${capture.project_public_id}/media/${started.media.public_id}/upload-url`,
        { method: 'POST' },
      );
      authorization = refreshed.upload;
      transfer = await transferFile(file, authorization);
    }

    if (transfer !== 'ok') {
      return scheduleRetry(capture, 'Upload interrupted. It will try again.');
    }

    const completed = await apiRequest<{ media: ServerMedia }>(
      `/projects/${capture.project_public_id}/media/${started.media.public_id}/complete`,
      { method: 'POST', headers: { 'X-Media-Upload-Async': '1' } },
    );

    return finishFromStatus(capture.id, completed.media);
  } catch (error) {
    return handleError(capture, error);
  }
}

async function transferFile(
  file: File,
  authorization: UploadAuthorization,
): Promise<'ok' | 'expired' | 'failed'> {
  if (authorization.multipart || !authorization.url) {
    // Photos stay far below the 100 MB multipart threshold; video is out of scope for the spike.
    throw new ApiError('This file is too large for the app to upload yet.', 422);
  }

  try {
    const result = await file.upload(authorization.url, {
      httpMethod: 'PUT',
      headers: normalizeHeaders(authorization.headers ?? {}),
      sessionType: 'background',
    });

    if (result.status >= 200 && result.status < 300) {
      return 'ok';
    }

    return result.status === 403 ? 'expired' : 'failed';
  } catch {
    return 'failed';
  }
}

function normalizeHeaders(headers: Record<string, string | string[]>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers)
      .filter(([name]) => !['host', 'content-length'].includes(name.toLowerCase()))
      .map(([name, value]) => [name, Array.isArray(value) ? value.join(', ') : value]),
  );
}

async function finishFromStatus(id: string, media: ServerMedia): Promise<SendResult> {
  if (media.upload_status === 'accepted') {
    await markAccepted(id);
  } else if (media.upload_status === 'failed') {
    await updateCapture(id, {
      state: 'rejected',
      error: media.upload_failure_reason ?? 'JobLens could not accept this photo.',
    });
  } else {
    await updateCapture(id, { state: 'checking' });
  }

  return 'sent';
}

async function handleError(capture: Capture, error: unknown): Promise<SendResult> {
  if (
    !(error instanceof ApiError) ||
    error.isOffline ||
    error.status === 429 ||
    error.status >= 500
  ) {
    return scheduleRetry(capture, 'Waiting for a connection.');
  }

  if (error.status === 401) {
    // Signed out on the server: keep the photo and wait for sign-in.
    await updateCapture(capture.id, { state: 'waiting', error: 'Sign in again to upload.' });

    return 'stop';
  }

  if (error.status === 422 && error.errors.session_key) {
    // The upload session ended; start this photo in a fresh one.
    await rotateSessionKey(capture.project_public_id);
    await updateCapture(capture.id, {
      state: 'waiting',
      session_key: null,
      media_public_id: null,
      attempts: capture.attempts + 1,
      next_attempt_at: Date.now() + 2000,
    });

    return 'retry';
  }

  await updateCapture(capture.id, { state: 'rejected', error: error.firstError() });

  return 'sent';
}

async function scheduleRetry(capture: Capture, message: string): Promise<SendResult> {
  const attempts = capture.attempts + 1;
  const delay = Math.min(2 ** attempts * 1000, MAX_BACKOFF_MS);
  await updateCapture(capture.id, {
    state: 'waiting',
    attempts,
    next_attempt_at: Date.now() + delay,
    error: message,
  });

  return 'retry';
}

/** Ask the server about photos it is still checking, a project at a time. */
async function checkProcessing(): Promise<void> {
  const db = await getDatabase();
  const checking = await db.getAllAsync<Capture>(
    `SELECT * FROM captures WHERE state = 'checking' AND media_public_id IS NOT NULL LIMIT 300`,
  );
  const byProject = new Map<string, Capture[]>();
  checking.forEach((capture) => {
    byProject.set(capture.project_public_id, [
      ...(byProject.get(capture.project_public_id) ?? []),
      capture,
    ]);
  });

  for (const [projectId, captures] of byProject) {
    for (let index = 0; index < captures.length; index += 100) {
      const chunk = captures.slice(index, index + 100);
      const query = chunk
        .map((capture) => `ids[]=${encodeURIComponent(capture.media_public_id ?? '')}`)
        .join('&');

      try {
        const { media } = await apiRequest<{ media: ServerMedia[] }>(
          `/projects/${projectId}/media/uploads/status?${query}`,
        );
        for (const item of media) {
          const capture = chunk.find((candidate) => candidate.media_public_id === item.public_id);
          if (capture) {
            await finishFromStatus(capture.id, item);
          }
        }
      } catch {
        // Try again on the next run.
      }
    }
  }
}

/** The local copy is only deleted after the server accepted the photo. */
async function markAccepted(id: string): Promise<void> {
  const db = await getDatabase();
  const capture = await db.getFirstAsync<Capture>('SELECT * FROM captures WHERE id = ?', id);

  if (capture) {
    const file = new File(capture.file_uri);
    if (file.exists) {
      file.delete();
    }
  }

  await updateCapture(id, { state: 'done', error: null });
}

async function currentSessionKey(projectId: string): Promise<string> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM meta WHERE key = ?',
    `session:${projectId}`,
  );

  if (row) {
    const { key, startedAt } = JSON.parse(row.value) as { key: string; startedAt: number };
    if (Date.now() - startedAt < SESSION_LIFETIME_MS) {
      return key;
    }
  }

  return rotateSessionKey(projectId);
}

async function rotateSessionKey(projectId: string): Promise<string> {
  const db = await getDatabase();
  const key = Crypto.randomUUID();
  await db.runAsync(
    'INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)',
    `session:${projectId}`,
    JSON.stringify({ key, startedAt: Date.now() }),
  );

  return key;
}

/** Put a rejected photo back in the queue when the user taps Retry. */
export async function retryCapture(id: string): Promise<void> {
  await updateCapture(id, {
    state: 'waiting',
    attempts: 0,
    next_attempt_at: 0,
    error: null,
    session_key: null,
    media_public_id: null,
    idempotency_key: Crypto.randomUUID(),
  });
  void runUploadQueue();
}
