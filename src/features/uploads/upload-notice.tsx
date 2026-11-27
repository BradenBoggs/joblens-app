import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { colors, layout, spacing } from '@/theme/tokens';

import { pendingCount, subscribeToCaptures } from './captures';

type UploadNoticeProps = {
  /** Show the row even when nothing is waiting, as on Account. */
  showWhenEmpty?: boolean;
};

/**
 * One row that says how many photos are still on this phone and opens the list
 * of them. Uploading is a status, not a place, so it has no tab of its own.
 */
export function UploadNotice({ showWhenEmpty = false }: UploadNoticeProps) {
  const router = useRouter();
  const [waiting, setWaiting] = useState(0);

  useEffect(() => {
    const load = () => void pendingCount().then(setWaiting);
    load();

    return subscribeToCaptures(load);
  }, []);

  if (waiting === 0 && !showWhenEmpty) return null;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/uploads')}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Ionicons
        name={waiting > 0 ? 'cloud-upload-outline' : 'cloud-done-outline'}
        size={22}
        color={colors.secondary}
      />
      <View style={styles.text}>
        <AppText variant="label">
          {waiting > 0
            ? `${waiting} ${waiting === 1 ? 'photo' : 'photos'} waiting to upload`
            : 'All photos uploaded'}
        </AppText>
        {waiting > 0 && (
          <AppText variant="caption" muted>
            They upload by themselves when you have service.
          </AppText>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: layout.touchTarget,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radius,
  },
  pressed: { backgroundColor: colors.surface },
  text: { flex: 1, gap: 2 },
});
