import Ionicons from '@expo/vector-icons/Ionicons';
import { type ComponentProps, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { EmptyState } from '@/components/empty-state';
import { SkeletonCards } from '@/components/skeleton';
import { useCurrentProject } from '@/features/projects/project-context';
import { ProjectShell } from '@/features/projects/project-shell';
import { useProjectSection } from '@/features/projects/use-project-section';
import { colors, layout, spacing } from '@/theme/tokens';

import { type Checklist, type ChecklistItem, downloadChecklists } from './project-checklists';

/**
 * A project's Checklists section: each checklist with its progress, opening
 * to show its items. Reading only for now; answering items comes next.
 */
export function ProjectChecklistsScreen() {
  const { projectId } = useCurrentProject();
  const {
    data: checklists,
    refreshing,
    notice,
    refresh,
  } = useProjectSection(projectId, 'checklists', downloadChecklists);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <ProjectShell section="Checklists" skeleton={<SkeletonCards count={3} />} scroll={false}>
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

        {checklists === undefined ? (
          <SkeletonCards count={3} />
        ) : checklists === null ? (
          <EmptyState
            icon="checkbox-outline"
            title="Checklists couldn't be loaded"
            description="Pull down to try again when you have a connection."
          />
        ) : checklists.length === 0 ? (
          <EmptyState
            icon="checkbox-outline"
            title="No checklists yet"
            description="Checklists are added to a project in JobLens on the web."
          />
        ) : (
          <>
            {checklists.map((checklist) => (
              <ChecklistCard
                key={checklist.public_id}
                checklist={checklist}
                open={open === checklist.public_id}
                onToggle={() =>
                  setOpen((current) =>
                    current === checklist.public_id ? null : checklist.public_id,
                  )
                }
              />
            ))}
            <AppText variant="caption" muted style={styles.footnote}>
              You can read checklists here. Answer them in JobLens on the web for now.
            </AppText>
          </>
        )}
      </ScrollView>
    </ProjectShell>
  );
}

function ChecklistCard({
  checklist,
  open,
  onToggle,
}: {
  checklist: Checklist;
  open: boolean;
  onToggle: () => void;
}) {
  const total = checklist.items.length;
  const addressed = checklist.counts.completed + checklist.counts.not_applicable;
  const progress = total > 0 ? addressed / total : 0;

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${checklist.name}, ${addressed} of ${total} done`}
        onPress={onToggle}
        style={({ pressed }) => [styles.cardHeader, pressed && styles.pressed]}
      >
        <View style={styles.cardText}>
          <AppText variant="barTitle">{checklist.name}</AppText>
          {checklist.description ? (
            <AppText variant="caption" muted numberOfLines={open ? undefined : 2}>
              {checklist.description}
            </AppText>
          ) : null}
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          <AppText variant="caption" muted>
            {addressed} of {total} done
          </AppText>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
      </Pressable>

      {open
        ? checklist.items.map((item) => <ChecklistItemRow key={item.public_id} item={item} />)
        : null}
    </View>
  );
}

const stateIcons: Record<
  ChecklistItem['state'],
  { name: ComponentProps<typeof Ionicons>['name']; color: string; label: string }
> = {
  open: { name: 'ellipse-outline', color: colors.placeholder, label: 'To do' },
  completed: { name: 'checkmark-circle', color: colors.successText, label: 'Done' },
  not_applicable: { name: 'remove-circle-outline', color: colors.muted, label: 'Not applicable' },
};

function ChecklistItemRow({ item }: { item: ChecklistItem }) {
  const state = stateIcons[item.state] ?? stateIcons.open;
  const note = item.state === 'not_applicable' ? item.not_applicable_reason : item.response_note;
  const addressed = [
    item.addressed_by,
    item.addressed_at ? new Date(item.addressed_at).toLocaleDateString() : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.item} accessible accessibilityLabel={`${state.label}: ${item.title}`}>
      <Ionicons name={state.name} size={22} color={state.color} />
      <View style={styles.itemText}>
        <AppText variant="label">{item.title}</AppText>
        {item.instructions ? (
          <AppText variant="caption" muted>
            {item.instructions}
          </AppText>
        ) : null}
        {item.photo_required || item.photo_count > 0 ? (
          <View style={styles.photoLine}>
            <Ionicons name="camera-outline" size={14} color={colors.muted} />
            <AppText variant="caption" muted>
              {item.photo_count > 0
                ? `${item.photo_count} ${item.photo_count === 1 ? 'photo' : 'photos'}`
                : 'Photo required'}
            </AppText>
          </View>
        ) : null}
        {note ? <AppText variant="caption">{note}</AppText> : null}
        {addressed && item.state !== 'open' ? (
          <AppText variant="caption" muted>
            {state.label} · {addressed}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
    width: '100%',
    maxWidth: layout.contentWidth,
    alignSelf: 'center',
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radius,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    minHeight: layout.touchTarget,
  },
  pressed: { backgroundColor: colors.surface },
  cardText: { flex: 1, gap: spacing.xs },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3, backgroundColor: colors.successText },
  item: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemText: { flex: 1, gap: 2 },
  photoLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  footnote: { textAlign: 'center', paddingTop: spacing.sm },
});
