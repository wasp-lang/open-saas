# Theme System Guide

## Overview

This project now uses a **unified theme system** that combines ShadCN's CSS variables approach with your custom design tokens. All colors are defined in CSS variables in `src/client/Main.css` and referenced in `tailwind.config.cjs`.

## 🎯 Benefits

✅ **Single source of truth** - All colors defined in CSS variables  
✅ **Dark mode support** - Automatic dark/light mode switching  
✅ **ShadCN compatibility** - Works seamlessly with ShadCN components  
✅ **Type safety** - TypeScript support via `src/lib/theme.ts`  
✅ **Easy maintenance** - Change colors in one place  

## 📁 File Structure

```
src/
├── client/
│   └── Main.css              # CSS variables (single source of truth)
├── lib/
│   └── theme.ts              # Theme utilities and type definitions
└── components/
    └── ui/
        └── ThemeExample.tsx  # Example usage
```

## 🎨 Color System

### ShadCN Core Colors
Use these for standard UI components:

```tsx
// Background and text
<div className="bg-background text-foreground">
  Content
</div>

// Primary actions
<button className="bg-primary text-primary-foreground">
  Primary Button
</button>

// Secondary actions
<button className="bg-secondary text-secondary-foreground">
  Secondary Button
</button>

// Cards and containers
<div className="bg-card text-card-foreground border">
  Card Content
</div>

// Destructive actions
<button className="bg-destructive text-destructive-foreground">
  Delete
</button>
```

### Custom Theme Colors
Use these for your specific design needs:

```tsx
// Body text colors
<p className="text-body">Regular body text</p>
<p className="text-bodydark">Dark body text</p>

// Background variations
<div className="bg-whiten">Light background</div>
<div className="bg-boxdark">Dark box background</div>

// Borders and strokes
<div className="border-stroke">Light border</div>
<div className="border-strokedark">Dark border</div>

// Meta colors for specific UI elements
<div className="bg-meta-1 text-white">Meta 1</div>
<div className="bg-meta-3 text-white">Success indicator</div>
<div className="bg-meta-5 text-white">Info indicator</div>
```

### Status Colors
For feedback and alerts:

```tsx
<div className="bg-success text-white">Success message</div>
<div className="bg-danger text-white">Error message</div>
<div className="bg-warning text-white">Warning message</div>
```

### Chart Colors
For data visualization:

```tsx
<div className="bg-chart-1">Chart color 1</div>
<div className="bg-chart-2">Chart color 2</div>
<div className="bg-chart-3">Chart color 3</div>
<div className="bg-chart-4">Chart color 4</div>
<div className="bg-chart-5">Chart color 5</div>
```

## 🔧 Usage Patterns

### 1. Using Tailwind Classes (Recommended)
```tsx
// Most common approach
<div className="bg-primary text-primary-foreground p-4 rounded-lg">
  Primary styled content
</div>
```

### 2. Using Theme Utilities
```tsx
import { themeColors, colorSchemes } from '../lib/theme';

// For dynamic styling
const buttonStyle = {
  backgroundColor: themeColors.primary,
  color: themeColors.primaryForeground,
};

// For predefined schemes
const successButton = colorSchemes.success;
```

### 3. Dark Mode Support
All colors automatically adapt to dark mode:

```tsx
// This automatically uses light colors in light mode
// and dark colors in dark mode
<div className="bg-background text-foreground">
  Content that adapts to theme
</div>
```

## 🎯 Best Practices

### 1. Use Semantic Colors
```tsx
// ✅ Good - Uses semantic color names
<button className="bg-primary text-primary-foreground">
  Submit
</button>

// ❌ Avoid - Uses specific color names
<button className="bg-blue-500 text-white">
  Submit
</button>
```

### 2. Leverage ShadCN Components
```tsx
import { Button } from '@/components/ui/button';

// ShadCN components automatically use the theme
<Button variant="default">Primary Button</Button>
<Button variant="destructive">Delete</Button>
```

### 3. Create Custom Components
```tsx
// Create reusable components with consistent theming
const StatusBadge = ({ type, children }: { type: 'success' | 'error' | 'warning', children: React.ReactNode }) => {
  const colors = {
    success: 'bg-success text-white',
    error: 'bg-danger text-white',
    warning: 'bg-warning text-white',
  };
  
  return (
    <span className={`px-2 py-1 rounded text-sm ${colors[type]}`}>
      {children}
    </span>
  );
};
```

## 🔄 Modifying Colors

### To change a color:

1. **Edit CSS variables** in `src/client/Main.css`:
```css
:root {
  --primary: 220 70% 50%; /* Change this value */
}
```

2. **Restart your dev server** to see changes:
```bash
wasp start
```

### To add a new color:

1. **Add CSS variable** in `src/client/Main.css`:
```css
:root {
  --custom-color: 120 60% 50%;
}
.dark {
  --custom-color: 120 60% 40%;
}
```

2. **Add to Tailwind config** in `tailwind.config.cjs`:
```js
colors: {
  'custom-color': 'hsl(var(--custom-color))',
}
```

3. **Add to theme utilities** in `src/lib/theme.ts`:
```ts
export const themeColors = {
  // ... existing colors
  customColor: 'hsl(var(--custom-color))',
} as const;
```

## 🎨 Font Usage

The Satoshi font is configured and ready to use:

```tsx
// Use Satoshi font
<h1 className="font-satoshi text-2xl font-bold">
  Heading with Satoshi
</h1>

// Use system font (fallback)
<p className="font-sans">
  Regular text with system font
</p>
```

## 🧪 Testing Your Theme

Use the `ThemeExample` component to see all colors in action:

```tsx
import { ThemeExample } from '@/components/ui/ThemeExample';

// Add this to any page to see all theme colors
<ThemeExample />
```

## 📚 Migration Guide

### From Hardcoded Colors
```tsx
// ❌ Old way
<div className="bg-blue-500 text-white">

// ✅ New way
<div className="bg-primary text-primary-foreground">
```

### From Custom Color Classes
```tsx
// ❌ Old way
<div className="bg-meta-1 text-white">

// ✅ New way (still works, but consider semantic names)
<div className="bg-meta-1 text-white">
```

## 🎯 Next Steps

1. **Update existing components** to use the new theme system
2. **Create semantic color components** for common patterns
3. **Test dark mode** by toggling the theme
4. **Add the ThemeExample component** to your development pages for reference

This unified system gives you the best of both worlds: ShadCN's modern approach with your custom design tokens, all in one maintainable system! 