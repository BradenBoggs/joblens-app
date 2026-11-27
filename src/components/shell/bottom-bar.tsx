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
  const color = active ? colors.brandText : colors.muted;

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
            <Ionicons name={active ? activeIcon : icon} size={shell.tabIcon} color={color} />
            {badge > 0 ? (
              <View style={styles.badge}>
                <AppText variant="micro" style={styles.badgeText}>
                  {badge > 99 ? '99+' : badge}
                </AppText>
              </View>
            ) : null}
          </View>
          <AppText variant="micro" numberOfLines={1} style={[styles.label, { color }]}>
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: spacing.xs,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  item: {
    flex: 1,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  icon: {
    minWidth: 56,
    height: 28,
    borderRadius: layout.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPressed: { backgroundColor: colors.surface },
  label: { fontWeight: '600' },
  badge: {
    position: 'absolute',
    top: -4,
    left: 32,
    minWidth: 20,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: colors.brand,
    alignItems: 'center',
  },
  badgeText: { color: colors.onBrand, fontWeight: '600' },
});
