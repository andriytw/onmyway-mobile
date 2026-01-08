/**
 * Design Tokens
 * Константи дизайну адаптовані з веб-версії (Tailwind CSS)
 * Використовуються для точного відтворення стилів
 */

export const COLORS = {
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    500: '#22c55e',
    600: '#16a34a',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
  },
  amber: {
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
  },
  purple: {
    100: '#e9d5ff',
    600: '#9333ea',
  },
};

export const TYPOGRAPHY = {
  // Letter spacing в pixels (em * fontSize)
  // tracking-widest = 0.1em
  trackingWidest: (fontSize: number) => fontSize * 0.1,
  // tracking-[0.25em] = 0.25em
  tracking025: (fontSize: number) => fontSize * 0.25,
  // tracking-[0.2em] = 0.2em
  tracking02: (fontSize: number) => fontSize * 0.2,
  // tracking-wide = 0.025em
  trackingWide: (fontSize: number) => fontSize * 0.025,
  // tracking-tight = -0.025em
  trackingTight: (fontSize: number) => fontSize * -0.025,
  // Загальна функція для будь-якого em значення
  trackingEm: (em: number, fontSize: number) => fontSize * em,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
};

// Допоміжна функція для створення кольорових тіней
export const createShadow = (
  shadowType: keyof typeof SHADOWS,
  shadowColor?: string
) => {
  const shadow = SHADOWS[shadowType];
  return {
    ...shadow,
    shadowColor: shadowColor || shadow.shadowColor,
  };
};

