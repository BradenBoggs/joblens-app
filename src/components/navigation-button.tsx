import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/app-text';
import { colors, layout, spacing } from '@/theme/tokens';

type NavigationButtonProps = {
  href: Href;
  label: string;
  replace?: boolean;
};

export function NavigationButton({ href, label, replace = false }: NavigationButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => (replace ? router.replace(href) : router.navigate(href))}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <AppText variant="label" style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: layout.touchTarget,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: layout.radius,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: { backgroundColor: colors.brandPressed },
  label: { textAlign: 'center' },
});
