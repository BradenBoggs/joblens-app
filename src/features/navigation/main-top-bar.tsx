import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/app-text';
import { TopBar } from '@/components/shell/top-bar';
import { useAuth } from '@/features/auth/auth-provider';
import { colors, layout, shell } from '@/theme/tokens';

function initialsOf(name: string | undefined): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '';

  return (first + last).toUpperCase();
}

type MainTopBarProps = {
  /** Slot for TopBarButtons shown before the account avatar. */
  actions?: ReactNode;
  /** Slot under the bar, such as a search field or filters. */
  below?: ReactNode;
};

/** The top bar for the main tabs: JobLens mark on the left, account on the right. */
export function MainTopBar({ actions, below }: MainTopBarProps) {
  const router = useRouter();
  const { member } = useAuth();
  const initials = initialsOf(member?.user.name);

  return (
    <TopBar
      left={
        <Image
          source={require('@/assets/brand/icon.png')}
          style={styles.mark}
          accessibilityLabel="JobLens"
        />
      }
      right={
        <>
          {actions}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open account"
            hitSlop={(layout.touchTarget - shell.avatar) / 2}
            onPress={() => router.navigate('/account')}
            style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
          >
            <AppText variant="micro" style={styles.initials} maxFontSizeMultiplier={1.2}>
              {initials || '?'}
            </AppText>
          </Pressable>
        </>
      }
      below={below}
    />
  );
}

const styles = StyleSheet.create({
  mark: { width: shell.brandMark, height: shell.brandMark, borderRadius: shell.brandMarkRadius },
  avatar: {
    width: shell.avatar,
    height: shell.avatar,
    borderRadius: shell.avatar / 2,
    marginHorizontal: (shell.barButton - shell.avatar) / 2,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  initials: { color: colors.onDark },
});
