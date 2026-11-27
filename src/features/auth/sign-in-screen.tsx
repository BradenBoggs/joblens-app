import * as Linking from 'expo-linking';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppText } from '@/components/app-text';
import { PageHeading } from '@/components/screen';
import { AppShell } from '@/components/shell/app-shell';
import { ApiError, isApiConfigured, webUrl } from '@/lib/api';
import { colors, layout, shell, spacing, typography } from '@/theme/tokens';

import { useAuth } from './auth-provider';

export function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [needsCode, setNeedsCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const forgotPasswordUrl = webUrl('/forgot-password');

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
      <AppShell>
        <Image
          source={require('@/assets/brand/icon.png')}
          style={styles.mark}
          accessibilityIgnoresInvertColors
        />
        <PageHeading
          title="Sign in to JobLens"
          description="Use the email and password for your JobLens account."
        />
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
              placeholder="you@company.com"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
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
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="current-password"
              textContentType="password"
              style={styles.input}
            />
          </Field>
          <View style={styles.links}>
            <Pressable
              accessibilityRole="button"
              hitSlop={12}
              onPress={() => setShowPassword((shown) => !shown)}
            >
              <AppText variant="label" style={styles.link}>
                {showPassword ? 'Hide password' : 'Show password'}
              </AppText>
            </Pressable>
            {forgotPasswordUrl && (
              <Pressable
                accessibilityRole="link"
                hitSlop={12}
                onPress={() => void Linking.openURL(forgotPasswordUrl)}
              >
                <AppText variant="label" style={styles.link}>
                  Forgot password?
                </AppText>
              </Pressable>
            )}
          </View>
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
        <AppText variant="caption" muted style={styles.footer}>
          Works offline after your first sign-in.
        </AppText>
      </AppShell>
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
  mark: {
    width: shell.brandMark + spacing.lg,
    height: shell.brandMark + spacing.lg,
    borderRadius: 11,
    marginTop: spacing.xxl,
  },
  links: { flexDirection: 'row', justifyContent: 'space-between' },
  link: { color: colors.secondary },
  footer: { textAlign: 'center' },
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
