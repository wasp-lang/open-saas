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

  // Secondary muted colors
  secondaryMuted: 'hsl(var(--secondary-muted))',
  secondaryMutedForeground: 'hsl(var(--secondary-muted-foreground))',

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

// Gradient definitions using theme colors
export const gradients = {
  primary: {
    toRight: `linear-gradient(to right, ${themeColors.secondaryMuted}, ${themeColors.secondary})`,
    toLeft: `linear-gradient(to left, ${themeColors.secondaryMuted}, ${themeColors.secondary})`,
    toBottom: `linear-gradient(to bottom, ${themeColors.secondaryMuted}, ${themeColors.secondary})`,
    toTop: `linear-gradient(to top, ${themeColors.secondaryMuted}, ${themeColors.secondary})`,
    diagonal: `linear-gradient(135deg, ${themeColors.secondaryMuted}, ${themeColors.secondary})`,
    diagonalReverse: `linear-gradient(-135deg, ${themeColors.secondaryMuted}, ${themeColors.secondary})`,
  },

  subtle: {
    toRight: `linear-gradient(to right, ${themeColors.secondaryMuted}20, ${themeColors.secondary}20)`,
    toBottom: `linear-gradient(to bottom, ${themeColors.secondaryMuted}10, ${themeColors.secondary}10)`,
  },
} as const;

// Utility function to get CSS variable value
export function getThemeColor(colorName: keyof typeof themeColors): string {
  return themeColors[colorName];
}

// Utility function to get gradient
export function getGradient(gradientPath: string): string {
  const pathParts = gradientPath.split('.');
  let current: any = gradients;

  for (const part of pathParts) {
    if (current[part]) {
      current = current[part];
    } else {
      throw new Error(`Gradient not found: ${gradientPath}`);
    }
  }

  return current;
}

// Utility function to create custom gradient
export function createGradient(
  fromColor: keyof typeof themeColors,
  toColor: keyof typeof themeColors,
  direction: 'to right' | 'to left' | 'to bottom' | 'to top' | '45deg' | '135deg' | '-135deg' = 'to right'
): string {
  return `linear-gradient(${direction}, ${themeColors[fromColor]}, ${themeColors[toColor]})`;
}

// Common color combinations for components
export const colorSchemes = {
  primary: {
    bg: themeColors.accent,
    text: themeColors.accentForeground,
    border: themeColors.accent,
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
