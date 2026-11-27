import { MainTabShell } from '@/features/navigation/main-tab-shell';
import { ProjectsScreen } from '@/features/projects/projects-screen';

export default function ProjectsRoute() {
  return (
    <MainTabShell scroll={false}>
      <ProjectsScreen />
    </MainTabShell>
  );
}
