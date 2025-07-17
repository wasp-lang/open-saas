// Single source of truth for theme colors
export const themeColors = {
  background: { light: '0 0% 100%', dark: '210 50% 5%' },
  foreground: { light: '0 0% 3.9%', dark: '0 0% 98%' },
  card: { light: '0 0% 100%', dark: '210 50% 5%' },
  'card-foreground': { light: '0 0% 3.9%', dark: '0 0% 98%' },
  primary: { light: '210 100% 13%', dark: '31 57% 93%' },
  'primary-foreground': { light: '0 0% 98%', dark: '0 0% 9%' },
  secondary: { light: '32 100% 37%', dark: '209 91% 61%' },
  'secondary-foreground': { light: '0 0% 9%', dark: '0 0% 98%' },
  muted: { light: '0 0% 96.1%', dark: '210 100% 13%' },
  'muted-foreground': { light: '0 0% 45.1%', dark: '0 0% 63.9%' },
  accent: { light: '31 57% 93%', dark: '31 57% 93%' },
  'accent-foreground': { light: '0 0% 9%', dark: '210 100% 13%' },
  destructive: { light: '0 84.2% 60.2%', dark: '0 62.8% 30.6%' },
  'destructive-foreground': { light: '0 0% 98%', dark: '0 0% 98%' },
  border: { light: '0 0% 89.8%', dark: '0 0% 14.9%' },
  input: { light: '0 0% 89.8%', dark: '0 0% 14.9%' },
  ring: { light: '0 0% 3.9%', dark: '0 0% 83.1%' },
} as const;

// Generate CSS variables
export function generateCSSVariables(): string {
  let css = ':root {\n';

  Object.entries(themeColors).forEach(([name, values]) => {
    css += `  --${name}: ${values.light};\n`;
  });

  css += '}\n\n.dark {\n';

  Object.entries(themeColors).forEach(([name, values]) => {
    css += `  --${name}: ${values.dark};\n`;
  });

  css += '}';

  return css;
}

// Generate Tailwind config colors
export function generateTailwindColors() {
  const colors: Record<string, any> = {};

  Object.keys(themeColors).forEach((name) => {
    if (name.includes('-')) {
      const [base, variant] = name.split('-');
      if (!colors[base]) colors[base] = {};
      colors[base][variant] = `hsl(var(--${name}))`;
    } else {
      colors[name] = `hsl(var(--${name}))`;
    }
  });

  return colors;
}

// Generate theme.ts exports
export function generateThemeExports(): string {
  let exports = 'export const themeColors = {\n';

  Object.keys(themeColors).forEach((name) => {
    const camelCase = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    exports += `  ${camelCase}: 'hsl(var(--${name}))',\n`;
  });

  exports += '} as const;\n\n';
  exports += 'export function getThemeColor(colorName: keyof typeof themeColors): string {\n';
  exports += '  return themeColors[colorName];\n';
  exports += '}';

  return exports;
}
