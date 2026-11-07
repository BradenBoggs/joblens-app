import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

import { getStoredToken } from '@/features/auth/token-store';

import { runUploadQueue } from './upload-queue';

const TASK_NAME = 'joblens-upload-queue';

/**
 * Lets the phone wake the upload queue while the app is closed. iOS and
 * Android decide when this runs (at least 15 minutes apart, often less often),
 * so opening the app is still the fastest way to finish a large backlog.
 */
TaskManager.defineTask(TASK_NAME, async () => {
  try {
    if (await getStoredToken()) {
      await runUploadQueue();
    }

    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerBackgroundUploads(): Promise<void> {
  const status = await BackgroundTask.getStatusAsync();
  if (status !== BackgroundTask.BackgroundTaskStatus.Available) {
    return;
  }

  if (!(await TaskManager.isTaskRegisteredAsync(TASK_NAME))) {
    await BackgroundTask.registerTaskAsync(TASK_NAME, { minimumInterval: 15 });
  }
}
