# VIP Club 页面

## 概述
VIP Club 是一个需要认证的页面，完全按照设计图实现，展示VIP系统的奖励计划和特色功能。

## 路由信息
- **路径**: `/vip-club`
- **认证**: 需要登录 (使用 `requireAuth` guard)
- **文件位置**: `src/routes/vip-club/index.tsx`

## 页面结构

### 1. Hero 区域 (VipHero)
- **背景**: 深绿色渐变背景
- **内容**:
  - 标题: "Exclusive VIP System"
  - 描述文字
  - "Participate" 按钮
  - 右侧插图占位区（待手动添加）
- **文件**: `src/sections/vip/vip-hero.tsx`

### 2. 奖励表格 (VipRewardsTable)
- **功能**: 展示所有VIP等级（1-125）的奖励详情
- **特性**:
  - 分页显示，每页5个VIP等级
  - 左右箭头导航
  - 响应式横向滚动
  - 固定左侧列（奖励类型）
- **奖励类型**:
  1. Level Up Bonus (Cumulative) - 货币值
  2. Referral Commission - 百分比
  3. Daily Cashback - 百分比
  4. Super Rakeback (Boosted) - 百分比
  5. Conquests - 可用性（✓/-）
  6. Achievements - 可用性（✓/-）
  7. Lucky Seven - 可用性（✓/-）
  8. The Jester - 可用性（✓/-）
  9. Weekly Bonus - 可用性（✓/-）
  10. Mystery Box - 可用性（✓/-）
- **文件**: `src/sections/vip/vip-rewards-table.tsx`

### 3. 特色功能卡片 (VipFeatureCards)
- **布局**: 响应式网格 (移动端1列，平板2列，桌面5列)
- **卡片内容**:
  1. **Lucky Spin** (VIP 4)
     - 紫色渐变背景
     - 目标图标
  2. **Weekly Cashback** (VIP 12)
     - 粉色渐变背景
     - 日历图标
  3. **The Airdrop** (VIP 22)
     - 蓝色渐变背景
     - 钻石图标
  4. **The Jester** (VIP 32)
     - 红色渐变背景
     - 庆祝图标
  5. **The Cannon** (VIP 40)
     - 深紫色渐变背景
     - 火箭图标
- **文件**: `src/sections/vip/vip-feature-cards.tsx`

## VIP等级系统
- **Bronze (青铜)**: 1-20级
- **Silver (白银)**: 21-40级
- **Gold (黄金)**: 41-60级
- **Ruby (红宝石)**: 61-80级
- **Sapphire (蓝宝石)**: 81-100级
- **Platinum (白金)**: 101-125级

## 使用的图标
所有图标使用 Iconify 组件，主要来自：
- `mingcute` 图标集 (lock-fill, check-fill, target-fill, calendar-fill, diamond-fill, celebrate-fill, rocket-fill)
- `custom` 图标集 (vip, bonus, referral, cashback, rakeback, target, achievements, lucky-number, jester, mystery-box)

## 多语言支持
所有文本使用 `vip` 命名空间的翻译键：
- 英文: `public/locales/en/vip.json`
- 简体中文: `public/locales/zh-CN/vip.json`
- 支持38种语言

### 主要翻译键
```
vip:exclusive_vip_system
vip:step_into_world
vip:every_bet
vip:program_rewards
vip:bonus_type
vip:level_up_bonus_cumulative
vip:referral_commission
vip:daily_cashback
vip:super_rakeback
vip:conquests
vip:achievements
vip:lucky_seven
vip:jester
vip:weekly_bonus
vip:mystery_box
vip:lucky_spin
vip:weekly_cashback
vip:the_airdrop
vip:the_jester
vip:the_cannon
```

## 侧边栏集成
- 文件: `src/components/sidebar/config.ts`
- 图标: `custom:vip`
- 标签: `t('menu:vipClub')`
- 路径: `/vip-club` ✅

## 样式特性
- **响应式设计**: 完全支持移动端、平板和桌面端
- **主题适配**: 使用 DaisyUI 的主题变量
- **渐变背景**: Hero区域和特色卡片使用渐变效果
- **玻璃态效果**: 卡片使用半透明背景和模糊效果
- **RTL支持**: 兼容从右到左的语言布局

## 待完成事项

### 需要手动添加
1. **Hero区域插图** - 皇冠和宝石的3D插图
2. **特色卡片图标** - 每个卡片的特色图标/插图

### 未来优化
1. **API集成**
   - 获取用户当前VIP等级
   - 获取用户经验值进度
   - 实时更新奖励数据
   - 奖励领取功能

2. **交互增强**
   - 添加表格行hover效果
   - 卡片点击查看详情
   - 添加动画效果（进入动画、过渡效果）
   - 滚动加载更多VIP等级

3. **数据管理**
   - 使用 TanStack Query 进行数据管理
   - 添加 loading 骨架屏
   - 添加 error 状态处理
   - 实现数据缓存策略

4. **用户体验**
   - 添加VIP等级进度条
   - 显示下一等级所需经验
   - 高亮当前用户的VIP等级
   - 添加奖励历史记录

## 技术栈
- **路由**: TanStack Router
- **国际化**: react-i18next
- **样式**: Tailwind CSS + DaisyUI
- **图标**: Iconify (mingcute + custom icons)
- **状态管理**: React Hooks (useState, useRef, useEffect)
- **响应式**: 自定义 useMediaQuery hook

## 文件结构
```
src/
├── routes/
│   └── vip-club/
│       ├── index.tsx          # 主路由组件
│       └── README.md          # 本文档
├── sections/
│   └── vip/
│       ├── index.ts           # 导出所有VIP组件
│       ├── vip-hero.tsx       # Hero区域组件
│       ├── vip-rewards-table.tsx  # 奖励表格组件
│       └── vip-feature-cards.tsx  # 特色卡片组件
└── components/
    └── sidebar/
        └── config.ts          # 侧边栏配置（已更新VIP路径）
```

## 设计规范
- **Hero高度**: 最小400px
- **表格列宽**: 最小120px（VIP等级列），200px（奖励类型列）
- **卡片最小高度**: 280px
- **间距**: 统一使用 Tailwind spacing (gap-4, gap-6)
- **圆角**: 使用 rounded-box (DaisyUI 预设)
- **颜色**: 基于 DaisyUI 主题变量

## 测试清单
- [x] 路由正确注册
- [x] 认证守卫工作正常
- [x] 侧边栏链接正确
- [x] 响应式布局正常
- [x] 多语言切换正常
- [x] 表格分页功能正常
- [ ] Hero插图已添加
- [ ] 卡片图标已添加
- [ ] API集成完成
- [ ] 用户数据展示正常
