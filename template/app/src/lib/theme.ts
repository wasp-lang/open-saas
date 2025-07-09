/**
 * Pure ShadCN theme utilities
 * Only includes ShadCN semantic colors - no custom colors
 */

// ShadCN color palette
export const themeColors = {
  // Core colors
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',

  // Card colors
  card: 'hsl(var(--card))',
  cardForeground: 'hsl(var(--card-foreground))',

  // Popover colors
  popover: 'hsl(var(--popover))',
  popoverForeground: 'hsl(var(--popover-foreground))',

  // Primary colors
  primary: 'hsl(var(--primary))',
  primaryForeground: 'hsl(var(--primary-foreground))',

  // Secondary colors
  secondary: 'hsl(var(--secondary))',
  secondaryForeground: 'hsl(var(--secondary-foreground))',

  // Muted colors
  muted: 'hsl(var(--muted))',
  mutedForeground: 'hsl(var(--muted-foreground))',

  // Accent colors
  accent: 'hsl(var(--accent))',
  accentForeground: 'hsl(var(--accent-foreground))',

  // Destructive colors
  destructive: 'hsl(var(--destructive))',
  destructiveForeground: 'hsl(var(--destructive-foreground))',

  // Border and input colors
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
} as const;

// Utility function to get CSS variable value
export function getThemeColor(colorName: keyof typeof themeColors): string {
  return themeColors[colorName];
}

// Common color combinations for components
export const colorSchemes = {
  primary: {
    bg: themeColors.primary,
    text: themeColors.primaryForeground,
    border: themeColors.primary,
  },
  secondary: {
    bg: themeColors.secondary,
    text: themeColors.secondaryForeground,
    border: themeColors.secondary,
  },
  destructive: {
    bg: themeColors.destructive,
    text: themeColors.destructiveForeground,
    border: themeColors.destructive,
  },
  muted: {
    bg: themeColors.muted,
    text: themeColors.mutedForeground,
    border: themeColors.muted,
  },
  accent: {
    bg: themeColors.accent,
    text: themeColors.accentForeground,
    border: themeColors.accent,
  },
} as const;

// Font configuration
export const fonts = {
  satoshi: ['Satoshi', 'system-ui', 'sans-serif'],
} as const;

// Border radius values
export const radius = {
  sm: 'calc(var(--radius) - 4px)',
  md: 'calc(var(--radius) - 2px)',
  lg: 'var(--radius)',
} as const;
