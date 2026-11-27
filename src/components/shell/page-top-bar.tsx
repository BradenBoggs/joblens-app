import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';

import { TopBar, TopBarButton, TopBarTitle } from './top-bar';

type PageTopBarProps = {
  title: string;
  subtitle?: string | null;
  /** Slot for up to two TopBarButtons on the right. */
  actions?: ReactNode;
  /** Slot under the bar, such as a segmented switch. */
  below?: ReactNode;
  /** Replaces the default back behaviour, for a page that must confirm before leaving. */
  onBack?: () => void;
};

/** The top bar for any page opened from another: back button, centred title, actions. */
export function PageTopBar({ title, subtitle, actions, below, onBack }: PageTopBarProps) {
  const router = useRouter();
  const goBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));

  return (
    <TopBar
      left={<TopBarButton icon="chevron-back" label="Back" onPress={goBack} />}
      center={<TopBarTitle title={title} subtitle={subtitle} />}
      right={actions}
      below={below}
    />
  );
}
