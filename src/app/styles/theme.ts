export const theme = {
  colors: {
    dark: {
      background: '#0A0F1E',
      surface: '#0D1528',
      card: '#111827',
    },
    light: {
      background: '#F0F4FF',
      surface: '#FFFFFF',
      card: '#E8EFFE',
    },
    accent: {
      cyan: '#06B6D4',
      blue: '#3B82F6',
      purple: '#8B5CF6',
    },
    alert: {
      red: '#EF4444',
      amber: '#F59E0B',
      green: '#10B981',
    },
  },
  fontScale: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  spacing: {
    px: '1px', 0: '0', 1: '0.25rem', 2: '0.5rem', 3: '0.75rem',
    4: '1rem', 5: '1.25rem', 6: '1.5rem', 8: '2rem',
    10: '2.5rem', 12: '3rem', 16: '4rem', 20: '5rem',
    24: '6rem', 32: '8rem',
  },
  radius: {
    sm: '6px',
    md: '12px',
    lg: '20px',
    xl: '32px',
  },
  glass: 'backdrop-blur-md bg-white/5 border border-white/10',
} as const;
