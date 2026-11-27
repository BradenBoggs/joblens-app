import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { EmptyState } from '@/components/empty-state';
import { SkeletonCards } from '@/components/skeleton';
import { colors, layout, spacing, typography } from '@/theme/tokens';

import { ProjectCard } from './project-card';
import { useProjects } from './use-projects';

export function ProjectsScreen() {
  const router = useRouter();
  const { projects, pendingUploads: pending, refreshing, notice, refresh } = useProjects();
  const [search, setSearch] = useState('');

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
          accessibilityLabel={`Open ${item.name}`}
          onPress={() =>
            router.push({
              pathname: '/projects/[projectId]',
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
