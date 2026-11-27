import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  type DimensionValue,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, layout, spacing } from '@/theme/tokens';

type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

/**
 * A grey placeholder shape for content that is still loading. Give it the size
 * of what it stands in for so the page does not jump when the content arrives.
 * It pulses gently, and stays still when the phone is set to reduce motion.
 */
export function Skeleton({ width = '100%', height = 14, radius = 6, style }: SkeletonProps) {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    let pulse: Animated.CompositeAnimation | undefined;
    let cancelled = false;

    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled || reduceMotion) return;

      pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
      );
      pulse.start();
    });

    return () => {
      cancelled = true;
      pulse?.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.shape, { width, height, borderRadius: radius, opacity }, style]}
    />
  );
}

type SkeletonRowsProps = {
  count?: number;
  /** Leave room for a leading icon, as in project and checklist rows. */
  icon?: boolean;
};

/** Placeholder list rows in the same shape as the app's bordered rows. */
export function SkeletonRows({ count = 4, icon = false }: SkeletonRowsProps) {
  return (
    <View
      style={styles.rows}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={styles.row}>
          {icon && <Skeleton width={22} height={22} />}
          <View style={styles.rowText}>
            <Skeleton width="60%" />
            <Skeleton width="40%" height={10} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  shape: { backgroundColor: colors.surface },
  rows: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radius,
  },
  rowText: { flex: 1, gap: spacing.sm },
});
