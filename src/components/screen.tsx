import type { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { AppShell } from '@/components/shell/app-shell';
import { spacing } from '@/theme/tokens';

type PageHeadingProps = {
  title: string;
  description?: string;
};

/** The large title at the top of a page's content, with an optional line under it. */
export function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <View style={styles.heading}>
      <AppText variant="title" accessibilityRole="header">
        {title}
      </AppText>
      {description && <AppText muted>{description}</AppText>}
    </View>
  );
}

type ScreenProps = PropsWithChildren<
  PageHeadingProps & {
    topBar?: ReactNode;
    bottomBar?: ReactNode;
  }
>;

/** A scrolling page on the app shell that opens with a large title. */
export function Screen({ title, description, topBar, bottomBar, children }: ScreenProps) {
  return (
    <AppShell topBar={topBar} bottomBar={bottomBar}>
      <PageHeading title={title} description={description} />
      {children}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heading: { gap: spacing.sm },
});
