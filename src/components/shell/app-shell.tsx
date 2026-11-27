import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, spacing } from '@/theme/tokens';

type AppShellProps = PropsWithChildren<{
  /** Slot above the content. Leave empty for a page with no top bar. */
  topBar?: ReactNode;
  /** Slot below the content. Leave empty to hide the bottom bar on this page. */
  bottomBar?: ReactNode;
  /** Set to false when the content scrolls itself, such as a list. */
  scroll?: boolean;
}>;

/**
 * The frame every screen is built on: a top bar slot, the content, and a
 * bottom bar slot. Each page chooses what goes in the two bar slots, so the
 * bars can change or disappear from page to page. The bars own the safe areas
 * at their edge; the shell covers an edge whose slot is empty.
 */
export function AppShell({ topBar, bottomBar, scroll = true, children }: AppShellProps) {
  const insets = useSafeAreaInsets();
  const top = topBar ? 0 : insets.top;
  const bottom = bottomBar ? 0 : insets.bottom;

  return (
    <View style={styles.shell}>
      {topBar}
      {scroll ? (
        <ScrollView
          style={styles.body}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: top + spacing.lg,
              paddingBottom: bottom + spacing.xxl,
              paddingLeft: Math.max(spacing.gutter, insets.left),
              paddingRight: Math.max(spacing.gutter, insets.right),
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.body,
            {
              paddingTop: top,
              paddingBottom: bottom,
              paddingLeft: insets.left,
              paddingRight: insets.right,
            },
          ]}
        >
          {children}
        </View>
      )}
      {bottomBar}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: layout.contentWidth,
    alignSelf: 'center',
    gap: spacing.xl,
  },
});
