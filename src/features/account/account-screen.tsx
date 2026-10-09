import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { colors, layout, spacing } from '@/theme/tokens';

export function AccountScreen() {
  return (
    <Screen title="Your account">
      <EmptyState
        icon="person-circle-outline"
        title="No account connected"
        description="This app preview does not sign in or access your projects. Your existing JobLens account will be used when mobile sign-in is available."
      />
      <View style={styles.details}>
        <AppText variant="label">JobLens</AppText>
        <AppText variant="caption" muted>
          App version {Constants.expoConfig?.version ?? 'development'}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  details: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: layout.radius,
    backgroundColor: colors.surface,
  },
});
