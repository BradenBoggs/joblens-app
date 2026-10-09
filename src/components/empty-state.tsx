import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { colors, layout, spacing } from '@/theme/tokens';

type EmptyStateProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View
        style={styles.icon}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Ionicons name={icon} size={28} color={colors.brandText} />
      </View>
      <View style={styles.copy}>
        <AppText variant="heading" accessibilityRole="header" style={styles.centered}>
          {title}
        </AppText>
        <AppText muted style={styles.centered}>
          {description}
        </AppText>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    gap: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radius,
    backgroundColor: colors.background,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: layout.radius,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { gap: spacing.sm, maxWidth: 420 },
  centered: { textAlign: 'center' },
});
