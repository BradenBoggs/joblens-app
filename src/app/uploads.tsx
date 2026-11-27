import { AppShell } from '@/components/shell/app-shell';
import { PageTopBar } from '@/components/shell/page-top-bar';
import { UploadsScreen } from '@/features/uploads/uploads-screen';

export default function UploadsRoute() {
  return (
    <AppShell scroll={false} topBar={<PageTopBar title="Photo uploads" />}>
      <UploadsScreen />
    </AppShell>
  );
}
