export const themeColors = {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',

  card: 'hsl(var(--card))',
  cardForeground: 'hsl(var(--card-foreground))',
  cardAccent: 'hsl(var(--card-accent))',
  cardAccentForeground: 'hsl(var(--card-accent-foreground))',
  cardSubtle: 'hsl(var(--card-subtle))',
  cardSubtleForeground: 'hsl(var(--card-subtle-foreground))',

  popover: 'hsl(var(--popover))',
  popoverForeground: 'hsl(var(--popover-foreground))',

  primary: 'hsl(var(--primary))',
  primaryForeground: 'hsl(var(--primary-foreground))',

  secondary: 'hsl(var(--secondary))',
  secondaryForeground: 'hsl(var(--secondary-foreground))',

  secondaryMuted: 'hsl(var(--secondary-muted))',
  secondaryMutedForeground: 'hsl(var(--secondary-muted-foreground))',

  muted: 'hsl(var(--muted))',
  mutedForeground: 'hsl(var(--muted-foreground))',

  accent: 'hsl(var(--accent))',
  accentForeground: 'hsl(var(--accent-foreground))',

  destructive: 'hsl(var(--destructive))',
  destructiveForeground: 'hsl(var(--destructive-foreground))',

  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
} as const;

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

export function getThemeColor(colorName: keyof typeof themeColors): string {
  return themeColors[colorName];
}

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

export function createGradient(
  fromColor: keyof typeof themeColors,
  toColor: keyof typeof themeColors,
  direction: 'to right' | 'to left' | 'to bottom' | 'to top' | '45deg' | '135deg' | '-135deg' = 'to right'
): string {
  return `linear-gradient(${direction}, ${themeColors[fromColor]}, ${themeColors[toColor]})`;
}

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
