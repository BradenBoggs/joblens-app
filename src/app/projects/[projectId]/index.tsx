import { useLocalSearchParams } from 'expo-router';

import { ProjectScreen } from '@/features/projects/project-screen';

export default function ProjectRoute() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();

  return <ProjectScreen projectId={projectId} />;
}
