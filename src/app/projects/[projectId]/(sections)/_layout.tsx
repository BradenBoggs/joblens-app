import { useLocalSearchParams } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { ProjectProvider } from '@/features/projects/project-context';

/**
 * The sections of one project. They keep their own state while you switch
 * between them and share one copy of the project. The bars are drawn by the
 * app shell on each page, so the navigator draws none.
 */
export default function ProjectSectionsLayout() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();

  return (
    <ProjectProvider projectId={projectId}>
      <Tabs screenOptions={{ headerShown: false }} tabBar={() => null}>
        <Tabs.Screen name="index" options={{ title: 'Media' }} />
        <Tabs.Screen name="checklists" options={{ title: 'Checklists' }} />
        <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
        <Tabs.Screen name="more" options={{ title: 'More' }} />
      </Tabs>
    </ProjectProvider>
  );
}
