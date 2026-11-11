import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { File } from 'expo-file-system';

import { AppText } from '@/components/app-text';
import { EmptyState } from '@/components/empty-state';
import { colors, layout, spacing } from '@/theme/tokens';

import { type Capture, deleteCapture, listCaptures, subscribeToCaptures } from './captures';
import { retryCapture, runUploadQueue } from './upload-queue';

const stateLabels: Record<Capture['state'], string> = {
  waiting: 'Waiting to upload',
  uploading: 'Uploading',
  checking: 'Checking on JobLens',
  done: 'Uploaded',
  rejected: 'Not uploaded',
};

export function UploadsScreen() {
  const insets = useSafeAreaInsets();
  const [captures, setCaptures] = useState<Capture[] | null>(null);

  const load = useCallback(() => void listCaptures().then(setCaptures), []);

  useEffect(() => {
    load();

    return subscribeToCaptures(load);
  }, [load]);

  const discard = (capture: Capture) =>
    Alert.alert(
      'Discard this photo?',
      'It has not been uploaded and will be deleted from this phone.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            const file = new File(capture.file_uri);
            if (file.exists) {
              file.delete();
            }
            void deleteCapture(capture.id);
          },
        },
      ],
    );

  const waiting = (captures ?? []).filter((capture) => capture.state !== 'done').length;

  return (
    <FlatList
      data={captures ?? []}
      keyExtractor={(capture) => capture.id}
      style={styles.list}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      ListHeaderComponent={
        <View style={styles.header}>
          <AppText variant="title" accessibilityRole="header">
            Uploads
          </AppText>
          <AppText muted>
            {waiting > 0
              ? `${waiting} photos are saved on this phone and upload when you have service.`
              : 'Everything you took has been uploaded.'}
          </AppText>
          {waiting > 0 && (
            <Pressable
              accessibilityRole="button"
              onPress={() => void runUploadQueue()}
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            >
              <AppText variant="label">Try now</AppText>
            </Pressable>
          )}
        </View>
      }
      ListEmptyComponent={
        captures === null ? undefined : (
          <EmptyState
            icon="cloud-done-outline"
            title="No photos waiting"
            description="Photos you take in a project show here until JobLens has them."
          />
        )
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={styles.rowText}>
            <AppText variant="label">{item.project_name}</AppText>
            <AppText variant="caption" muted>
              {new Date(item.captured_at).toLocaleString()} · {stateLabels[item.state]}
            </AppText>
            {item.error && item.state !== 'done' ? (
              <AppText variant="caption" muted>
                {item.error}
              </AppText>
            ) : null}
          </View>
          {item.state === 'rejected' && (
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => void retryCapture(item.id)}
                style={styles.smallButton}
              >
                <AppText variant="label">Retry</AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => discard(item)}
                style={styles.smallButton}
              >
                <AppText variant="label">Discard</AppText>
              </Pressable>
            </View>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xl,
    gap: spacing.sm,
    width: '100%',
    maxWidth: layout.contentWidth,
    alignSelf: 'center',
  },
  header: { gap: spacing.md, marginBottom: spacing.sm },
  button: {
    minHeight: layout.touchTarget,
    borderRadius: layout.radius,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { backgroundColor: colors.brandPressed },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radius,
  },
  rowText: { flex: 1, gap: 2 },
  actions: { gap: spacing.xs },
  smallButton: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: layout.radius,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
