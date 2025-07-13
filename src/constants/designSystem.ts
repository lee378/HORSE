// H.O.R.S.E. iOS Game Design System Constants

export const Colors = {
  // Primary Colors
  backgroundPrimary: '#1a1a1a',
  backgroundSecondary: '#2d2d2d',
  
  // Accent Colors
  primaryAccent: '#ff6b35',
  secondaryAccent: '#00d4ff',
  
  // Semantic Colors
  success: '#39ff14',
  error: '#ff073a',
  
  // Text Colors
  textPrimary: '#ffffff',
  textSecondary: '#b0b0b0',
  
  // Additional Colors
  border: '#3a3a3a',
  placeholder: '#666666',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 22,
    letterSpacing: 0,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  small: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
} as const;

export const Spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Layout = {
  screenMargin: 16,
  contentMargin: 20,
  cardPadding: 16,
  buttonPaddingHorizontal: 16,
  buttonPaddingVertical: 12,
  minTouchTarget: 44,
  primaryButtonHeight: 56,
  secondaryButtonHeight: 48,
  inputFieldHeight: 48,
  cardMinHeight: 64,
  headerHeight: 88,
  tabBarHeight: 83,
} as const;

export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  circular: 22,
} as const;

export const Shadows = {
  primaryButton: {
    shadowColor: Colors.primaryAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export const Animation = {
  micro: 200,
  standard: 300,
  complex: 500,
} as const;
