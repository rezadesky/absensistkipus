export const COLORS = {
  primary: '#F97316',
  primaryDark: '#EA580C',
  primaryLight: '#FFEDD5',
  primaryBg: '#FFF7ED',

  secondary: '#172554',
  secondaryDark: '#0F172A',
  secondaryLight: '#1E3A8A',
  secondaryBorder: '#1E293B',

  background: '#F8FAFC',
  card: '#FFFFFF',
  cardMuted: '#F1F5F9',
  surface: '#FFFFFF',
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',

  text: '#0F172A',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  success: '#10B981',
  successDark: '#059669',
  successLight: '#ECFDF5',
  successBorder: '#A7F3D0',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningBorder: '#FDE68A',

  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  dangerBorder: '#FECACA',
  error: '#EF4444',

  info: '#3B82F6',
  infoLight: '#EFF6FF',
};

// Backwards compatibility alias
export const Colors = COLORS;

export const FONTS = {
  regular: 'Onest_400Regular',
  medium: 'Onest_500Medium',
  semiBold: 'Onest_600SemiBold',
  bold: 'Onest_700Bold',
  extraBold: 'Onest_800ExtraBold',
  black: 'Onest_900Black',
};
export const Fonts = FONTS;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};
export const Spacing = SPACING;

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};
export const Radius = RADIUS;

export const TYPOGRAPHY = {
  xs: 11,
  sm: 13,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
};
export const Typography = TYPOGRAPHY;

export const SHADOWS = {
  xs: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
};
export const Shadows = SHADOWS;
