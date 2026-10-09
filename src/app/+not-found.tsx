import { EmptyState } from '@/components/empty-state';
import { NavigationButton } from '@/components/navigation-button';
import { Screen } from '@/components/screen';

export default function NotFoundScreen() {
  return (
    <Screen title="Page not found">
      <EmptyState
        icon="compass-outline"
        title="This page is not available"
        description="The link may be incomplete or point to a screen that is not available in this app."
        action={<NavigationButton href="/" label="Back to feed" replace />}
      />
    </Screen>
  );
}
