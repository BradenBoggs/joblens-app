import Constants from 'expo-constants';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Screen } from '@/components/screen';
import { useAuth } from '@/features/auth/auth-provider';
import { pendingCount } from '@/features/uploads/captures';
import { colors, layout, spacing } from '@/theme/tokens';

export function AccountScreen() {
  const { member, signOut } = useAuth();

  async function confirmSignOut() {
    const waiting = await pendingCount();
    Alert.alert(
      'Sign out?',
      waiting > 0
        ? `${waiting} photos haven't uploaded yet. Signing out deletes them from this phone.`
        : 'You will need a connection to sign in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: waiting > 0 ? 'Delete and sign out' : 'Sign out',
          style: 'destructive',
          onPress: () => void signOut(),
        },
      ],
    );
  }

  return (
    <Screen title="Your account">
      <View style={styles.details}>
        <AppText variant="label">{member?.user.name ?? 'Signed in'}</AppText>
        {member && (
          <>
            <AppText variant="caption" muted>
              {member.user.email}
            </AppText>
            <AppText variant="caption" muted>
              {member.organization.name}
            </AppText>
          </>
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => void confirmSignOut()}
        style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
      >
        <AppText variant="label">Sign out</AppText>
      </Pressable>
      <AppText variant="caption" muted>
        JobLens app version {Constants.expoConfig?.version ?? 'development'}
      </AppText>
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
  signOut: {
    minHeight: layout.touchTarget,
    borderRadius: layout.radius,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: colors.surface },
});
