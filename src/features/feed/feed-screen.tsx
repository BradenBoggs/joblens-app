import { EmptyState } from '@/components/empty-state';
import { NavigationButton } from '@/components/navigation-button';
import { PageHeading } from '@/components/screen';
import { UploadNotice } from '@/features/uploads/upload-notice';

export function FeedScreen() {
  return (
    <>
      <PageHeading title="Home" description="Recent updates from your projects." />
      <UploadNotice />
      <EmptyState
        icon="albums-outline"
        title="Keep up with the work"
        description="Photos added, checklist items completed, and other project updates will appear here in a later version. For now, open a project to take photos."
        action={<NavigationButton href="/projects" label="View projects" />}
      />
    </>
  );
}
