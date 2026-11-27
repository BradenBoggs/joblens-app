import { type Href, usePathname, useRouter } from 'expo-router';
import { type ComponentProps } from 'react';

import { BottomBar, BottomBarAction, BottomBarItem } from '@/components/shell/bottom-bar';

type Section = {
  /** The last part of the address; empty for Media, the section a project opens on. */
  path: '' | '/checklists' | '/chat' | '/more';
  label: string;
  icon: ComponentProps<typeof BottomBarItem>['icon'];
  activeIcon: ComponentProps<typeof BottomBarItem>['icon'];
};

const media: Section = { path: '', label: 'Media', icon: 'images-outline', activeIcon: 'images' };
const checklists: Section = {
  path: '/checklists',
  label: 'Checklists',
  icon: 'checkbox-outline',
  activeIcon: 'checkbox',
};
const chat: Section = {
  path: '/chat',
  label: 'Chat',
  icon: 'chatbubble-outline',
  activeIcon: 'chatbubble',
};
const more: Section = {
  path: '/more',
  label: 'More',
  icon: 'ellipsis-horizontal',
  activeIcon: 'ellipsis-horizontal',
};

/**
 * The bottom bar inside a project: Media, Checklists, the camera, Chat and
 * More. The camera is the one orange button and opens over both bars.
 */
export function ProjectTabBar({ projectId }: { projectId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const base = `/projects/${projectId}`;

  const item = (section: Section) => (
    <BottomBarItem
      key={section.label}
      icon={section.icon}
      activeIcon={section.activeIcon}
      label={section.label}
      active={pathname === `${base}${section.path}`}
      onPress={() => router.navigate(`${base}${section.path}` as Href)}
    />
  );

  return (
    <BottomBar>
      {item(media)}
      {item(checklists)}
      <BottomBarAction
        icon="camera"
        label="Take photos"
        onPress={() =>
          router.navigate({ pathname: '/projects/[projectId]/camera', params: { projectId } })
        }
      />
      {item(chat)}
      {item(more)}
    </BottomBar>
  );
}
