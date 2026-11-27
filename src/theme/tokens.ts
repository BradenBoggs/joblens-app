import type { TextStyle } from 'react-native';

/**
 * Values match the variables in the JobLens UI Systems Figma file.
 * The comment on each line names the Figma variable.
 */
export const colors = {
  background: '#FFFFFF', // background, card
  surface: '#F0F4F8', // muted
  border: '#E5E7EB', // input
  text: '#111827', // foreground
  secondary: '#1F2A44', // accent-foreground
  muted: '#56698A', // muted-foreground
  placeholder: '#94A3B8', // placeholder
  brand: '#FF6A21', // primary
  brandPressed: '#F05A12',
  brandText: '#B9470E', // primary-subtle-foreground
  brandSoft: '#FFF2EA', // primary-subtle
  onBrand: '#FFFFFF', // primary-foreground
  onDark: '#FFFFFF',
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

/** Sizes for the top bar and bottom bar that every screen shares. */
export const shell = {
  barHeight: 56,
  barPadding: 12,
  barGap: 8,
  /** The touch box of a bar icon button. The icon has no background. */
  barButton: 40,
  barIcon: 24,
  brandMark: 32,
  brandMarkRadius: 7,
  tabIcon: 22,
  actionButton: 60,
  /** Half of actionButton, so the camera button is a circle. */
  actionRadius: 30,
  actionLift: 22,
  actionIcon: 26,
} as const;

export const typography = {
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700', letterSpacing: -0.36 },
  heading: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  barTitle: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 20, fontWeight: '400' },
  micro: { fontSize: 12, lineHeight: 18, fontWeight: '400' },
} satisfies Record<string, TextStyle>;
