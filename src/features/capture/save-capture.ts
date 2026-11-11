import * as Crypto from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import * as Location from 'expo-location';

import { insertCapture } from '@/features/uploads/captures';
import { runUploadQueue } from '@/features/uploads/upload-queue';

export type CaptureProject = { public_id: string; name: string };

/** Below this much free space we warn before the user takes more photos. */
export const LOW_STORAGE_BYTES = 500 * 1024 * 1024;

function capturesDirectory(): Directory {
  const directory = new Directory(Paths.document, 'captures');
  if (!directory.exists) {
    directory.create({ intermediates: true });
  }

  return directory;
}

/**
 * Move a just-taken photo into the app's own storage and queue it. This never
 * touches the network, so it works the same with or without signal.
 */
export async function saveCapture(
  temporaryPath: string,
  project: CaptureProject,
  capturedAt: Date,
): Promise<void> {
  const id = Crypto.randomUUID();
  const filename = `IMG_${capturedAt
    .toISOString()
    .replace(/[-:.TZ]/g, '')
    .slice(0, 14)}_${id.slice(0, 8)}.jpg`;
  const source = new File(
    temporaryPath.startsWith('file://') ? temporaryPath : `file://${temporaryPath}`,
  );
  const destination = new File(capturesDirectory(), filename);
  await source.move(destination);

  const location = await lastKnownLocation();

  await insertCapture({
    id,
    project_public_id: project.public_id,
    project_name: project.name,
    file_uri: destination.uri,
    filename,
    content_type: 'image/jpeg',
    size: destination.size,
    captured_at: capturedAt.toISOString(),
    latitude: location?.coords.latitude ?? null,
    longitude: location?.coords.longitude ?? null,
    location_accuracy: location?.coords.accuracy ?? null,
    idempotency_key: Crypto.randomUUID(),
    session_key: null,
    media_public_id: null,
    state: 'waiting',
    attempts: 0,
    next_attempt_at: 0,
    error: null,
  });

  void runUploadQueue();
}

async function lastKnownLocation(): Promise<Location.LocationObject | null> {
  try {
    const permission = await Location.getForegroundPermissionsAsync();
    if (!permission.granted) {
      return null;
    }

    // The last fix from the phone's own location service; this works without signal.
    return await Location.getLastKnownPositionAsync({ maxAge: 2 * 60 * 1000 });
  } catch {
    return null;
  }
}
