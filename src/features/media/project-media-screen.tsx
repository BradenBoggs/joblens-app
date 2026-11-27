import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { AppText } from '@/components/app-text';
import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/skeleton';
import { useCurrentProject } from '@/features/projects/project-context';
import { ProjectShell } from '@/features/projects/project-shell';
import type { Capture } from '@/features/uploads/captures';
import { colors, layout, spacing } from '@/theme/tokens';

import { MediaViewer } from './media-viewer';
import type { MediaItem } from './project-media';
import { useProjectMedia } from './use-project-media';

const columns = 3;
const gap = 2;

type Tile = { key: string; waiting: Capture } | { key: string; item: MediaItem };

/**
 * A project's Media section: a grid of its photos and videos, newest first.
 * Photos taken on this phone lead the grid until JobLens has them.
 */
export function ProjectMediaScreen() {
  const { projectId } = useCurrentProject();
  const { width } = useWindowDimensions();
  const { items, waiting, refreshing, notice, loadingMore, refresh, loadMore } =
    useProjectMedia(projectId);
  const [viewing, setViewing] = useState<MediaItem | null>(null);

  const gridWidth = Math.min(width, layout.contentWidth);
  const size = Math.floor((gridWidth - gap * (columns - 1)) / columns);

  const tiles: Tile[] = [
    ...waiting.map((capture) => ({ key: `waiting-${capture.id}`, waiting: capture })),
    ...(items ?? []).map((item) => ({ key: item.public_id, item })),
  ];

  return (
    <ProjectShell section="Media" skeleton={<MediaSkeleton size={size} />} scroll={false}>
      {items === undefined ? (
        <MediaSkeleton size={size} />
      ) : (
        <FlatList
          data={tiles}
          keyExtractor={(tile) => tile.key}
          numColumns={columns}
          style={styles.list}
          contentContainerStyle={[styles.content, { width: gridWidth }]}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} />
          }
          onEndReached={() => void loadMore()}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            notice ? (
              <AppText
                variant="caption"
                muted
                accessibilityLiveRegion="polite"
                style={styles.notice}
              >
                {notice}
              </AppText>
            ) : undefined
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <EmptyState
                icon="images-outline"
                title={items === null ? "Photos couldn't be loaded" : 'No photos yet'}
                description={
                  items === null
                    ? 'Pull down to try again when you have a connection.'
                    : 'Take the first ones with the camera button below.'
                }
              />
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.row}>
                <Skeleton width={size} height={size} radius={0} />
                <Skeleton width={size} height={size} radius={0} />
                <Skeleton width={size} height={size} radius={0} />
              </View>
            ) : undefined
          }
          renderItem={({ item: tile }) =>
            'waiting' in tile ? (
              <WaitingTile capture={tile.waiting} size={size} />
            ) : (
              <MediaTile item={tile.item} size={size} onPress={() => setViewing(tile.item)} />
            )
          }
        />
      )}
      <MediaViewer item={viewing} onClose={() => setViewing(null)} />
    </ProjectShell>
  );
}

function MediaTile({
  item,
  size,
  onPress,
}: {
  item: MediaItem;
  size: number;
  onPress: () => void;
}) {
  const video = item.kind === 'video';

  return (
    <Pressable
      accessibilityRole="imagebutton"
      accessibilityLabel={`${video ? 'Video' : 'Photo'}${item.taken_at ? `, ${new Date(item.taken_at).toLocaleString()}` : ''}`}
      onPress={onPress}
      style={[styles.tile, { width: size, height: size }]}
    >
      {item.thumbnail_url ? (
        <Image source={{ uri: item.thumbnail_url }} style={styles.image} />
      ) : (
        <Ionicons
          name={video ? 'videocam-outline' : 'image-outline'}
          size={24}
          color={colors.placeholder}
        />
      )}
      {video ? (
        <View style={styles.badge}>
          <Ionicons name="play" size={12} color={colors.onDark} />
        </View>
      ) : null}
    </Pressable>
  );
}

/** A photo that is still only on this phone. */
function WaitingTile({ capture, size }: { capture: Capture; size: number }) {
  const failed = capture.state === 'rejected';

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={failed ? 'Photo not uploaded' : 'Photo waiting to upload'}
      style={[styles.tile, { width: size, height: size }]}
    >
      <Image source={{ uri: capture.file_uri }} style={[styles.image, styles.waitingImage]} />
      <View style={styles.badge}>
        <Ionicons
          name={failed ? 'alert-circle-outline' : 'cloud-upload-outline'}
          size={14}
          color={colors.onDark}
        />
      </View>
    </View>
  );
}

function MediaSkeleton({ size }: { size: number }) {
  return (
    <View
      style={styles.skeleton}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      {Array.from({ length: 12 }, (_, index) => (
        <Skeleton key={index} width={size} height={size} radius={0} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { alignSelf: 'center', gap, paddingBottom: spacing.xxl, flexGrow: 1 },
  row: { flexDirection: 'row', gap },
  notice: { paddingHorizontal: spacing.gutter, paddingVertical: spacing.sm },
  empty: { padding: spacing.gutter },
  tile: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  waitingImage: { opacity: 0.6 },
  badge: {
    position: 'absolute',
    right: spacing.xs,
    bottom: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeleton: { flexDirection: 'row', flexWrap: 'wrap', gap, alignSelf: 'center' },
});
