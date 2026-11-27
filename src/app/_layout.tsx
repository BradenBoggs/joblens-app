import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/features/auth/auth-provider';
import { registerBackgroundUploads } from '@/features/uploads/background-upload-task';
import { useUploadQueue } from '@/features/uploads/use-upload-queue';
import { colors } from '@/theme/tokens';

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
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppNavigator() {
  const { status } = useAuth();
  const signedIn = status === 'signed-in';

  useUploadQueue(signedIn);

  useEffect(() => {
    if (signedIn) {
      void registerBackgroundUploads();
    }
  }, [signedIn]);

  if (status === 'loading') return null;

  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
    >
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="projects/[projectId]/camera"
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}
