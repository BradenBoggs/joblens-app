import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { EmptyState } from '@/components/empty-state';
import { colors, layout, spacing, typography } from '@/theme/tokens';

import { useProjects } from './use-projects';

export function ProjectsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
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
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search projects"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Search projects"
            style={styles.search}
          />
        </View>
      }
      ListEmptyComponent={
        projects === null ? undefined : (
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${item.name}`}
          onPress={() =>
            router.push({
              pathname: '/projects/[projectId]',
              params: { projectId: item.public_id },
            })
          }
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        >
          <View style={styles.rowText}>
            <AppText variant="label">{item.name}</AppText>
            {item.address ? (
              <AppText variant="caption" muted numberOfLines={1}>
                {item.address}
              </AppText>
            ) : null}
            {pending[item.public_id] ? (
              <AppText variant="caption" style={styles.pending}>
                {pending[item.public_id]} photos waiting to upload
              </AppText>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Pressable>
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
  search: {
    ...typography.body,
    minHeight: layout.touchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: layout.radius,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radius,
  },
  rowPressed: { backgroundColor: colors.surface },
  rowText: { flex: 1, gap: 2 },
  pending: { color: colors.brandText },
});
