import { type Href, usePathname, useRouter } from 'expo-router';
import { type ComponentProps, useEffect, useState } from 'react';

import { BottomBar, BottomBarItem } from '@/components/shell/bottom-bar';
import { pendingCount, subscribeToCaptures } from '@/features/uploads/captures';

type Tab = {
  href: Href;
  label: string;
  icon: ComponentProps<typeof BottomBarItem>['icon'];
  activeIcon: ComponentProps<typeof BottomBarItem>['icon'];
};

const tabs: Tab[] = [
  { href: '/', label: 'Feed', icon: 'albums-outline', activeIcon: 'albums' },
  { href: '/projects', label: 'Projects', icon: 'folder-open-outline', activeIcon: 'folder-open' },
  { href: '/uploads', label: 'Uploads', icon: 'cloud-upload-outline', activeIcon: 'cloud-upload' },
  { href: '/account', label: 'Account', icon: 'person-outline', activeIcon: 'person' },
];

/**
 * The bottom bar for the app's main tabs. Uploads shows how many photos are still
 * waiting. It has no camera button: photos are taken from inside a project or collection.
 */
export function MainTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [waiting, setWaiting] = useState(0);

  useEffect(() => {
    const load = () => void pendingCount().then(setWaiting);
    load();

    return subscribeToCaptures(load);
  }, []);

  return (
    <BottomBar>
      {tabs.map((tab) => (
        <BottomBarItem
          key={tab.label}
          icon={tab.icon}
          activeIcon={tab.activeIcon}
          label={tab.label}
          active={pathname === tab.href}
          badge={tab.href === '/uploads' ? waiting : 0}
          onPress={() => router.navigate(tab.href)}
        />
      ))}
    </BottomBar>
  );
}
