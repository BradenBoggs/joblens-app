import { useRouter } from 'expo-router';
import type { PropsWithChildren, ReactNode } from 'react';

import { EmptyState } from '@/components/empty-state';
import { NavigationButton } from '@/components/navigation-button';
import { AppShell } from '@/components/shell/app-shell';
import { PageTopBar } from '@/components/shell/page-top-bar';
import { ProjectTabBar } from '@/features/navigation/project-tab-bar';

import { useCurrentProject } from './project-context';

type ProjectShellProps = PropsWithChildren<{
  /** The section's name, shown under the project name in the top bar. */
  section: string;
  /** Shown while the phone reads its saved copy of the project. */
  skeleton: ReactNode;
  /** Set to false when the section scrolls itself, such as a list. */
  scroll?: boolean;
}>;

/**
 * The shell for every section of a project: the project's name with a back
 * button on top, the project bar below. It also covers the two states every
 * section shares: still loading, and a project that is no longer on the phone.
 */
export function ProjectShell({ section, skeleton, scroll, children }: ProjectShellProps) {
  const router = useRouter();
  const { project, projectId } = useCurrentProject();
  // Back leaves the project, whichever section is open.
  const leave = () => (router.canDismiss() ? router.dismiss() : router.replace('/projects'));

  if (project === undefined) {
    return (
      <AppShell
        topBar={<PageTopBar title="Project" subtitle={section} onBack={leave} />}
        bottomBar={<ProjectTabBar projectId={projectId} />}
      >
        {skeleton}
      </AppShell>
    );
  }

  if (project === null) {
    return (
      <AppShell topBar={<PageTopBar title="Project" onBack={leave} />}>
        <EmptyState
          icon="folder-open-outline"
          title="This project isn't on this phone"
          description="It may have been archived or removed. Pull down on Projects to refresh your list."
        />
        <NavigationButton href="/projects" label="Back to projects" replace />
      </AppShell>
    );
  }

  return (
    <AppShell
      topBar={<PageTopBar title={project.name} subtitle={section} onBack={leave} />}
      bottomBar={<ProjectTabBar projectId={projectId} />}
      scroll={scroll}
    >
      {children}
    </AppShell>
  );
}
