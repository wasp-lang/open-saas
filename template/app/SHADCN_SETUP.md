# ShadCN Setup in Open SaaS Template

This template has been configured with ShadCN v2 for use with Wasp 0.16.0 and TailwindCSS 3.2.7.

## What's Already Configured

✅ **ShadCN v2.3.0** is installed and configured
✅ **TailwindCSS** is properly set up with the correct configuration
✅ **components.json** is configured with relative paths (no @ alias needed)
✅ **Utils function** is available at `src/lib/utils.ts`
✅ **Button component** is available as an example

## How to Add New ShadCN Components (Easy Way)

**You do NOT need to know the ShadCN version or fix imports manually!**

### 1. Add a component (recommended):

```sh
npm run shadcn add <component-name>
# Example:
npm run shadcn add button
npm run shadcn add card
npm run shadcn add input
```

- This will:
  1. Use the correct ShadCN version (2.3.0) by default
  2. Add the component
  3. Automatically fix all import paths for Wasp compatibility (no more manual editing)
  4. Print out the correct import statement for you to use

### 2. (Optional) Specify a different ShadCN version:

```sh
npm run shadcn add <component-name> --version <shadcn-version>
# Example:
npm run shadcn add button --version 2.4.1
```

### 3. Import and use the component:

```tsx
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'

<Button variant="outline" size="lg">Click me</Button>
```

## Available Components

- ✅ **Button** - Available at `src/components/ui/button.tsx`
- ✅ **Card** - Available at `src/components/ui/card.tsx`

## Configuration Details

- **Style**: New York
- **Base Color**: Neutral
- **CSS Variables**: Enabled
- **Icon Library**: Lucide React
- **Aliases**: Configured to use relative paths (no @ alias)

## File Structure

```
src/
├── components/
│   └── ui/
│       └── button.tsx          # ShadCN components
│       └── card.tsx
├── lib/
│   └── utils.ts                # ShadCN utility functions
└── client/
    └── Main.css                # TailwindCSS with ShadCN styles
```

## Important Notes

1. **No @ alias**: This template uses relative imports instead of the @ alias to avoid Wasp compatibility issues
2. **TailwindCSS 3.2.7**: Compatible with ShadCN v2
3. **Wasp 0.16.0**: Full compatibility with the current setup
4. **Automatic Import Fixing**: The provided script will fix all `src/` imports to be relative, so you never have to do it manually.
5. **Version Flexibility**: You can override the default ShadCN version (2.3.0) using the `--version` flag if needed.

## Example Usage

See `src/landing-page/components/Hero.tsx` for an example of how to use ShadCN components in this template.

## Future Updates

When Wasp updates to support TailwindCSS v4, we can upgrade to ShadCN v3 as well. 