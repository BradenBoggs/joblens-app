import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { EmptyState } from '@/components/empty-state';
import { NavigationButton } from '@/components/navigation-button';
import { Screen } from '@/components/screen';
import { CameraScreen } from '@/features/capture/camera-screen';
import { cachedProject, type Project } from '@/features/projects/project-cache';

export default function ProjectCameraRoute() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null | undefined>(undefined);

  useEffect(() => {
    void cachedProject(projectId).then(setProject);
  }, [projectId]);

  if (project === undefined) return null;

  if (project === null) {
    return (
      <Screen title="Project not found">
        <EmptyState
          icon="folder-open-outline"
          title="This project isn't on this phone"
          description="Refresh your project list with a connection, then try again."
        />
        <NavigationButton href="/projects" label="Back to projects" replace />
      </Screen>
    );
  }

  return <CameraScreen project={project} />;
}
