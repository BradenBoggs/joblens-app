import { EmptyState } from '@/components/empty-state';
import { NavigationButton } from '@/components/navigation-button';
import { AppShell } from '@/components/shell/app-shell';
import { PageTopBar } from '@/components/shell/page-top-bar';

export default function NotFoundScreen() {
  return (
    <AppShell topBar={<PageTopBar title="Page not found" />}>
      <EmptyState
        icon="compass-outline"
        title="This page is not available"
        description="The link may be incomplete or point to a screen that is not available in this app."
        action={<NavigationButton href="/" label="Back to feed" replace />}
      />
    </AppShell>
  );
}
