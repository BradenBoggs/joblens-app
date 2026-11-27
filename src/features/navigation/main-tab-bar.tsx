import { type Href, usePathname, useRouter } from 'expo-router';
import { type ComponentProps } from 'react';

import { BottomBar, BottomBarItem } from '@/components/shell/bottom-bar';

type Tab = {
  href: Href;
  label: string;
  icon: ComponentProps<typeof BottomBarItem>['icon'];
  activeIcon: ComponentProps<typeof BottomBarItem>['icon'];
};

const tabs: Tab[] = [
  { href: '/', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { href: '/projects', label: 'Projects', icon: 'folder-open-outline', activeIcon: 'folder-open' },
  { href: '/account', label: 'Account', icon: 'person-outline', activeIcon: 'person' },
];

/**
 * The bottom bar for the app's main tabs. It has no camera button: photos are
 * taken from inside a project or collection.
 */
export function MainTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <BottomBar>
      {tabs.map((tab) => (
        <BottomBarItem
          key={tab.label}
          icon={tab.icon}
          activeIcon={tab.activeIcon}
          label={tab.label}
          active={pathname === tab.href}
          onPress={() => router.navigate(tab.href)}
        />
      ))}
    </BottomBar>
  );
}
