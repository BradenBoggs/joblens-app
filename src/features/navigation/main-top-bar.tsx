import type { ReactNode } from 'react';
import { Image, StyleSheet } from 'react-native';

import { TopBar } from '@/components/shell/top-bar';
import { shell } from '@/theme/tokens';

type MainTopBarProps = {
  /** Slot for TopBarButtons on the right. */
  actions?: ReactNode;
  /** Slot under the bar, such as a search field or filters. */
  below?: ReactNode;
};

/** The top bar for the main tabs: the JobLens mark, and any actions the tab adds. */
export function MainTopBar({ actions, below }: MainTopBarProps) {
  return (
    <TopBar
      left={
        <Image
          source={require('@/assets/brand/icon.png')}
          style={styles.mark}
          accessibilityLabel="JobLens"
        />
      }
      right={actions}
      below={below}
    />
  );
}

const styles = StyleSheet.create({
  mark: { width: shell.brandMark, height: shell.brandMark, borderRadius: shell.brandMarkRadius },
});
