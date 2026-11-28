import { useCallback, useEffect, useState } from 'react';

import { useProjectSection } from '@/features/projects/use-project-section';
import { type Capture, listCaptures, subscribeToCaptures } from '@/features/uploads/captures';

import { downloadMediaPage, downloadNewestMedia, type MediaItem } from './project-media';

/**
 * A project's photos and videos: what JobLens has, newest first, plus the
 * photos taken on this phone that have not reached JobLens yet.
 */
export function useProjectMedia(projectId: string) {
  const newest = useProjectSection(projectId, 'media', downloadNewestMedia);
  const [older, setOlder] = useState<MediaItem[]>([]);
  // `undefined` until the newest page says whether there are more.
  const [olderNextPage, setOlderNextPage] = useState<number | null | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [waiting, setWaiting] = useState<Capture[]>([]);

  const { data: newestData, refresh: refreshNewest } = newest;
  const nextPage = olderNextPage === undefined ? (newestData?.next_page ?? null) : olderNextPage;

  const refresh = useCallback(async () => {
    setOlder([]);
    setOlderNextPage(undefined);
    await refreshNewest();
  }, [refreshNewest]);

  const loadMore = useCallback(async () => {
    if (loadingMore || nextPage === null) return;
    setLoadingMore(true);
    try {
      const page = await downloadMediaPage(projectId, nextPage);
      setOlder((current) => [...current, ...page.data]);
      setOlderNextPage(page.next_page);
    } catch {
      // Stay on what is shown; scrolling to the end again retries.
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, nextPage, projectId]);

  useEffect(() => {
    const load = () =>
      void listCaptures().then((captures) =>
        setWaiting(
          captures.filter(
            (capture) => capture.project_public_id === projectId && capture.state !== 'done',
          ),
        ),
      );
    load();

    return subscribeToCaptures(load);
  }, [projectId]);

  // A new upload can push a photo onto the next page; show each photo once.
  const seen = new Set<string>();
  const items =
    newestData === undefined || newestData === null
      ? newestData
      : [...newestData.data, ...older].filter((item) => {
          if (seen.has(item.public_id)) return false;
          seen.add(item.public_id);

          return true;
        });

  return {
    items,
    waiting,
    refreshing: newest.refreshing,
    notice: newest.notice,
    loadingMore,
    refresh,
    loadMore,
  };
}
