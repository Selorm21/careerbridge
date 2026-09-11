// src/theme.js
export const colors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',
  secondary: '#0D9488',
  accent: '#7C3AED',
  success: '#059669',
  successLight: '#ECFDF5',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  background: '#F9FAFB',
  surface: '#FFFFFF',
};

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px -1px rgba(0,0,0,0.08)',
  lg: '0 10px 25px -5px rgba(0,0,0,0.1)',
};

/**
 * Breakpoints — matches CSS @media values used across the app.
 * Use with useMediaQuery() hook.
 */
export const breakpoints = {
  xs: 320,
  sm: 480,
  md: 640,
  lg: 768,
  xl: 1024,
  xxl: 1280,
  xxxl: 1536,
};

/**
 * Fluid spacing scale — reference values, apply via clamp() in styles.
 * Not a utility; use as guidance so pages share the same rhythm.
 */
export const spacing = {
  pageX: 'clamp(16px, 4vw, 40px)',
  pageY: 'clamp(20px, 4vw, 40px)',
  cardPad: 'clamp(16px, 3vw, 26px)',
  gridGap: 'clamp(12px, 2vw, 24px)',
  sectionGap: 'clamp(20px, 4vw, 32px)',
};

/**
 * Fluid typography — apply via clamp() in styles.
 */
export const typography = {
  h1: 'clamp(24px, 4vw, 42px)',
  h2: 'clamp(20px, 3vw, 32px)',
  h3: 'clamp(17px, 2vw, 22px)',
  body: 'clamp(13px, 1vw, 15px)',
  small: 'clamp(11px, 0.9vw, 13px)',
};

export const fadeInUp = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
`;