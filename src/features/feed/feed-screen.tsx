import { EmptyState } from '@/components/empty-state';
import { NavigationButton } from '@/components/navigation-button';
import { Screen } from '@/components/screen';

export function FeedScreen() {
  return (
    <Screen title="Feed" description="Recent updates from your projects.">
      <EmptyState
        icon="albums-outline"
        title="Keep up with the work"
        description="Photos added, checklist items completed, and other project updates will appear here in a later version. For now, open a project to take photos."
        action={<NavigationButton href="/projects" label="View projects" />}
      />
    </Screen>
  );
}
