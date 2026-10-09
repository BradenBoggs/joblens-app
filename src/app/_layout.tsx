import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { DefaultTheme, ThemeProvider, useRouter } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors, layout, typography } from '@/theme/tokens';

export { ErrorBoundary } from 'expo-router';

void SplashScreen.preventAutoHideAsync();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.brandText,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
  },
};

function CloseAccountButton() {
  const router = useRouter();

  return (
    <Pressable
      accessibilityLabel="Close account"
      accessibilityRole="button"
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
    >
      <Ionicons name="close-outline" size={26} color={colors.text} />
    </Pressable>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(Ionicons.font);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: typography.label,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="account"
          options={{
            title: 'Account',
            presentation: 'modal',
            headerBackVisible: false,
            headerLeft: () => <CloseAccountButton />,
          }}
        />
        <Stack.Screen name="+not-found" options={{ title: 'Page not found' }} />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    minHeight: layout.touchTarget,
    minWidth: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: layout.radius,
  },
  pressed: { backgroundColor: colors.surface },
});
