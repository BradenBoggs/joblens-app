import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { colors, layout, spacing, typography } from '@/theme/tokens';

function BrandTitle() {
  return (
    <View style={styles.brand}>
      <Image
        source={require('@/assets/brand/icon.png')}
        style={styles.brandIcon}
        accessible={false}
      />
      <AppText variant="heading">JobLens</AppText>
    </View>
  );
}

function AccountButton() {
  const router = useRouter();

  return (
    <Pressable
      accessibilityLabel="Open account"
      accessibilityRole="button"
      onPress={() => router.navigate('/account')}
      style={({ pressed }) => [styles.accountButton, pressed && styles.pressed]}
    >
      <Ionicons name="person-outline" size={22} color={colors.secondary} />
    </Pressable>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const tabBarHeight = Math.max(64, 44 + typography.caption.lineHeight * fontScale) + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerTitle: () => <BrandTitle />,
        headerTitleAlign: 'left',
        headerRight: () => <AccountButton />,
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.brandText,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: typography.caption,
        tabBarStyle: {
          height: tabBarHeight,
          paddingTop: spacing.xs,
          paddingBottom: Math.max(spacing.xs, insets.bottom),
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarItemStyle: { minHeight: layout.touchTarget },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'albums' : 'albums-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'folder-open' : 'folder-open-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandIcon: { width: 28, height: 28 },
  accountButton: {
    width: layout.touchTarget,
    minHeight: layout.touchTarget,
    marginRight: spacing.sm,
    borderRadius: layout.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: colors.surface },
});
