# Betby 体育游戏集成指南

## 概述

本文档介绍了如何在项目中集成 Betby 体育游戏提供商，包括认证、令牌管理、访问限制等核心功能。

## 集成架构

### 1. 核心文件结构

```
src/
├── components/
│   └── ui/
│       └── LoadingText.tsx         # 加载动画组件（弹簧动画 + 脉冲效果）
├── types/
│   ├── betby.ts                    # Betby 类型定义
│   └── global.d.ts                 # 全局类型声明（包含 window.BTRenderer）
├── services/
│   └── betbyService.ts             # Betby API 服务
└── routes/
    ├── _main.tsx                   # 主布局（修改：为 Sports 页面移除 container 限制）
    └── _main/
        └── sports/
            └── index.tsx           # Sports 页面组件

public/
├── images/
│   └── information/
│       └── user-restriction.png   # 访问限制提示图片
└── locales/
    └── en/
        ├── common.json             # 通用翻译
        └── information.json        # 信息页面翻译
```

### 2. 类型定义 (src/types/betby.ts)

定义了以下核心类型：

- `BetbyInitConfig`: Betby SDK 初始化配置
- `BTRendererInstance`: BTRenderer 实例接口
- `BTRendererClass`: BTRenderer 类定义
- `BetbyAuthResponse`: API 认证响应
- `BetbyAuthTokenParams`: 令牌请求参数
- `BetbyAccessDeniedError`: 币种限制错误
- `BetbyNoAccessError`: 无访问权限错误

### 3. API 服务 (src/services/betbyService.ts)

提供两个核心 API 函数：

#### `getBetByConfig()`
- 获取 Betby 品牌配置（游客模式）
- 无需认证
- 返回 `brand_id`

#### `fetchBetbyAuthToken(params)`
- 生成认证令牌（登录用户）
- 参数：`{ currency: string, lang: string }`
- 处理两种错误码：
  - `BETBY_RESTRICTED_CODE (10001)`: 币种不支持
  - `BETBY_NO_ACCESS_CODE (10002)`: 无访问权限

## 布局特殊处理

### 全屏显示

Sports 页面需要全屏显示 Betby 内容，不受默认布局的 `max-w-7xl` 容器限制。

**实现方式** (src/routes/_main.tsx):
```tsx
const isSportsPage = location.pathname === '/sports';

{isSportsPage ? (
  // Sports 页面：全宽显示，无容器限制
  <Outlet />
) : (
  // 其他页面：使用标准容器
  <div className="container mx-auto md:max-w-7xl">
    <Outlet />
  </div>
)}
```

这样 Sports 页面可以利用整个 main 内容区域，提供更好的体育游戏体验。

## Sports 页面功能

### 核心功能

1. **动态 SDK 加载**
   - 自动加载 Betby SDK (`https://1stgame.sptpub.com/bt-renderer.min.js`)
   - 检测 SDK 是否已加载，避免重复加载
   - 加载期间显示动画 LOADING 效果（使用 LoadingText 组件）

2. **双模式支持**
   - **游客模式**: 使用 `getBetByConfig()` 获取配置，无需认证
   - **登录模式**: 使用 `fetchBetbyAuthToken()` 获取认证令牌

3. **令牌管理**
   - 自动刷新令牌 (`onTokenRefresh`)
   - 处理令牌过期 (`onTokenExpired`)
   - 会话刷新 (`onSessionRefresh`)

4. **访问控制**
   - 检测币种限制
   - 检测用户访问权限
   - 显示友好的错误提示页面

5. **响应式布局**
   - 自动计算 Betby 组件的偏移量
   - 适配移动端 Dock 高度
   - 支持动态调整布局参数

6. **状态监听**
   - 监听用户币种变化，自动重新初始化
   - 监听语言变化（游客模式）
   - 监听认证状态变化

### 回调函数

```typescript
// 用户点击登录
onLogin: () => {
  window.location.href = '/login';
}

// 用户点击注册
onRegister: () => {
  window.location.href = '/login?type=sign-up';
}

// 用户点击充值
onRecharge: () => {
  navigate({ to: '/profile' });
}
```

## 国际化

### 添加的翻译键

**common.json:**
```json
{
  "common": {
    "currencyRestrictionError": "Your current currency is not supported for sports betting..."
  }
}
```

**information.json:**
```json
{
  "userRestriction": {
    "noSportsAccessTitle": "You are not allowed to access sports",
    "noSportsAccessDescription": "This account is restricted from sports..."
  },
  "goCasino": "Go to Casino",
  "goBack": "Go Back"
}
```

## 使用示例

### 访问 Sports 页面

用户访问 `/sports` 路由时：

1. **游客用户**:
   - 自动使用游客模式
   - 显示 Betby 体育大厅
   - 点击登录/注册按钮跳转到相应页面

2. **登录用户**:
   - 自动获取认证令牌
   - 如果币种不支持，显示限制提示
   - 如果无访问权限，显示限制提示
   - 正常情况下显示完整的 Betby 体育大厅

### 错误处理

```typescript
try {
  const response = await fetchBetbyAuthToken({
    currency: user.currency_fiat,
    lang: user.language_code,
  });
  // 成功
} catch (error) {
  if (error instanceof BetbyNoAccessError) {
    // 无访问权限
    restrictAccess('noAccess');
  } else if (error instanceof BetbyAccessDeniedError) {
    // 币种不支持
    restrictAccess('currency');
  }
}
```

## 配置要求

### 后端 API 端点

需要确保以下 API 端点可用：

1. **GET `/BetBy/getBetByConfig`**
   - 用途: 获取品牌配置（游客模式）
   - 认证: 不需要
   - 返回: `{ code: 0, data: brand_id }`

2. **POST `/BetBy/generateAuthJwt`**
   - 用途: 生成认证令牌
   - 认证: 需要（使用 authAxios）
   - 请求体: `{ currency: string, lang: string }`
   - 返回: `{ code: 0, data: { jwt, brand_id, lang } }`
   - 错误码:
     - `10001`: 币种不支持
     - `10002`: 无访问权限

### 环境变量

无需额外的环境变量，使用项目现有的 `VITE_API_URL`。

## 测试清单

- [ ] 游客模式访问 `/sports`
- [ ] 登录用户访问 `/sports`
- [ ] 点击 Betby 内的登录按钮
- [ ] 点击 Betby 内的注册按钮
- [ ] 点击 Betby 内的充值按钮
- [ ] 切换用户币种（测试重新初始化）
- [ ] 切换应用语言（测试重新初始化）
- [ ] 测试币种限制错误提示
- [ ] 测试访问权限限制提示
- [ ] 测试移动端布局适配
- [ ] 测试桌面端布局
- [ ] 测试令牌刷新机制

## 注意事项

1. **SDK 加载**: Betby SDK 是从外部 CDN 加载的，确保网络连接正常
2. **令牌刷新**: 令牌会自动刷新，无需手动处理
3. **实例清理**: 组件卸载时会自动清理 BTRenderer 实例
4. **路由导航**: 使用 `window.location.href` 进行页面跳转，避免 TanStack Router 类型问题
5. **布局计算**: 自动适配 Header 和 Dock 高度，支持响应式布局

## 故障排查

### 问题：SDK 加载失败

**解决方案**: 检查网络连接和 SDK URL (`https://1stgame.sptpub.com/bt-renderer.min.js`)

### 问题：令牌获取失败

**解决方案**: 
1. 检查后端 API 是否正常
2. 验证用户认证状态
3. 查看浏览器控制台错误日志

### 问题：显示币种限制错误

**解决方案**: 
1. 确认用户的 `currency_fiat` 是否被 Betby 支持
2. 联系 Betby 支持添加币种支持

### 问题：BTRenderer 未定义

**解决方案**: 
1. 确认 SDK 脚本已加载完成
2. 检查 `scriptLoaded` 状态
3. 查看浏览器控制台是否有加载错误

## 未来优化建议

1. **缓存优化**: 考虑缓存 brand_id 配置，减少 API 调用
2. **错误重试**: 添加自动重试机制处理网络错误
3. **性能监控**: 添加性能监控，追踪 SDK 加载时间
4. **离线支持**: 考虑 SDK 本地托管，提高加载速度
5. **A/B 测试**: 支持不同主题和配置的 A/B 测试

## 相关文档

- [开发指南总览](./01-开发指南总览.md)
- [认证系统指南](./02-认证系统指南.md)
- [架构优化总结](./07-架构优化总结.md)

---

**维护人员**: 开发团队  
**最后更新**: 2025-10-29  
**版本**: 1.0.0

