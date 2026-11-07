import * as Network from 'expo-network';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { runUploadQueue } from './upload-queue';

const ACTIVE_INTERVAL_MS = 15 * 1000;

/**
 * Runs the upload queue while the app is open: on launch, when service comes
 * back, when the app returns to the foreground, and every few seconds.
 */
export function useUploadQueue(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    void runUploadQueue();

    const network = Network.addNetworkStateListener((state) => {
      if (state.isConnected) {
        void runUploadQueue();
      }
    });
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void runUploadQueue();
      }
    });
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') {
        void runUploadQueue();
      }
    }, ACTIVE_INTERVAL_MS);

    return () => {
      network.remove();
      appState.remove();
      clearInterval(interval);
    };
  }, [enabled]);
}
