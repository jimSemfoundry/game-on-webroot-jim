# RTL（从右到左）支持指南

本文档介绍项目的 RTL（Right-to-Left）支持实现，帮助开发者为阿拉伯语、波斯语、希伯来语等从右到左书写的语言提供完整支持。

## 📋 目录

- [功能特性](#功能特性)
- [支持的语言](#支持的语言)
- [快速开始](#快速开始)
- [使用指南](#使用指南)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

---

## 功能特性

✅ **自动 RTL 检测**: 根据当前语言自动切换 RTL 布局  
✅ **HTML Dir 属性**: 自动设置 `<html dir="rtl">`  
✅ **Tailwind RTL 插件**: 完整的 Tailwind CSS RTL 支持  
✅ **逻辑属性**: 使用 CSS 逻辑属性实现方向无关的布局  
✅ **DaisyUI 集成**: DaisyUI 组件的 RTL 样式支持  
✅ **图标管理**: 方向性图标自动翻转  
✅ **类型安全**: 完整的 TypeScript 支持

---

## 支持的语言

| 语言 | 语言代码 | 书写方向 |
|------|----------|----------|
| 阿拉伯语 | `ar` | RTL |
| 波斯语/法尔西语 | `fa` | RTL |
| 希伯来语 | `he` | RTL |
| 乌尔都语 | `ur` | RTL |
| 普什图语 | `ps` | RTL |
| 信德语 | `sd` | RTL |

---

## 快速开始

### 1. 检查 RTL 状态

```typescript
import { useRTLContext } from '@/contexts/RTLContext';

function MyComponent() {
  const { isRTL, direction } = useRTLContext();
  
  return (
    <div>
      <p>当前方向: {direction}</p>
      <p>是否 RTL: {isRTL ? '是' : '否'}</p>
    </div>
  );
}
```

### 2. 切换语言触发 RTL

```typescript
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('ar')}>العربية</button>
      <button onClick={() => changeLanguage('fa')}>فارسی</button>
    </div>
  );
}
```

当语言切换到 RTL 语言时，整个应用自动切换为 RTL 布局。

---

## 使用指南

### 1. 使用 RTL Context

`RTLContext` 提供了 RTL 状态和工具函数。

```typescript
import { useRTLContext } from '@/contexts/RTLContext';

function MyComponent() {
  const { isRTL, direction, rtlClass } = useRTLContext();
  
  return (
    <div className={rtlClass('text-left', 'text-right')}>
      {isRTL ? 'النص العربي' : 'English Text'}
    </div>
  );
}
```

**Context API**:
- `isRTL: boolean` - 是否为 RTL 模式
- `direction: 'ltr' | 'rtl'` - 当前文本方向
- `rtlClass(ltrClass, rtlClass)` - 条件类名函数

### 2. 使用 RTL 工具函数

`src/utils/rtl.ts` 提供了一系列工具函数：

```typescript
import { 
  rtlClasses, 
  conditionalRTL, 
  getIconDirection 
} from '@/utils/rtl';
import { ChevronRight } from 'lucide-react';

function NavigationItem() {
  const { isRTL } = useRTLContext();
  
  return (
    <div className={conditionalRTL(isRTL, 'flex-row-reverse', 'flex-row')}>
      <span className={rtlClasses.textStart}>菜单项</span>
      <ChevronRight 
        className={getIconDirection(isRTL, true)} 
      />
    </div>
  );
}
```

**工具函数**:

```typescript
conditionalRTL(isRTL, rtlValue, ltrValue)

rtlClasses = {
  textStart: 'text-left rtl:text-right',
  textEnd: 'text-right rtl:text-left',
  marginStart: 'ml-* rtl:mr-* rtl:ml-0',
  marginEnd: 'mr-* rtl:ml-* rtl:mr-0',
}

getIconDirection(isRTL, shouldFlip)
```

### 3. 使用 Tailwind 逻辑属性（推荐）

Tailwind CSS 提供了逻辑属性类名，自动适配 RTL。

#### 文本对齐

```tsx
<div className="text-start">
  文本在 LTR 中左对齐，在 RTL 中右对齐
</div>

<div className="text-end">
  文本在 LTR 中右对齐，在 RTL 中左对齐
</div>
```

#### 外边距和内边距

```tsx
<div className="ms-4 me-2">
  ms-4: 在 LTR 中是 margin-left，在 RTL 中是 margin-right
  me-2: 在 LTR 中是 margin-right，在 RTL 中是 margin-left
</div>

<div className="ps-4 pe-2">
  ps-4: 在 LTR 中是 padding-left，在 RTL 中是 padding-right
  pe-2: 在 LTR 中是 padding-right，在 RTL 中是 padding-left
</div>
```

#### 定位

```tsx
<div className="absolute start-0 end-auto">
  start-0: 在 LTR 中是 left: 0，在 RTL 中是 right: 0
  end-auto: 在 LTR 中是 right: auto，在 RTL 中是 left: auto
</div>
```

#### 边框

```tsx
<div className="border-s border-e">
  border-s: 在 LTR 中是 border-left，在 RTL 中是 border-right
  border-e: 在 LTR 中是 border-right，在 RTL 中是 border-left
</div>
```

### 4. 使用 Tailwind RTL 前缀

如果逻辑属性不够用，可以使用 `rtl:` 前缀显式指定 RTL 样式。

```tsx
<div className="ml-4 rtl:mr-4 rtl:ml-0 text-left rtl:text-right">
  显式指定 LTR 和 RTL 样式
</div>
```

### 5. 处理图标

```typescript
import { getIconDirection } from '@/utils/rtl';
import { ArrowRight, Settings, ChevronLeft } from 'lucide-react';

function IconExamples() {
  const { isRTL } = useRTLContext();
  
  return (
    <div>
      {/* 方向性图标 - 需要翻转 */}
      <ArrowRight 
        className={getIconDirection(isRTL, true)} 
      />
      
      <ChevronLeft 
        className={getIconDirection(isRTL, true)} 
      />
      
      {/* 非方向性图标 - 不需要翻转 */}
      <Settings className="w-5 h-5" />
    </div>
  );
}
```

**方向性图标**：箭头、人字形、指向性图标  
**非方向性图标**：设置、关闭、搜索、用户等

---

## 最佳实践

### 1. 选择合适的 RTL 方法

#### ✅ 方法 A：逻辑属性（强烈推荐）

```tsx
<div className="ps-4 ms-2 start-0 border-s text-start">
  使用 CSS 逻辑属性，代码简洁，性能最佳
</div>
```

**优点**：
- 代码简洁
- 性能最佳
- 符合 CSS 标准
- 未来趋势

#### ✅ 方法 B：Tailwind RTL 前缀

```tsx
<div className="pl-4 rtl:pr-4 rtl:pl-0 text-left rtl:text-right">
  显式处理 RTL，适合复杂布局
</div>
```

**优点**：
- 显式明确
- 灵活控制
- 易于调试

#### ❌ 方法 C：仅方向性类名（避免）

```tsx
<div className="pl-4 ml-2 left-0 text-left">
  没有 RTL 支持，不推荐
</div>
```

**缺点**：
- 不支持 RTL
- 需要后期重构

### 2. 布局最佳实践

#### Flexbox 布局

```tsx
import { conditionalRTL } from '@/utils/rtl';

function FlexExample() {
  const { isRTL } = useRTLContext();
  
  return (
    <div className={conditionalRTL(
      isRTL,
      'flex flex-row-reverse justify-end',
      'flex flex-row justify-start'
    )}>
      <div>项目 1</div>
      <div>项目 2</div>
      <div>项目 3</div>
    </div>
  );
}
```

#### Grid 布局

```tsx
<div className="grid grid-cols-3">
  <div className="text-start">左/右列</div>
  <div className="text-center">中间列</div>
  <div className="text-end">右/左列</div>
</div>
```

### 3. 表单布局

```tsx
function LoginForm() {
  const { isRTL } = useRTLContext();
  const { t } = useTranslation();
  
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-start mb-2">
          {t('login.username')}
        </label>
        <input 
          type="text"
          className="input input-bordered w-full text-start"
          placeholder={t('login.usernamePlaceholder')}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
      </div>
      
      <div className={conditionalRTL(isRTL, 'flex flex-row-reverse gap-2', 'flex gap-2')}>
        <button type="submit" className="btn btn-primary">
          {t('login.submit')}
        </button>
        <button type="button" className="btn btn-ghost">
          {t('login.cancel')}
        </button>
      </div>
    </form>
  );
}
```

### 4. 导航和面包屑

```tsx
function Breadcrumbs() {
  const { isRTL } = useRTLContext();
  const { ChevronRight } = lucideReact;
  
  return (
    <div className="breadcrumbs">
      <ul className={conditionalRTL(isRTL, 'flex-row-reverse', '')}>
        <li><a href="/">首页</a></li>
        <li><ChevronRight className={getIconDirection(isRTL, true)} /></li>
        <li><a href="/category">分类</a></li>
        <li><ChevronRight className={getIconDirection(isRTL, true)} /></li>
        <li>当前页</li>
      </ul>
    </div>
  );
}
```

### 5. 卡片和容器

```tsx
function GameCard() {
  return (
    <div className="card bg-base-100 shadow-xl">
      <figure className="relative">
        <img src="/game.jpg" alt="游戏" />
        <div className="absolute top-2 start-2">
          <span className="badge badge-primary">新游戏</span>
        </div>
      </figure>
      
      <div className="card-body">
        <h2 className="card-title text-start">游戏标题</h2>
        <p className="text-start">游戏描述文本</p>
        
        <div className="card-actions justify-end">
          <button className="btn btn-primary">
            立即游玩
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 常见陷阱

### 1. 固定定位

```tsx
<div className="fixed left-4">
  始终在左侧，在 RTL 中不正确
</div>

<div className="fixed start-4">
  在 LTR 中在左侧，在 RTL 中在右侧
</div>
```

### 2. Flexbox 方向

```tsx
<div className="flex justify-between">
  在 RTL 中方向可能不正确
</div>

<div className={conditionalRTL(isRTL, 'flex-row-reverse', 'flex')}>
  正确处理方向
</div>
```

### 3. 文本输入

```tsx
<input type="text" className="text-left" />

<input 
  type="text" 
  className="text-start" 
  dir={isRTL ? 'rtl' : 'ltr'}
/>
```

### 4. 浮动元素

```tsx
<div className="float-left">
  避免使用 float，使用 Flexbox 或 Grid
</div>

<div className="flex justify-start">
  推荐使用现代布局方法
</div>
```

---

## 测试 RTL 布局

### 手动测试

1. 切换语言到阿拉伯语 (`ar`) 或波斯语 (`fa`)
2. 验证以下内容：
   - ✅ 文本对齐到右侧
   - ✅ 布局从右到左流动
   - ✅ 图标正确翻转
   - ✅ 表单工作正常
   - ✅ 导航直观易用
   - ✅ 无水平滚动条
   - ✅ 响应式设计正常

### 使用浏览器开发工具

```javascript
document.documentElement.dir = 'rtl';

document.documentElement.lang = 'ar';
```

### 自动化测试

```typescript
import { render, screen } from '@testing-library/react';
import { RTLProvider } from '@/contexts/RTLContext';

describe('RTL Layout', () => {
  it('renders correctly in RTL mode', () => {
    render(
      <RTLProvider>
        <MyComponent />
      </RTLProvider>
    );
    
    const element = screen.getByTestId('my-element');
    expect(element).toHaveAttribute('dir', 'rtl');
  });
});
```

---

## 浏览器支持

RTL 支持在所有现代浏览器中工作：

- ✅ Chrome 89+
- ✅ Firefox 87+
- ✅ Safari 14+
- ✅ Edge 89+
- ✅ 移动浏览器

**功能依赖**：
- CSS 逻辑属性
- CSS `dir` 属性
- Flexbox `flex-direction`

---

## 性能考虑

- ✅ RTL 检测仅在语言切换时执行一次
- ✅ CSS 逻辑属性有优秀的浏览器支持
- ✅ 无 JavaScript 样式开销 - 完全由 CSS 处理
- ✅ 不影响初始加载性能

---

## 扩展 RTL 支持

### 添加新的 RTL 语言

更新 `src/hooks/useRTL.ts` 中的 `RTL_LANGUAGES` 数组：

```typescript
const RTL_LANGUAGES = [
  'ar',  // 阿拉伯语
  'fa',  // 波斯语
  'he',  // 希伯来语
  'ur',  // 乌尔都语
  'ps',  // 普什图语
  'sd',  // 信德语
  'yi',  // 意第绪语（新增）
];
```

### 自定义 RTL 样式

在 `src/styles/rtl.css` 中添加自定义 RTL 样式：

```css
[dir="rtl"] .custom-element {
  margin-left: 0;
  margin-right: 1rem;
}

[dir="rtl"] .custom-icon {
  transform: scaleX(-1);
}
```

---

## 故障排除

### 布局问题

1. ✅ 检查是否使用逻辑属性 (`ms-*`, `me-*`, `start-*`, `end-*`)
2. ✅ 验证组件使用 `useRTLContext()` hook
3. ✅ 确保 RTL 样式正确加载
4. ✅ 检查 `<html dir="rtl">` 属性是否设置

### 图标问题

1. ✅ 对方向性图标使用 `getIconDirection()`
2. ✅ 为不应翻转的图标添加 `icon-no-flip` 类
3. ✅ 使用实际 RTL 内容测试

### 文本问题

1. ✅ 使用 `text-start` 而不是 `text-left`
2. ✅ 检查字体是否支持 RTL 字符
3. ✅ 验证正确设置了 `lang` 属性
4. ✅ 输入框添加 `dir` 属性

### 对齐问题

```tsx
<div className="text-start">
  始终与文本方向开始对齐
</div>

<div className="flex justify-start items-center">
  Flexbox 内容正确对齐
</div>
```

---

## 相关资源

- [开发指南总览](./01-开发指南总览.md)
- [CSS 逻辑属性 MDN 文档](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
- [Tailwind CSS RTL 支持](https://tailwindcss.com/docs/hover-focus-and-other-states#rtl-support)
- [W3C 国际化最佳实践](https://www.w3.org/International/)

---

**最后更新**: 2025-10-05
