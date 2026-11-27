import { Tabs } from 'expo-router/js-tabs';

/**
 * The main tabs keep their own state while you switch between them. The bars
 * are drawn by the app shell on each page, so the navigator draws none.
 */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={() => null}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="projects" options={{ title: 'Projects' }} />
      <Tabs.Screen name="account" options={{ title: 'Account' }} />
    </Tabs>
  );
}
