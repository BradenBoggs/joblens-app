import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { EmptyState } from '@/components/empty-state';
import { SkeletonCards } from '@/components/skeleton';
import { useAuth } from '@/features/auth/auth-provider';
import { pendingCountsByProject, subscribeToCaptures } from '@/features/uploads/captures';
import { ApiError } from '@/lib/api';
import { colors, layout, spacing, typography } from '@/theme/tokens';

import {
  cachedProjects,
  type Project,
  projectsRefreshedAt,
  refreshProjects,
} from './project-cache';
import { ProjectCard } from './project-card';

export function ProjectsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [pending, setPending] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
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
      const savedAt = await projectsRefreshedAt();
      setNotice(
        error instanceof ApiError && error.isOffline
          ? `Offline. Showing your saved list${savedAt ? ` from ${savedAt.toLocaleString()}` : ''}.`
          : error instanceof Error
            ? error.message
            : 'Projects could not be refreshed.',
      );
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
    const load = () => void pendingCountsByProject().then(setPending);
    load();

    return subscribeToCaptures(load);
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    return (projects ?? []).filter(
      (project) =>
        term === '' ||
        project.name.toLowerCase().includes(term) ||
        (project.address ?? '').toLowerCase().includes(term),
    );
  }, [projects, search]);

  return (
    <FlatList
      data={visible}
      keyExtractor={(project) => project.public_id}
      style={styles.list}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <AppText variant="title" accessibilityRole="header">
            Projects
          </AppText>
          {notice && (
            <AppText variant="caption" muted accessibilityLiveRegion="polite">
              {notice}
            </AppText>
          )}
          <View style={styles.search}>
            <Ionicons name="search" size={18} color={colors.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search projects"
              placeholderTextColor={colors.muted}
              accessibilityLabel="Search projects"
              autoCorrect={false}
              style={styles.searchInput}
            />
          </View>
        </View>
      }
      ListEmptyComponent={
        projects === null ? (
          <SkeletonCards count={4} />
        ) : (
          <EmptyState
            icon="folder-open-outline"
            title={search ? 'No matching projects' : 'No projects yet'}
            description={
              search
                ? 'Try a different name or address.'
                : 'Projects created in JobLens appear here. Pull down to refresh.'
            }
          />
        )
      }
      renderItem={({ item }) => (
        <ProjectCard
          project={item}
          waitingToUpload={pending[item.public_id] ?? 0}
          accessibilityLabel={`Take photos for ${item.name}`}
          onPress={() =>
            router.push({
              pathname: '/projects/[projectId]/camera',
              params: { projectId: item.public_id },
            })
          }
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
    width: '100%',
    maxWidth: layout.contentWidth,
    alignSelf: 'center',
  },
  header: { gap: spacing.md, marginBottom: spacing.sm },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.touchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: layout.radius,
    backgroundColor: colors.surface,
  },
  searchInput: { ...typography.body, flex: 1, color: colors.text },
});
