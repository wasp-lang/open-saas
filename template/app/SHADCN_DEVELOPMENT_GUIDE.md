# ShadCN Development Guide

## 🎯 **ShadCN Basics & Conventions**

### **What is ShadCN?**
ShadCN is a **component library** built on top of Radix UI primitives with Tailwind CSS styling. It's **not a traditional component library** - it's a collection of reusable components that you **copy into your project** and customize.

### **Key Conventions**

#### **1. Component Structure**
```tsx
// Standard ShadCN component pattern
import * as React from 'react'
import { cn } from '@/lib/utils'

const Component = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('base-classes', className)} {...props} />
  )
)
Component.displayName = 'Component'

export { Component }
```

#### **2. Variant System (CVA)**
```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const componentVariants = cva(
  'base-classes',
  {
    variants: {
      variant: {
        default: 'default-classes',
        secondary: 'secondary-classes',
        destructive: 'destructive-classes',
      },
      size: {
        default: 'default-size',
        sm: 'small-size',
        lg: 'large-size',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
```

#### **3. Color System**
```tsx
// Use semantic colors, not hardcoded values
className="bg-primary text-primary-foreground"  // ✅ Good
className="bg-blue-500 text-white"              // ❌ Avoid
```

#### **4. Import Patterns**
```tsx
// Import from your components directory
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
```

## 🎨 **Most Common ShadCN Components**

### **Essential Components (High Priority)**

#### **1. Button** ✅ Already installed
```tsx
import { Button } from '../components/ui/button'

<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

#### **2. Card** ✅ Already installed
```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

#### **3. Input** 🔥 **NEEDED**
```tsx
import { Input } from '../components/ui/input'

<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
```

#### **4. Label** 🔥 **NEEDED**
```tsx
import { Label } from '../components/ui/label'

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

#### **5. Form** 🔥 **NEEDED**
```tsx
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form'

// Used with react-hook-form for validation
```

#### **6. Dialog/Modal** 🔥 **NEEDED**
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    Content
  </DialogContent>
</Dialog>
```

#### **7. Dropdown Menu** 🔥 **NEEDED**
```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu'

<DropdownMenu>
  <DropdownMenuTrigger>Open</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

#### **8. Select** 🔥 **NEEDED**
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

#### **9. Textarea** 🔥 **NEEDED**
```tsx
import { Textarea } from '../components/ui/textarea'

<Textarea placeholder="Enter text..." />
```

#### **10. Checkbox** 🔥 **NEEDED**
```tsx
import { Checkbox } from '../components/ui/checkbox'

<Checkbox />
```

#### **11. Switch** 🔥 **NEEDED**
```tsx
import { Switch } from '../components/ui/switch'

<Switch />
```

### **Layout Components (Medium Priority)**

#### **12. Tabs** 🔥 **NEEDED**
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Content</TabsContent>
</Tabs>
```

#### **13. Accordion** 🔥 **NEEDED**
```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion'

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Title</AccordionTrigger>
    <AccordionContent>Content</AccordionContent>
  </AccordionItem>
</Accordion>
```

#### **14. Table** 🔥 **NEEDED**
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Value</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### **Advanced Components (Lower Priority)**

#### **15. Popover** 🔥 **NEEDED**
```tsx
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'

<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>Content</PopoverContent>
</Popover>
```

#### **16. Tooltip** 🔥 **NEEDED**
```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip'

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover</TooltipTrigger>
    <TooltipContent>Tooltip text</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

#### **17. Alert** 🔥 **NEEDED**
```tsx
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'

<Alert>
  <AlertTitle>Title</AlertTitle>
  <AlertDescription>Description</AlertDescription>
</Alert>
```

#### **18. Badge** 🔥 **NEEDED**
```tsx
import { Badge } from '../components/ui/badge'

<Badge variant="default">Badge</Badge>
```

## 🔧 **Should You Modify ShadCN Components?**

### **✅ DO Modify:**
- **Add custom variants** to existing components
- **Extend with new props** for your specific needs
- **Add custom styling** for your brand
- **Create compound components** that combine multiple ShadCN components

### **❌ DON'T Modify:**
- **Core accessibility features** (Radix primitives)
- **Base component structure** unless you have a very good reason
- **Component APIs** that other developers expect

### **Example: Custom Button Variant**
```tsx
// In your button.tsx
const buttonVariants = cva(
  'base-classes',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        // Add your custom variants
        gradient: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white',
        success: 'bg-green-500 text-white hover:bg-green-600',
      },
    },
  }
)
```

## 📋 **Components You'll Need for This Redesign**

Based on your codebase analysis, here are the **essential components** you should install:

### **🔥 CRITICAL (Install First)**
1. **Input** - Forms, search, user input
2. **Label** - Form labels and accessibility
3. **Form** - Form validation and structure
4. **Dialog** - Modals, confirmations, user interactions
5. **Dropdown Menu** - User menus, navigation dropdowns
6. **Select** - Dropdown selections, country picker
7. **Textarea** - Long text input, bio fields
8. **Checkbox** - Form checkboxes, toggles
9. **Switch** - Toggle switches, settings
10. **Table** - Data tables, user lists, admin dashboards

### **🔥 HIGH PRIORITY**
11. **Tabs** - Admin dashboard sections, content organization
12. **Accordion** - FAQ sections, collapsible content
13. **Popover** - Tooltips, quick actions
14. **Alert** - Success/error messages, notifications
15. **Badge** - Status indicators, tags

### **🔥 MEDIUM PRIORITY**
16. **Tooltip** - Help text, hover information
17. **Progress** - Upload progress, loading states
18. **Separator** - Visual dividers
19. **Avatar** - User profiles, user lists
20. **Calendar** - Date pickers, scheduling

### **🔥 NICE TO HAVE**
21. **Command** - Search interfaces, command palettes
22. **Sheet** - Mobile sidebars, slide-out panels
23. **Hover Card** - Rich previews, user cards
24. **Menubar** - Application menus
25. **Navigation Menu** - Complex navigation structures

## 🚀 **Installation Commands**

```bash
# Critical components (install these first)
npm run shadcn add input
npm run shadcn add label
npm run shadcn add form
npm run shadcn add dialog
npm run shadcn add dropdown-menu
npm run shadcn add select
npm run shadcn add textarea
npm run shadcn add checkbox
npm run shadcn add switch
npm run shadcn add table

# High priority components
npm run shadcn add tabs
npm run shadcn add accordion
npm run shadcn add popover
npm run shadcn add alert
npm run shadcn add badge

# Medium priority components
npm run shadcn add tooltip
npm run shadcn add progress
npm run shadcn add separator
npm run shadcn add avatar
npm run shadcn add calendar
```

## 🎨 **Customization Best Practices**

### **1. Theme Customization**
```tsx
// In your CSS variables (Main.css)
:root {
  --primary: 220 14% 96%;  // Your brand color
  --primary-foreground: 220 9% 46%;
}
```

### **2. Component Composition**
```tsx
// Create compound components
const UserCard = ({ user }) => (
  <Card>
    <CardHeader>
      <CardTitle>{user.name}</CardTitle>
    </CardHeader>
    <CardContent>
      <p>{user.email}</p>
    </CardContent>
    <CardFooter>
      <Button variant="outline">Edit</Button>
    </CardFooter>
  </Card>
)
```

### **3. Consistent Spacing**
```tsx
// Use consistent spacing patterns
<div className="space-y-4">  // Vertical spacing
<div className="space-x-2">  // Horizontal spacing
<div className="p-6">        // Padding
<div className="gap-4">      // Grid/flex gaps
```

## 🔄 **Migration Strategy**

### **Phase 1: Core Components**
1. Install critical components
2. Replace custom form elements
3. Update admin dashboard forms

### **Phase 2: Layout Components**
1. Install layout components
2. Update navigation and menus
3. Improve user experience

### **Phase 3: Polish**
1. Install remaining components
2. Add micro-interactions
3. Improve accessibility

## 📚 **Resources**

- **ShadCN Documentation**: https://ui.shadcn.com/
- **Radix UI**: https://www.radix-ui.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **Class Variance Authority**: https://cva.style/docs

---

**Next Steps:**
1. Install the critical components listed above
2. Start with form components for your admin dashboard
3. Gradually replace custom components with ShadCN equivalents
4. Customize the theme to match your brand colors 