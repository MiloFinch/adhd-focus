export const COLORS = {
  background: '#0F0F1A',
  surface: '#1A1A2E',
  primary: '#7C3AED',
  secondary: '#10B981',
  amber: '#F59E0B',
  error: '#EF4444',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
} as const;

export const FONT_FAMILY = 'Inter';

export const RADIUS = {
  md: 12,
  lg: 16,
} as const;

export const GLOW = {
  shadowColor: COLORS.primary,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.3,
  shadowRadius: 14,
  elevation: 8,
} as const;
