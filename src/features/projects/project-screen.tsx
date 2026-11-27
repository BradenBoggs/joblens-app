import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { EmptyState } from '@/components/empty-state';
import { NavigationButton } from '@/components/navigation-button';
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
 * A plain project page: what the phone knows about the project and the way
 * into the camera. The app shell owns its bars and final layout.
 */
export function ProjectScreen({ projectId }: { projectId: string }) {
  const insets = useSafeAreaInsets();
  const { project, details, pendingUploads, refreshing, notice, refresh } = useProject(projectId);

  if (project === undefined) return null;

  if (project === null) {
    return (
      <View style={[styles.screen, styles.content]}>
        <EmptyState
          icon="folder-open-outline"
          title="This project isn't on this phone"
          description="It may have been archived or removed. Refresh your project list with a connection."
        />
        <NavigationButton href="/projects" label="Back to projects" replace />
      </View>
    );
  }

  const customer = details?.customer_contact;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} />}
    >
      <View style={styles.section}>
        <AppText variant="title" accessibilityRole="header">
          {project.name}
        </AppText>
        {project.address ? <AppText muted>{project.address}</AppText> : null}
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
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xl,
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
