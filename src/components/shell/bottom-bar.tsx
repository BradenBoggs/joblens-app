import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { colors, layout, shell, spacing } from '@/theme/tokens';

/**
 * The bottom bar frame. It owns the home-indicator safe area; pages fill it
 * with BottomBarItems for navigation, or with any other controls.
 */
export function BottomBar({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(spacing.xs, insets.bottom),
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      {children}
    </View>
  );
}

type IconName = ComponentProps<typeof Ionicons>['name'];

type BottomBarItemProps = {
  icon: IconName;
  /** Icon for the current page. Defaults to icon. */
  activeIcon?: IconName;
  label: string;
  active?: boolean;
  /** A count shown on the icon. Hidden at zero. */
  badge?: number;
  onPress: () => void;
};

/** One destination in a bottom bar. The label grows with the phone's text size. */
export function BottomBarItem({
  icon,
  activeIcon = icon,
  label,
  active = false,
  badge = 0,
  onPress,
}: BottomBarItemProps) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={badge > 0 ? `${label}, ${badge}` : label}
      onPress={onPress}
      style={styles.item}
    >
      {({ pressed }) => (
        <>
          <View style={[styles.icon, pressed && styles.iconPressed]}>
            <Ionicons
              name={active ? activeIcon : icon}
              size={shell.tabIcon}
              color={active ? colors.text : colors.muted}
            />
            {badge > 0 ? (
              <View style={styles.badge}>
                <AppText variant="micro" style={styles.badgeText}>
                  {badge > 99 ? '99+' : badge}
                </AppText>
              </View>
            ) : null}
          </View>
          <AppText
            variant="micro"
            numberOfLines={1}
            style={active ? styles.labelActive : styles.label}
          >
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

type BottomBarActionProps = {
  icon: IconName;
  /** Read aloud by screen readers; the button has no visible text. */
  label: string;
  onPress: () => void;
};

/**
 * The raised orange button for a page's one main action, placed between the
 * BottomBarItems. Taking photos uses it, and only in project and collection bars.
 */
export function BottomBarAction({ icon, label, onPress }: BottomBarActionProps) {
  return (
    <View style={styles.actionSlot}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
      >
        <Ionicons name={icon} size={shell.actionIcon} color={colors.onBrand} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
  },
  item: {
    flex: 1,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  icon: {
    minWidth: layout.touchTarget,
    height: 28,
    borderRadius: layout.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPressed: { backgroundColor: colors.surface },
  label: { color: colors.muted },
  labelActive: { color: colors.text, fontWeight: '600' },
  badge: {
    position: 'absolute',
    top: -6,
    left: 28,
    minWidth: 20,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: colors.brand,
    alignItems: 'center',
  },
  badgeText: { color: colors.onBrand, fontWeight: '600' },
  actionSlot: { flex: 1, alignItems: 'center' },
  // Sits above the bar's top edge; the white border separates it from content behind.
  action: {
    width: shell.actionButton,
    height: shell.actionButton,
    marginTop: -shell.actionLift,
    borderRadius: shell.actionRadius,
    borderWidth: 4,
    borderColor: colors.background,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 6px 16px rgba(255, 106, 33, 0.35)',
  },
  actionPressed: { backgroundColor: colors.brandPressed },
});
