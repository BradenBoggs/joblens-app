import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth/auth-provider';
import { pendingCountsByProject, subscribeToCaptures } from '@/features/uploads/captures';
import { ApiError } from '@/lib/api';

import {
  cachedProject,
  cachedProjectDetails,
  type Project,
  type ProjectDetails,
  refreshProjectDetails,
} from './project-cache';
import { refreshNotice } from './use-projects';

/**
 * One project for its page. It shows the saved details (or the list row) at
 * once, then downloads fresh details when there is signal.
 *
 * `project` is `undefined` while the phone is reading its saved copy and `null`
 * when the project isn't in the phone's project list.
 * `details` is null until details have been downloaded at least once.
 */
export function useProject(publicId: string) {
  const { signOut } = useAuth();
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [details, setDetails] = useState<ProjectDetails | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [pendingUploads, setPendingUploads] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const fresh = await refreshProjectDetails(publicId);
      if (fresh) {
        setProject(fresh);
        setDetails(fresh);
        setSavedAt(new Date());
        setNotice(null);
      } else {
        // The server has no details for it. Keep it open from the list row if it is still listed.
        setProject(await cachedProject(publicId));
        setDetails(null);
        setSavedAt(null);
        setNotice("This project's details couldn't be loaded from JobLens.");
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await signOut();

        return;
      }
      setNotice(refreshNotice(error, (await cachedProjectDetails(publicId))?.refreshedAt ?? null));
    } finally {
      setRefreshing(false);
    }
  }, [publicId, signOut]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const saved = await cachedProjectDetails(publicId);
      const listed = saved ? null : await cachedProject(publicId);
      if (cancelled) return;
      setProject(saved?.project ?? listed);
      setDetails(saved?.project ?? null);
      setSavedAt(saved?.refreshedAt ?? null);
      await refresh();
    })();

    return () => {
      cancelled = true;
    };
  }, [publicId, refresh]);

  useEffect(() => {
    const load = () =>
      void pendingCountsByProject().then((counts) => setPendingUploads(counts[publicId] ?? 0));
    load();

    return subscribeToCaptures(load);
  }, [publicId]);

  return { project, details, savedAt, pendingUploads, refreshing, notice, refresh };
}
