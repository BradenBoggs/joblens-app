import type { TextStyle } from 'react-native';

export const colors = {
  background: '#FFFFFF',
  surface: '#F8FAFC',
  border: '#E4E7EC',
  text: '#101828',
  secondary: '#344054',
  muted: '#667085',
  brand: '#FF5A1F',
  brandPressed: '#F04B16',
  brandText: '#C2410C',
  brandSoft: '#FFF1EB',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  gutter: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const layout = {
  radius: 8,
  touchTarget: 48,
  contentWidth: 760,
} as const;

export const typography = {
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  heading: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 20, fontWeight: '400' },
} satisfies Record<string, TextStyle>;
