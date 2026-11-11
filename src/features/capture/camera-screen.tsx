import Ionicons from '@expo/vector-icons/Ionicons';
import { Paths } from 'expo-file-system';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { useIsFocused, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  type FlashMode,
  useCameraPermission,
  usePhotoOutput,
} from 'react-native-vision-camera';

import { AppText } from '@/components/app-text';
import { pendingCountsByProject, subscribeToCaptures } from '@/features/uploads/captures';
import { colors, layout, spacing } from '@/theme/tokens';

import { type CaptureProject, LOW_STORAGE_BYTES, saveCapture } from './save-capture';

const flashModes: FlashMode[] = ['off', 'auto', 'on'];
const flashIcons = { off: 'flash-off', auto: 'flash-outline', on: 'flash' } as const;

/** Full-screen photo capture for one project. Capture never waits for the network. */
export function CameraScreen({ project }: { project: CaptureProject }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const { hasPermission, canRequestPermission, requestPermission } = useCameraPermission();
  const photoOutput = usePhotoOutput({
    containerFormat: 'jpeg',
    qualityPrioritization: 'balanced',
  });
  const [flash, setFlash] = useState<FlashMode>('off');
  const [takenHere, setTakenHere] = useState(0);
  const [waiting, setWaiting] = useState(0);
  const [lastSaveMs, setLastSaveMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lowStorage, setLowStorage] = useState(false);
  const inFlight = useRef(0);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) =>
      setAppActive(state === 'active'),
    );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!hasPermission && canRequestPermission) {
      void requestPermission();
    }
  }, [hasPermission, canRequestPermission, requestPermission]);

  // Keep a fresh GPS fix while the camera is open, so each photo can record where it was taken.
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    void (async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.granted) {
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 5, timeInterval: 5000 },
          () => undefined,
        );
      }
    })();

    return () => subscription?.remove();
  }, []);

  const refreshWaiting = useCallback(() => {
    void pendingCountsByProject().then((counts) => {
      setWaiting(counts[project.public_id] ?? 0);
      setLowStorage(Paths.availableDiskSpace < LOW_STORAGE_BYTES);
    });
  }, [project.public_id]);

  useEffect(() => {
    refreshWaiting();

    return subscribeToCaptures(refreshWaiting);
  }, [refreshWaiting]);

  const takePhoto = useCallback(async () => {
    const started = Date.now();
    inFlight.current += 1;
    setTakenHere((count) => count + 1);

    try {
      const photo = await photoOutput.capturePhotoToFile(
        { flashMode: flash, enableShutterSound: true },
        {},
      );
      await saveCapture(photo.filePath, project, new Date(started));
      setLastSaveMs(Date.now() - started);
      setError(null);
    } catch (captureError) {
      setTakenHere((count) => count - 1);
      setError(
        captureError instanceof Error ? captureError.message : 'The photo could not be saved.',
      );
    } finally {
      inFlight.current -= 1;
    }
  }, [flash, photoOutput, project]);

  if (!hasPermission) {
    return (
      <View style={[styles.permission, { paddingTop: insets.top + spacing.xl }]}>
        <AppText variant="heading" style={styles.light}>
          Camera access needed
        </AppText>
        <AppText style={styles.lightMuted}>
          JobLens uses the camera to take project photos. They are saved on this phone and upload to{' '}
          {project.name} when you have service.
        </AppText>
        <Pressable
          accessibilityRole="button"
          onPress={() => (canRequestPermission ? requestPermission() : Linking.openSettings())}
          style={styles.permissionButton}
        >
          <AppText variant="label">
            {canRequestPermission ? 'Allow camera' : 'Open Settings'}
          </AppText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <AppText variant="label" style={styles.light}>
            Not now
          </AppText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Camera
        style={StyleSheet.absoluteFill}
        device="back"
        isActive={isFocused && appActive}
        outputs={[photoOutput]}
        enableNativeZoomGesture
        enableNativeTapToFocusGesture
        onError={(cameraError) => setError(cameraError.message)}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          accessibilityLabel="Close camera"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <Ionicons name="close" size={24} color={colors.background} />
        </Pressable>
        <View style={styles.title}>
          <AppText variant="label" numberOfLines={1} style={styles.light}>
            {project.name}
          </AppText>
          <AppText variant="caption" style={styles.lightMuted}>
            {waiting > 0 ? `${waiting} waiting to upload` : 'All photos uploaded'}
          </AppText>
        </View>
        <Pressable
          accessibilityLabel={`Flash ${flash}`}
          accessibilityRole="button"
          onPress={() => setFlash(flashModes[(flashModes.indexOf(flash) + 1) % flashModes.length])}
          style={styles.iconButton}
        >
          <Ionicons name={flashIcons[flash]} size={22} color={colors.background} />
        </Pressable>
      </View>

      {(error || lowStorage) && (
        <View style={styles.notice}>
          <AppText variant="caption" style={styles.light}>
            {error ??
              'This phone is almost full. Photos waiting to upload are kept, but free up space soon.'}
          </AppText>
        </View>
      )}

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.counter}>
          <AppText variant="label" style={styles.light}>
            {takenHere}
          </AppText>
          <AppText variant="caption" style={styles.lightMuted}>
            taken
          </AppText>
        </View>
        <Pressable
          accessibilityLabel="Take photo"
          accessibilityRole="button"
          onPress={() => void takePhoto()}
          style={({ pressed }) => [styles.shutter, pressed && styles.shutterPressed]}
        />
        <View style={styles.counter}>
          {lastSaveMs !== null && (
            <>
              <AppText variant="label" style={styles.light}>
                {lastSaveMs} ms
              </AppText>
              <AppText variant="caption" style={styles.lightMuted}>
                last save
              </AppText>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  light: { color: colors.background },
  lightMuted: { color: '#D0D5DD' },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: 'rgba(16, 24, 40, 0.55)',
  },
  title: { flex: 1, alignItems: 'center' },
  iconButton: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    borderRadius: layout.radius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  notice: {
    position: 'absolute',
    top: 140,
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.md,
    borderRadius: layout.radius,
    backgroundColor: 'rgba(16, 24, 40, 0.8)',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: 'rgba(16, 24, 40, 0.55)',
  },
  counter: { width: 88, alignItems: 'center' },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 20,
    borderWidth: 5,
    borderColor: colors.background,
    backgroundColor: colors.brand,
  },
  shutterPressed: { backgroundColor: colors.brandPressed, transform: [{ scale: 0.94 }] },
  permission: {
    flex: 1,
    backgroundColor: colors.text,
    paddingHorizontal: spacing.gutter,
    gap: spacing.lg,
  },
  permissionButton: {
    minHeight: layout.touchTarget,
    borderRadius: layout.radius,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
