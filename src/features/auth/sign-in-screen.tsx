import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppText } from '@/components/app-text';
import { Screen } from '@/components/screen';
import { ApiError, isApiConfigured } from '@/lib/api';
import { colors, layout, spacing, typography } from '@/theme/tokens';

import { useAuth } from './auth-provider';

export function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [needsCode, setNeedsCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await signIn({ email: email.trim(), password, code: needsCode ? code.trim() : undefined });
    } catch (signInError) {
      if (signInError instanceof ApiError && signInError.errors.code && !needsCode) {
        setNeedsCode(true);
        setError('Enter the code from your authenticator app.');
      } else if (signInError instanceof ApiError && signInError.isOffline) {
        setError(
          'You need a connection to sign in the first time. After that, the app works offline.',
        );
      } else {
        setError(signInError instanceof ApiError ? signInError.firstError() : 'Sign-in failed.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen title="Sign in to JobLens" description="Use your JobLens email and password.">
        {!isApiConfigured() && (
          <AppText variant="caption" muted>
            This build has no server address. Set EXPO_PUBLIC_API_URL and rebuild.
          </AppText>
        )}
        <View style={styles.form}>
          <Field label="Email">
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="username"
              style={styles.input}
            />
          </Field>
          <Field label="Password">
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              style={styles.input}
            />
          </Field>
          {needsCode && (
            <Field label="Authentication code">
              <TextInput
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                style={styles.input}
              />
            </Field>
          )}
          {error && (
            <AppText variant="label" style={styles.error} accessibilityLiveRegion="polite">
              {error}
            </AppText>
          )}
          <Pressable
            accessibilityRole="button"
            disabled={busy || !email || !password}
            onPress={() => void submit()}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              (busy || !email || !password) && styles.buttonDisabled,
            ]}
          >
            {busy ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <AppText variant="label">Sign in</AppText>
            )}
          </Pressable>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { gap: spacing.lg },
  field: { gap: spacing.xs },
  input: {
    ...typography.body,
    minHeight: layout.touchTarget,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radius,
    color: colors.text,
    backgroundColor: colors.background,
  },
  error: { color: '#B42318' },
  button: {
    minHeight: layout.touchTarget,
    borderRadius: layout.radius,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { backgroundColor: colors.brandPressed },
  buttonDisabled: { opacity: 0.5 },
});
