import { EmptyState } from '@/components/empty-state';
import { SkeletonRows } from '@/components/skeleton';
import { ProjectShell } from '@/features/projects/project-shell';

/**
 * The project's chat. The phone cannot read or send messages yet, so this
 * says so plainly instead of showing an empty conversation.
 */
export function ProjectChatScreen() {
  return (
    <ProjectShell section="Chat" skeleton={<SkeletonRows count={4} icon />}>
      <EmptyState
        icon="chatbubble-outline"
        title="Chat isn't in the app yet"
        description="For now, read and send this project's messages in JobLens on the web."
      />
    </ProjectShell>
  );
}
