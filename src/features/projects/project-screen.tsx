import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { EmptyState } from '@/components/empty-state';
import { NavigationButton } from '@/components/navigation-button';
import { AppShell } from '@/components/shell/app-shell';
import { PageTopBar } from '@/components/shell/page-top-bar';
import { SkeletonRows } from '@/components/skeleton';
import { colors, layout, spacing } from '@/theme/tokens';

import type { ProjectDetails } from './project-cache';
import { useProject } from './use-project';

const sectionLabels: Record<keyof ProjectDetails['counts'], string> = {
  media: 'Media',
  collections: 'Collections',
  checklists: 'Checklists',
  requests: 'Requests',
};

/**
 * The project page: what the phone knows about the project and the way into
 * the camera. The project bottom bar (Media, Checklists, Camera, Chat, More)
 * comes with those sections.
 */
export function ProjectScreen({ projectId }: { projectId: string }) {
  const { project, details, pendingUploads, refreshing, notice, refresh } = useProject(projectId);

  if (project === undefined) {
    return (
      <AppShell topBar={<PageTopBar title="Project" />}>
        <SkeletonRows count={4} />
      </AppShell>
    );
  }

  if (project === null) {
    return (
      <AppShell topBar={<PageTopBar title="Project" />}>
        <EmptyState
          icon="folder-open-outline"
          title="This project isn't on this phone"
          description="It may have been archived or removed. Refresh your project list with a connection."
        />
        <NavigationButton href="/projects" label="Back to projects" replace />
      </AppShell>
    );
  }

  const customer = details?.customer_contact;

  return (
    <AppShell
      topBar={<PageTopBar title={project.name} subtitle={project.address} />}
      scroll={false}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} />}
      >
        {details?.archived_at || notice ? (
          <View style={styles.section}>
            {details?.archived_at ? (
              <AppText variant="caption" muted>
                Archived
              </AppText>
            ) : null}
            {notice ? (
              <AppText variant="caption" muted accessibilityLiveRegion="polite">
                {notice}
              </AppText>
            ) : null}
          </View>
        ) : null}

        <NavigationButton
          href={{ pathname: '/projects/[projectId]/camera', params: { projectId } }}
          label="Take photos"
        />
        {pendingUploads > 0 ? (
          <AppText variant="caption" style={styles.pending}>
            {pendingUploads} {pendingUploads === 1 ? 'photo' : 'photos'} waiting to upload
          </AppText>
        ) : null}

        {details ? (
          <View style={styles.counts}>
            {(Object.keys(sectionLabels) as (keyof ProjectDetails['counts'])[]).map((section) => (
              <View key={section} style={styles.count}>
                <AppText variant="heading">{details.counts[section]}</AppText>
                <AppText variant="caption" muted>
                  {sectionLabels[section]}
                </AppText>
              </View>
            ))}
          </View>
        ) : null}

        {customer ? (
          <View style={styles.section}>
            <AppText variant="label">Customer</AppText>
            {customer.name ? <AppText>{customer.name}</AppText> : null}
            {customer.company_name ? <AppText muted>{customer.company_name}</AppText> : null}
            {customer.phone ? <AppText muted>{customer.phone}</AppText> : null}
            {customer.email ? <AppText muted>{customer.email}</AppText> : null}
          </View>
        ) : null}

        {details?.description ? (
          <View style={styles.section}>
            <AppText variant="label">Description</AppText>
            <AppText>{details.description}</AppText>
          </View>
        ) : null}
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
    width: '100%',
    maxWidth: layout.contentWidth,
    alignSelf: 'center',
  },
  section: { gap: spacing.xs },
  pending: { color: colors.brandText, marginTop: -spacing.md },
  counts: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  count: {
    flexGrow: 1,
    flexBasis: '45%',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radius,
  },
});
