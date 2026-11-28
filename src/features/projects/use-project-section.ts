import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth/auth-provider';
import { ApiError } from '@/lib/api';

import { cachedSection, saveSection } from './section-cache';
import { refreshNotice } from './use-projects';

/**
 * One section of a project, such as its media or its checklists. It shows the
 * saved copy at once, then downloads a fresh one when there is signal.
 *
 * `data` is `undefined` while the phone reads its saved copy, and `null` when
 * nothing is saved and nothing could be downloaded.
 */
export function useProjectSection<T>(
  projectId: string,
  section: string,
  download: (projectId: string) => Promise<T>,
) {
  const { signOut } = useAuth();
  const [data, setData] = useState<T | null | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const fresh = await download(projectId);
      await saveSection(projectId, section, fresh);
      setData(fresh);
      setNotice(null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await signOut();

        return;
      }
      const saved = await cachedSection<T>(projectId, section);
      setData((current) => current ?? null);
      setNotice(
        error instanceof ApiError && (error.status === 403 || error.status === 404)
          ? 'This is not available to you any more.'
          : refreshNotice(error, saved?.refreshedAt ?? null),
      );
    } finally {
      setRefreshing(false);
    }
  }, [download, projectId, section, signOut]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const saved = await cachedSection<T>(projectId, section);
      if (cancelled) return;
      if (saved) setData(saved.data);
      await refresh();
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId, section, refresh]);

  return { data, refreshing, notice, refresh };
}
