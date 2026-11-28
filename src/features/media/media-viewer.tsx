import { Image, Modal, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { TopBarButton } from '@/components/shell/top-bar';
import { colors, spacing } from '@/theme/tokens';

import type { MediaItem } from './project-media';

type MediaViewerProps = {
  /** The photo or video to show; null keeps the viewer closed. */
  item: MediaItem | null;
  onClose: () => void;
};

/**
 * One photo, full screen, over both bars. A video shows its still frame for
 * now: the phone does not play videos yet.
 */
export function MediaViewer({ item, onClose }: MediaViewerProps) {
  const insets = useSafeAreaInsets();
  const source = item?.preview_url ?? item?.thumbnail_url;
  const details = item
    ? [item.uploader_name, item.taken_at ? new Date(item.taken_at).toLocaleString() : null]
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <Modal
      visible={item !== null}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.viewer}>
        {source ? (
          <Image
            source={{ uri: source }}
            resizeMode="contain"
            style={styles.image}
            accessibilityLabel={item?.kind === 'video' ? 'Video still frame' : 'Photo'}
          />
        ) : null}
        <View
          style={[styles.close, { top: insets.top + spacing.sm, left: insets.left + spacing.md }]}
        >
          <TopBarButton icon="close" label="Close" onPress={onClose} />
        </View>
        <View style={[styles.caption, { paddingBottom: insets.bottom + spacing.lg }]}>
          {item?.kind === 'video' ? (
            <AppText variant="caption" style={styles.captionText}>
              Videos play in JobLens on the web for now.
            </AppText>
          ) : null}
          {details ? (
            <AppText variant="caption" style={styles.captionText}>
              {details}
            </AppText>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  viewer: { flex: 1, backgroundColor: colors.text, justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  close: { position: 'absolute', borderRadius: 20, backgroundColor: colors.background },
  caption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.gutter,
    gap: spacing.xs,
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
  },
  captionText: { color: colors.onDark, textAlign: 'center' },
});
