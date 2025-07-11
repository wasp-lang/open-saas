# Adding New Colors to the Wasp + shadcn/ui Project

## Overview

This document outlines the color system implementation and best practices for extending the default shadcn/ui colors while maintaining consistency and scalability.

## Current Color System

### 1. Semantic Colors (Recommended for most use cases)

The project uses a semantic color system that automatically adapts to light/dark modes:

```css
/* Core semantic colors */
--primary: 0 0% 9%;
--primary-foreground: 0 0% 98%;
--secondary: 0 0% 96.1%;
--secondary-foreground: 0 0% 9%;
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 0 0% 98%;
--muted: 0 0% 96.1%;
--muted-foreground: 0 0% 45.1%;
--accent: 0 0% 96.1%;
--accent-foreground: 0 0% 9%;

/* Custom brand colors */
--success: 142 76% 36%;
--success-foreground: 0 0% 98%;
--warning: 38 92% 50%;
--warning-foreground: 0 0% 9%;
--info: 199 89% 48%;
--info-foreground: 0 0% 98%;
```

### 2. Usage in Components

```tsx
// ✅ GOOD - Use semantic colors
<Button variant="success">Success Action</Button>
<div className="bg-warning text-warning-foreground p-4">Warning message</div>
<div className="bg-primary text-primary-foreground">Primary content</div>

// ✅ GOOD - For brand-specific needs only
<div className="bg-[#6577F3]">Brand-specific element</div>

// ❌ AVOID - Don't use hardcoded colors for general UI
<div className="bg-[#34D399]">Use semantic colors instead</div>
```

## How to Add New Colors

### Step 1: Add CSS Variables

In `src/client/Main.css`, add new color variables:

```css
@layer base {
  :root {
    /* Existing colors... */
    
    /* New custom colors */
    --brand-blue: 210 100% 50%;
    --brand-blue-foreground: 0 0% 98%;
    --brand-purple: 270 100% 50%;
    --brand-purple-foreground: 0 0% 98%;
  }

  .dark {
    /* Existing dark mode colors... */
    
    /* New custom colors (dark mode) */
    --brand-blue: 210 100% 60%;
    --brand-blue-foreground: 0 0% 98%;
    --brand-purple: 270 100% 60%;
    --brand-purple-foreground: 0 0% 98%;
  }
}
```

### Step 2: Update Theme Configuration

In `src/lib/theme.ts`, add the new colors to the `themeColors` object:

```typescript
export const themeColors = {
  // Existing colors...
  
  // New custom brand colors
  brandBlue: 'hsl(var(--brand-blue))',
  brandBlueForeground: 'hsl(var(--brand-blue-foreground))',
  brandPurple: 'hsl(var(--brand-purple))',
  brandPurpleForeground: 'hsl(var(--brand-purple-foreground))',
} as const;
```

### Step 3: Add Color Schemes

Add new color combinations to the `colorSchemes` object:

```typescript
export const colorSchemes = {
  // Existing schemes...
  
  // New brand color schemes
  brandBlue: {
    bg: themeColors.brandBlue,
    text: themeColors.brandBlueForeground,
    border: themeColors.brandBlue,
  },
  brandPurple: {
    bg: themeColors.brandPurple,
    text: themeColors.brandPurpleForeground,
    border: themeColors.brandPurple,
  },
} as const;
```

### Step 4: Extend Component Variants

For components like buttons, add new variants:

```typescript
// In src/components/ui/button.tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center...',
  {
    variants: {
      variant: {
        // Existing variants...
        
        // New brand variants
        brandBlue: 'bg-brand-blue text-brand-blue-foreground shadow-sm hover:bg-brand-blue/90',
        brandPurple: 'bg-brand-purple text-brand-purple-foreground shadow-sm hover:bg-brand-purple/90',
      },
      // ... rest of variants
    },
  }
);
```

## Best Practices

### 1. Semantic Over Hardcoded

**✅ DO:**
```tsx
<Button variant="success">Success</Button>
<div className="bg-warning text-warning-foreground">Warning</div>
```

**❌ DON'T:**
```tsx
<Button className="bg-[#34D399] text-white">Success</Button>
<div className="bg-[#F59E0B] text-black">Warning</div>
```

### 2. Use Opacity Modifiers for States

```tsx
// Hover states
className="bg-primary hover:bg-primary/90"

// Disabled states
className="bg-primary disabled:bg-primary/50"

// Focus states
className="bg-primary focus:bg-primary/95"
```

### 3. Consistent Color Combinations

Use the `colorSchemes` object for consistent combinations:

```typescript
import { colorSchemes } from '@/lib/theme';

// In your component
const { bg, text, border } = colorSchemes.success;
```

### 4. When to Use Hardcoded Colors

Only use hardcoded colors like `bg-[#6577F3]` for:

- **Brand-specific elements** that must match exact hex values
- **Third-party integrations** requiring specific colors
- **Charts and data visualizations** with color-coded data
- **External brand guidelines** that specify exact colors

## Color Accessibility

### Contrast Ratios

Ensure proper contrast ratios:
- **Normal text**: 4.5:1 minimum
- **Large text**: 3:1 minimum
- **UI components**: 3:1 minimum

### Testing Colors

1. **Test in both light and dark modes**
2. **Use browser dev tools** to check contrast ratios
3. **Test with color blindness simulators**
4. **Validate with accessibility tools**

## File Structure

```
src/
├── client/
│   └── Main.css          # CSS variables and base styles
├── components/
│   └── ui/
│       └── button.tsx    # Component variants
└── lib/
    └── theme.ts          # Theme configuration and utilities
```

## Migration Guide

### Replacing Hardcoded Colors

1. **Identify hardcoded colors** in your components
2. **Choose appropriate semantic color** or add new one
3. **Update component** to use semantic color
4. **Test in both themes**

Example migration:
```tsx
// Before
<div className="bg-[#34D399] text-white p-4">Success</div>

// After
<div className="bg-success text-success-foreground p-4">Success</div>
```

## Troubleshooting

### Common Issues

1. **Colors not updating**: Restart the dev server
2. **Dark mode not working**: Check CSS variable definitions
3. **TypeScript errors**: Ensure theme types are updated
4. **Build errors**: Verify CSS variable syntax

### Debugging

```typescript
// Check if color is defined
console.log(getThemeColor('success'));

// Verify CSS variable exists
console.log(getComputedStyle(document.documentElement)
  .getPropertyValue('--success'));
```

## Resources

- [shadcn/ui Color System](https://ui.shadcn.com/docs/themes)
- [Tailwind CSS Color Palette](https://tailwindcss.com/docs/customizing-colors)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/#contrast-minimum)

---

**Remember**: Always prefer semantic colors over hardcoded values for better maintainability, accessibility, and theme consistency. 