import { FeedScreen } from '@/features/feed/feed-screen';
import { MainTabShell } from '@/features/navigation/main-tab-shell';

export default function FeedRoute() {
  return (
    <MainTabShell>
      <FeedScreen />
    </MainTabShell>
  );
}
