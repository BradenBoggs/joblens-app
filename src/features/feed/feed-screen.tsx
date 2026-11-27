import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { EmptyState } from '@/components/empty-state';
import { NavigationButton } from '@/components/navigation-button';
import { PageHeading } from '@/components/screen';
import { SkeletonRows } from '@/components/skeleton';
import { cachedProjects, type Project, refreshProjects } from '@/features/projects/project-cache';
import { UploadNotice } from '@/features/uploads/upload-notice';
import { colors, layout, spacing } from '@/theme/tokens';

const recentProjectCount = 3;

/**
 * Home: what needs attention, then the projects worked on most recently. It
 * reads the list saved on the phone, so it works with no signal, and downloads
 * the list the first time. Project
 * updates join it when the app has an updates feed.
 */
export function FeedScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    const recent = (list: Project[]) =>
      [...list]
        .sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''))
        .slice(0, recentProjectCount);

    void cachedProjects()
      .then((saved) => (saved.length > 0 ? saved : refreshProjects().catch(() => saved)))
      .then((list) => setProjects(recent(list)));
  }, []);

  return (
    <>
      <PageHeading title="Home" />
      <UploadNotice />
      {projects?.length === 0 ? (
        <EmptyState
          icon="folder-open-outline"
          title="No projects yet"
          description="Projects created in JobLens appear here."
          action={<NavigationButton href="/projects" label="View projects" />}
        />
      ) : (
        <View style={styles.section}>
          <AppText variant="barTitle" accessibilityRole="header">
            Recent projects
          </AppText>
          {projects === null ? (
            <SkeletonRows count={recentProjectCount} icon />
          ) : (
            projects.map((project) => (
              <Pressable
                key={project.public_id}
                accessibilityRole="button"
                accessibilityLabel={`Take photos for ${project.name}`}
                onPress={() =>
                  router.push({
                    pathname: '/projects/[projectId]/camera',
                    params: { projectId: project.public_id },
                  })
                }
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <Ionicons name="folder-open-outline" size={22} color={colors.secondary} />
                <View style={styles.rowText}>
                  <AppText variant="label" numberOfLines={1}>
                    {project.name}
                  </AppText>
                  {project.address ? (
                    <AppText variant="caption" muted numberOfLines={1}>
                      {project.address}
                    </AppText>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </Pressable>
            ))
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
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
});
