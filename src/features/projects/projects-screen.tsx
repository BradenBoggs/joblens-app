import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';

export function ProjectsScreen() {
  return (
    <Screen title="Projects" description="Everything you need for the job." preview>
      <EmptyState
        icon="folder-open-outline"
        title="Your projects belong here"
        description="Your project list is not connected yet. Once connected, open a project to work with its media, checklists, collections, and sharing."
      />
    </Screen>
  );
}
