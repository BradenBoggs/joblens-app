import { Text, type TextProps } from 'react-native';

import { colors, typography } from '@/theme/tokens';

type AppTextProps = TextProps & {
  variant?: keyof typeof typography;
  muted?: boolean;
};

export function AppText({ variant = 'body', muted = false, style, ...props }: AppTextProps) {
  return (
    <Text
      {...props}
      style={[typography[variant], { color: muted ? colors.muted : colors.text }, style]}
    />
  );
}
