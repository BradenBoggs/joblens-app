import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { colors, layout, spacing } from '@/theme/tokens';

type ScreenProps = PropsWithChildren<{
  title: string;
  description?: string;
  preview?: boolean;
}>;

export function Screen({ title, description, preview = false, children }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingLeft: Math.max(spacing.gutter, insets.left),
          paddingRight: Math.max(spacing.gutter, insets.right),
          paddingBottom: Math.max(spacing.xxl, insets.bottom),
        },
      ]}
    >
      <View style={styles.heading}>
        {preview && (
          <AppText variant="caption" muted>
            App preview · Account not connected
          </AppText>
        )}
        <AppText variant="title" accessibilityRole="header">
          {title}
        </AppText>
        {description && <AppText muted>{description}</AppText>}
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    width: '100%',
    maxWidth: layout.contentWidth,
    alignSelf: 'center',
    paddingTop: spacing.xl,
    gap: spacing.xl,
    flexGrow: 1,
  },
  heading: { gap: spacing.sm },
});
