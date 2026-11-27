import { MainTabShell } from '@/features/navigation/main-tab-shell';
import { UploadsScreen } from '@/features/uploads/uploads-screen';

export default function UploadsRoute() {
  return (
    <MainTabShell scroll={false}>
      <UploadsScreen />
    </MainTabShell>
  );
}
