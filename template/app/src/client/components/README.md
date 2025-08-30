# 客户端组件组织结构

## 📁 当前结构

```
src/client/components/
├── LanguageSwitcher.tsx    # 语言切换组件
├── DarkModeSwitcher.tsx    # 深色模式切换组件
├── NotFoundPage.tsx        # 404页面组件
├── NavBar/                 # 导航栏相关组件
│   ├── NavBar.tsx
│   ├── constants.ts
│   └── Announcement.tsx
├── cookie-consent/         # Cookie同意相关组件
│   └── Banner.tsx
└── ui/                     # 基础UI组件 (ShadCN)
    ├── button.tsx
    ├── card.tsx
    ├── dropdown-menu.tsx
    └── ...
```

## 🎯 组织原则

### 1. 功能分组
- **UI切换组件**: `LanguageSwitcher.tsx`, `DarkModeSwitcher.tsx`
- **页面组件**: `NotFoundPage.tsx`
- **功能组件**: `NavBar/`, `cookie-consent/`
- **基础组件**: `ui/` (ShadCN组件)

### 2. 命名规范
- 组件文件使用 `PascalCase.tsx`
- 目录使用 `kebab-case/`
- 功能相关的组件放在同一目录下

### 3. 导入路径
- 同级组件: `import Component from './Component'`
- 子目录组件: `import Component from './subdir/Component'`
- 上级组件: `import Component from '../Component'`

## 🔄 组件移动历史

### LanguageSwitcher 组件
- **原位置**: `src/components/LanguageSwitcher.tsx`
- **新位置**: `src/client/components/LanguageSwitcher.tsx`
- **原因**: 与 `DarkModeSwitcher` 保持一致的客户端组件位置

## 📝 最佳实践

### 1. 组件放置规则
- **客户端专用组件** → `src/client/components/`
- **服务端组件** → `src/server/components/`
- **共享组件** → `src/shared/components/`
- **UI基础组件** → `src/components/ui/`

### 2. 功能相似组件
- 将功能相似的组件放在同一目录
- 例如: 切换类组件 (`LanguageSwitcher`, `DarkModeSwitcher`)

### 3. 导入优化
- 使用相对路径导入
- 避免过深的嵌套路径
- 保持导入路径的一致性

## 🚀 未来扩展

当添加新组件时，请遵循以下规则：

1. **UI切换组件** → 直接放在 `src/client/components/`
2. **页面组件** → 直接放在 `src/client/components/`
3. **功能组件** → 创建专门的子目录
4. **基础组件** → 放在 `src/components/ui/`

这样的组织结构确保了代码的可维护性和一致性！
