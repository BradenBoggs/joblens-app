import Ionicons from '@expo/vector-icons/Ionicons';
import { type ComponentProps, type ReactNode, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { colors, layout, shell, spacing } from '@/theme/tokens';

type TopBarProps = {
  /** Slot at the left edge, such as a back button or the JobLens mark. */
  left?: ReactNode;
  /** Slot centred in the bar, usually a TopBarTitle. */
  center?: ReactNode;
  /** Slot at the right edge, for up to two actions. */
  right?: ReactNode;
  /** Slot under the bar that stays in place while content scrolls, such as tabs or filters. */
  below?: ReactNode;
};

/**
 * The top bar frame. It owns the status bar safe area and the bar height;
 * pages fill its slots. The centre stays truly centred whatever the two sides hold.
 */
export function TopBar({ left, center, right, below }: TopBarProps) {
  const insets = useSafeAreaInsets();
  const [leftWidth, setLeftWidth] = useState(0);
  const [rightWidth, setRightWidth] = useState(0);
  const side = Math.max(leftWidth, rightWidth);
  const measure = (set: (width: number) => void) => (event: LayoutChangeEvent) =>
    set(Math.ceil(event.nativeEvent.layout.width));

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <View style={styles.bar}>
        {center ? (
          <View
            style={[
              styles.center,
              { paddingHorizontal: shell.barPadding + side + (side ? shell.barGap : 0) },
            ]}
          >
            {center}
          </View>
        ) : null}
        <View style={styles.side} onLayout={measure(setLeftWidth)}>
          {left}
        </View>
        <View style={styles.side} onLayout={measure(setRightWidth)}>
          {right}
        </View>
      </View>
      {below ? <View style={styles.below}>{below}</View> : null}
    </View>
  );
}

type TopBarTitleProps = {
  title: string;
  /** A quieter second line, such as the project a page belongs to. */
  subtitle?: string | null;
};

/** The centred page name. Long names shorten with an ellipsis instead of wrapping. */
export function TopBarTitle({ title, subtitle }: TopBarTitleProps) {
  return (
    <View style={styles.title}>
      <AppText variant="barTitle" numberOfLines={1} accessibilityRole="header">
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="micro" muted numberOfLines={1}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

type TopBarButtonProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  /** Read aloud by screen readers; icon buttons have no visible text. */
  label: string;
  onPress: () => void;
  /** A count shown on the corner, such as unread notifications. Hidden at zero. */
  badge?: number;
};

/** A bar icon button: a bare icon with a 48-point touch area. It only shows a background while pressed. */
export function TopBarButton({ icon, label, onPress, badge = 0 }: TopBarButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={badge > 0 ? `${label}, ${badge} new` : label}
      hitSlop={(layout.touchTarget - shell.barButton) / 2}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <Ionicons name={icon} size={shell.barIcon} color={colors.secondary} />
      {badge > 0 ? (
        <View style={styles.badge}>
          <AppText variant="micro" style={styles.badgeText}>
            {badge > 99 ? '99+' : badge}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  bar: {
    minHeight: shell.barHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: shell.barPadding,
  },
  side: { flexDirection: 'row', alignItems: 'center', gap: shell.barGap },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none',
  },
  title: { alignItems: 'center', maxWidth: '100%' },
  below: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  button: {
    width: shell.barButton,
    height: shell.barButton,
    borderRadius: layout.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { backgroundColor: colors.surface },
  badge: {
    position: 'absolute',
    top: 0,
    left: 22,
    minWidth: 20,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: colors.brand,
    alignItems: 'center',
  },
  badgeText: { color: colors.onBrand, fontWeight: '600' },
});
