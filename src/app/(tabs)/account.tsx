import { AccountScreen } from '@/features/account/account-screen';
import { MainTabShell } from '@/features/navigation/main-tab-shell';

export default function AccountRoute() {
  return (
    <MainTabShell>
      <AccountScreen />
    </MainTabShell>
  );
}
