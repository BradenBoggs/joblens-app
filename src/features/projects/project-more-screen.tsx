import Ionicons from '@expo/vector-icons/Ionicons';
import { type Href, useRouter } from 'expo-router';
import { type ComponentProps } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { SkeletonRows } from '@/components/skeleton';
import { colors, layout, spacing } from '@/theme/tokens';

import { useCurrentProject } from './project-context';
import { ProjectShell } from './project-shell';

type SectionRow = {
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  count: number;
  /** Where the row goes. Rows for sections the app can't open yet have none. */
  href?: Href;
};

/**
 * A project's More section: how much the project holds, and its details
 * (address, customer, description). Sections the app can't open yet show
 * their count without a link.
 */
export function ProjectMoreScreen() {
  const router = useRouter();
  const { project, projectId, details, pendingUploads, refreshing, notice, refresh } =
    useCurrentProject();

  const base = `/projects/${projectId}`;
  const rows: SectionRow[] = details
    ? [
        { label: 'Media', icon: 'images-outline', count: details.counts.media, href: base as Href },
        {
          label: 'Checklists',
          icon: 'checkbox-outline',
          count: details.counts.checklists,
          href: `${base}/checklists` as Href,
        },
        { label: 'Collections', icon: 'albums-outline', count: details.counts.collections },
        { label: 'Requests', icon: 'mail-outline', count: details.counts.requests },
      ]
    : [];
  const customer = details?.customer_contact;
  const closed = project?.status === 'closed';

  return (
    <ProjectShell section="More" skeleton={<SkeletonRows count={5} icon />} scroll={false}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} />}
      >
        {notice ? (
          <AppText variant="caption" muted accessibilityLiveRegion="polite">
            {notice}
          </AppText>
        ) : null}

        {pendingUploads > 0 ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/uploads')}
            style={({ pressed }) => [styles.row, styles.bordered, pressed && styles.pressed]}
          >
            <Ionicons name="cloud-upload-outline" size={22} color={colors.secondary} />
            <AppText variant="label" style={styles.rowLabel}>
              {pendingUploads} {pendingUploads === 1 ? 'photo' : 'photos'} waiting to upload
            </AppText>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        ) : null}

        <View style={styles.section}>
          <AppText variant="label" muted accessibilityRole="header">
            In this project
          </AppText>
          {details ? (
            <View style={styles.bordered}>
              {rows.map((row, index) => (
                <Pressable
                  key={row.label}
                  accessibilityRole={row.href ? 'button' : 'text'}
                  accessibilityLabel={`${row.label}, ${row.count}`}
                  disabled={!row.href}
                  onPress={() => row.href && router.navigate(row.href)}
                  style={({ pressed }) => [
                    styles.row,
                    index > 0 && styles.divided,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name={row.icon} size={22} color={colors.secondary} />
                  <AppText variant="label" style={styles.rowLabel}>
                    {row.label}
                  </AppText>
                  <AppText muted>{row.count}</AppText>
                  {row.href ? (
                    <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                  ) : (
                    <View style={styles.chevronSpace} />
                  )}
                </Pressable>
              ))}
            </View>
          ) : (
            <SkeletonRows count={4} icon />
          )}
          {details ? (
            <AppText variant="caption" muted>
              Collections and requests open in JobLens on the web for now.
            </AppText>
          ) : null}
        </View>

        <View style={styles.section}>
          <AppText variant="label" muted accessibilityRole="header">
            Details
          </AppText>
          <View style={[styles.bordered, styles.details]}>
            <Detail
              label="Status"
              value={details?.archived_at ? 'Archived' : closed ? 'Closed' : 'Open'}
            />
            <Detail label="Address" value={project?.address} />
            <Detail label="Description" value={details?.description} />
            <Detail label="Created by" value={details?.creator?.name} />
          </View>
        </View>

        {customer ? (
          <View style={styles.section}>
            <AppText variant="label" muted accessibilityRole="header">
              Customer
            </AppText>
            <View style={[styles.bordered, styles.details]}>
              <Detail label="Name" value={customer.name} />
              <Detail label="Company" value={customer.company_name} />
              <Detail label="Phone" value={customer.phone} />
              <Detail label="Email" value={customer.email} />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </ProjectShell>
  );
}

/** One labelled fact. Hidden when the project has no value for it. */
function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;

  return (
    <View style={styles.detail}>
      <AppText variant="caption" muted>
        {label}
      </AppText>
      <AppText selectable>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
    width: '100%',
    maxWidth: layout.contentWidth,
    alignSelf: 'center',
  },
  section: { gap: spacing.sm },
  bordered: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radius,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: layout.touchTarget + spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  divided: { borderTopWidth: 1, borderTopColor: colors.border },
  pressed: { backgroundColor: colors.surface },
  rowLabel: { flex: 1 },
  chevronSpace: { width: 18 },
  details: { padding: spacing.lg, gap: spacing.md },
  detail: { gap: 2 },
});
