import type { PropsWithChildren } from 'react';

import { AppShell } from '@/components/shell/app-shell';

import { MainTabBar } from './main-tab-bar';
import { MainTopBar } from './main-top-bar';

type MainTabShellProps = PropsWithChildren<{
  /** Set to false when the tab's content scrolls itself, such as a list. */
  scroll?: boolean;
}>;

/** The shell for the app's main tabs: JobLens top bar and the tab bar. */
export function MainTabShell({ scroll, children }: MainTabShellProps) {
  return (
    <AppShell topBar={<MainTopBar />} bottomBar={<MainTabBar />} scroll={scroll}>
      {children}
    </AppShell>
  );
}
