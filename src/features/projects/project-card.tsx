import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { colors, layout, spacing } from '@/theme/tokens';

import type { Project } from './project-cache';

type ProjectCardProps = {
  project: Project;
  /** Photos taken on this phone that have not reached JobLens yet. */
  waitingToUpload?: number;
  accessibilityLabel?: string;
  onPress: () => void;
};

/**
 * The project card, in the same style as the web app's phone-width card:
 * a preview square, the name with its Open or Closed tag, the address, and
 * when it last changed. Photo and checklist counts join it when the project
 * list from the server includes them.
 */
export function ProjectCard({
  project,
  waitingToUpload = 0,
  accessibilityLabel,
  onPress,
}: ProjectCardProps) {
  const closed = project.status === 'closed';
  const updated = formatUpdated(project.updated_at);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? project.name}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.preview}>
        <Ionicons name="images-outline" size={24} color={colors.placeholder} />
      </View>
      <View style={styles.text}>
        <View style={styles.titleRow}>
          <AppText variant="barTitle" numberOfLines={1} style={styles.title}>
            {project.name}
          </AppText>
          {project.status ? (
            <View style={[styles.tag, closed ? styles.tagClosed : styles.tagOpen]}>
              <AppText
                variant="micro"
                style={[styles.tagText, closed ? styles.tagTextClosed : styles.tagTextOpen]}
              >
                {closed ? 'Closed' : 'Open'}
              </AppText>
            </View>
          ) : null}
        </View>
        {project.address ? (
          <AppText variant="caption" muted numberOfLines={1}>
            {project.address}
          </AppText>
        ) : null}
        {waitingToUpload > 0 ? (
          <View style={styles.meta}>
            <Ionicons name="cloud-upload-outline" size={14} color={colors.brandText} />
            <AppText variant="micro" style={styles.waiting}>
              {waitingToUpload} {waitingToUpload === 1 ? 'photo' : 'photos'} waiting to upload
            </AppText>
          </View>
        ) : updated ? (
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={14} color={colors.muted} />
            <AppText variant="micro" muted>
              Updated {updated}
            </AppText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function formatUpdated(value: string | null): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const daysAgo = Math.floor((startOfToday.getTime() - date.getTime()) / 86_400_000) + 1;

  if (date >= startOfToday) return 'today';
  if (daysAgo === 1) return 'yesterday';

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  pressed: { backgroundColor: colors.surface },
  preview: {
    width: 72,
    height: 72,
    borderRadius: layout.radius,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1 },
  tag: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 6 },
  tagOpen: { backgroundColor: colors.successSoft },
  tagClosed: { backgroundColor: colors.surface },
  tagText: { fontWeight: '600' },
  tagTextOpen: { color: colors.successText },
  tagTextClosed: { color: colors.secondary },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  waiting: { color: colors.brandText },
});
