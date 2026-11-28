import { createContext, type PropsWithChildren, use } from 'react';

import { useProject } from './use-project';

type ProjectContextValue = ReturnType<typeof useProject> & { projectId: string };

const ProjectContext = createContext<ProjectContextValue | null>(null);

/** Loads one project once and shares it with every section of the project. */
export function ProjectProvider({ projectId, children }: PropsWithChildren<{ projectId: string }>) {
  const value = useProject(projectId);

  return <ProjectContext value={{ ...value, projectId }}>{children}</ProjectContext>;
}

/** The project the current section belongs to. See `useProject` for the fields. */
export function useCurrentProject(): ProjectContextValue {
  const value = use(ProjectContext);
  if (!value) {
    throw new Error('useCurrentProject must be used inside a ProjectProvider.');
  }

  return value;
}
