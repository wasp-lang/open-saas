# Migration Plan: Full ShadCN Adoption

## 🎯 **Goal: Replace Custom Colors with ShadCN Semantic Colors**

### **Current vs. Target Color Mapping**

| **Current Custom Color** | **ShadCN Semantic Color** | **Usage Pattern** |
|-------------------------|---------------------------|-------------------|
| `bg-body` | `text-muted-foreground` | Body text |
| `text-bodydark` | `text-muted-foreground` | Secondary text |
| `bg-boxdark` | `bg-card` | Card backgrounds |
| `bg-boxdark-2` | `bg-background` | Page backgrounds |
| `border-stroke` | `border-border` | Borders |
| `bg-meta-1` | `bg-destructive` | Error states |
| `bg-meta-3` | `bg-success` | Success states |
| `bg-meta-5` | `bg-primary` | Primary actions |
| `bg-meta-2` | `bg-muted` | Muted backgrounds |
| `bg-meta-4` | `bg-secondary` | Secondary backgrounds |

## 📋 **Migration Checklist**

### **Phase 1: Core Layout Components**
- [ ] `src/client/App.tsx` - Main layout
- [ ] `src/client/components/NavBar/NavBar.tsx` - Navigation
- [ ] `src/admin/layout/DefaultLayout.tsx` - Admin layout
- [ ] `src/admin/layout/Header.tsx` - Admin header
- [ ] `src/admin/layout/Sidebar.tsx` - Admin sidebar

### **Phase 2: Landing Page**
- [ ] `src/landing-page/LandingPage.tsx`
- [ ] `src/landing-page/components/Features.tsx`
- [ ] `src/landing-page/components/Footer.tsx`
- [ ] `src/landing-page/components/Testimonials.tsx`

### **Phase 3: Admin Dashboard**
- [ ] `src/admin/dashboards/analytics/` - All analytics components
- [ ] `src/admin/dashboards/users/` - User management
- [ ] `src/admin/elements/` - UI elements

### **Phase 4: User Components**
- [ ] `src/user/DropdownUser.tsx`
- [ ] `src/client/components/NotFoundPage.tsx`

## 🔄 **Migration Examples**

### **Before (Custom Colors):**
```tsx
<div className="bg-boxdark text-white">
  <p className="text-bodydark">Content</p>
  <button className="bg-meta-3 text-white">Success</button>
</div>
```

### **After (ShadCN Semantic):**
```tsx
<div className="bg-card text-card-foreground">
  <p className="text-muted-foreground">Content</p>
  <button className="bg-success text-success-foreground">Success</button>
</div>
```

## 🎨 **Specific Color Replacements**

### **Background Colors:**
```tsx
// ❌ Old
bg-boxdark → bg-card
bg-boxdark-2 → bg-background
bg-white → bg-background
bg-meta-2 → bg-muted
bg-meta-4 → bg-secondary
```

### **Text Colors:**
```tsx
// ❌ Old
text-body → text-foreground
text-bodydark → text-muted-foreground
text-meta-3 → text-success
text-meta-5 → text-primary
```

### **Border Colors:**
```tsx
// ❌ Old
border-stroke → border-border
border-strokedark → border-border
```

### **Status Colors:**
```tsx
// ❌ Old
bg-meta-1 → bg-destructive
bg-meta-3 → bg-success
bg-meta-5 → bg-primary
bg-meta-7 → bg-warning
```

## 🛠️ **Migration Process**

### **Step 1: Start with Layout Components**
1. Update `App.tsx` and main layout files
2. Test dark mode functionality
3. Ensure ShadCN components work properly

### **Step 2: Update Component by Component**
1. Choose one component at a time
2. Replace custom colors with ShadCN semantic colors
3. Test in both light and dark modes
4. Verify accessibility and contrast

### **Step 3: Remove Custom Colors**
1. After all components are migrated, remove custom CSS variables
2. Clean up `tailwind.config.cjs`
3. Update `src/lib/theme.ts`

## 🎯 **Benefits After Migration**

✅ **Consistent design system** - All colors follow ShadCN patterns  
✅ **Better accessibility** - Semantic colors have proper contrast  
✅ **Easier maintenance** - One color system to manage  
✅ **Dark mode perfection** - Automatic theme switching  
✅ **Component compatibility** - Works seamlessly with ShadCN components  

## 🚀 **Quick Start Commands**

```bash
# 1. Start with the main layout
# Edit: src/client/App.tsx

# 2. Update navigation
# Edit: src/client/components/NavBar/NavBar.tsx

# 3. Test changes
wasp start

# 4. Continue with admin layout
# Edit: src/admin/layout/DefaultLayout.tsx
```

## 📝 **Migration Notes**

- **Keep chart colors** - These are specific to data visualization
- **Test thoroughly** - Each component should work in both themes
- **Use semantic names** - `bg-success` instead of `bg-meta-3`
- **Maintain contrast** - Ensure text remains readable
- **Update gradually** - Don't break existing functionality

## 🎨 **Final State**

After migration, you'll have:
- **Pure ShadCN color system**
- **Semantic color names**
- **Perfect dark mode support**
- **Consistent component styling**
- **Better maintainability** 