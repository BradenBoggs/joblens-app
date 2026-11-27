import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth/auth-provider';
import { pendingCountsByProject, subscribeToCaptures } from '@/features/uploads/captures';
import { ApiError } from '@/lib/api';

import {
  cachedProjects,
  type Project,
  projectsRefreshedAt,
  refreshProjects,
} from './project-cache';

/** The line shown above saved data when a refresh fails. */
export function refreshNotice(error: unknown, savedAt: Date | null): string {
  if (error instanceof ApiError && error.isOffline) {
    return `Offline. Showing what was saved${savedAt ? ` ${savedAt.toLocaleString()}` : ''}.`;
  }

  return error instanceof Error ? error.message : 'This could not be refreshed.';
}

/**
 * The project list: the saved copy first, then a download when there is
 * signal. `projects` is null only until the saved copy has been read.
 */
export function useProjects() {
  const { signOut } = useAuth();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [pendingUploads, setPendingUploads] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setProjects(await refreshProjects());
      setNotice(null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await signOut();

        return;
      }
      setNotice(refreshNotice(error, await projectsRefreshedAt()));
    } finally {
      setRefreshing(false);
    }
  }, [signOut]);

  useEffect(() => {
    void cachedProjects().then((saved) => {
      setProjects(saved);

      return refresh();
    });
  }, [refresh]);

  useEffect(() => {
    const load = () => void pendingCountsByProject().then(setPendingUploads);
    load();

    return subscribeToCaptures(load);
  }, []);

  return { projects, pendingUploads, refreshing, notice, refresh };
}
