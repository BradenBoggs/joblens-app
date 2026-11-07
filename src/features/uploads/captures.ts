import { getDatabase } from '@/lib/database';

export type CaptureState = 'waiting' | 'uploading' | 'checking' | 'done' | 'rejected';

export type Capture = {
  id: string;
  project_public_id: string;
  project_name: string;
  file_uri: string;
  filename: string;
  content_type: string;
  size: number;
  captured_at: string;
  latitude: number | null;
  longitude: number | null;
  location_accuracy: number | null;
  idempotency_key: string;
  session_key: string | null;
  media_public_id: string | null;
  state: CaptureState;
  attempts: number;
  next_attempt_at: number;
  error: string | null;
  updated_at: number;
};

type Listener = () => void;
const listeners = new Set<Listener>();

/** Screens subscribe so counts and rows refresh when a capture changes. */
export function subscribeToCaptures(listener: Listener): () => void {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

export function notifyCapturesChanged(): void {
  listeners.forEach((listener) => listener());
}

export async function insertCapture(capture: Omit<Capture, 'updated_at'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO captures (id, project_public_id, project_name, file_uri, filename, content_type, size,
      captured_at, latitude, longitude, location_accuracy, idempotency_key, session_key, media_public_id,
      state, attempts, next_attempt_at, error, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    capture.id,
    capture.project_public_id,
    capture.project_name,
    capture.file_uri,
    capture.filename,
    capture.content_type,
    capture.size,
    capture.captured_at,
    capture.latitude,
    capture.longitude,
    capture.location_accuracy,
    capture.idempotency_key,
    capture.session_key,
    capture.media_public_id,
    capture.state,
    capture.attempts,
    capture.next_attempt_at,
    capture.error,
    Date.now(),
  );
  notifyCapturesChanged();
}

export async function updateCapture(
  id: string,
  changes: Partial<Omit<Capture, 'id' | 'updated_at'>>,
): Promise<void> {
  const entries = Object.entries(changes);

  if (entries.length === 0) {
    return;
  }

  const db = await getDatabase();
  await db.runAsync(
    `UPDATE captures SET ${entries.map(([column]) => `${column} = ?`).join(', ')}, updated_at = ? WHERE id = ?`,
    ...entries.map(([, value]) => value as string | number | null),
    Date.now(),
    id,
  );
  notifyCapturesChanged();
}

export async function deleteCapture(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM captures WHERE id = ?', id);
  notifyCapturesChanged();
}

export async function listCaptures(): Promise<Capture[]> {
  const db = await getDatabase();

  return db.getAllAsync<Capture>(
    `SELECT * FROM captures
     WHERE state != 'done' OR updated_at > ?
     ORDER BY captured_at DESC LIMIT 500`,
    Date.now() - 24 * 60 * 60 * 1000,
  );
}

/** Photos not yet accepted by the server, per project. */
export async function pendingCountsByProject(): Promise<Record<string, number>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ project_public_id: string; count: number }>(
    `SELECT project_public_id, COUNT(*) AS count FROM captures
     WHERE state IN ('waiting', 'uploading', 'checking', 'rejected')
     GROUP BY project_public_id`,
  );

  return Object.fromEntries(rows.map((row) => [row.project_public_id, row.count]));
}

export async function pendingCount(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM captures WHERE state IN ('waiting', 'uploading', 'checking', 'rejected')`,
  );

  return row?.count ?? 0;
}
