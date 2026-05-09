import { test } from '@playwright/test';

test.setTimeout(120_000);

test.use({
  ignoreHTTPSErrors: true,
  viewport: { height: 1200, width: 1880 },
});

/** 从环境变量读取每步停留时间(ms)，默认 0（不等待） */
const STEP_DELAY = parseInt(process.env.STEP_DELAY || '0', 10);
const wait = (page: any) => STEP_DELAY > 0 && page.waitForTimeout(STEP_DELAY);

/** Playwright 内置高亮 + 点击，headed 模式下可见红框闪烁 */
async function click(locator: any, options?: any) {
  if (STEP_DELAY > 0) await locator.highlight();
  await locator.click(options);
}

/**
 * Casino / Sports 推广卡片导航 E2E 测试
 *
 * 覆盖场景:
 * ┌──────────────────┬─────────────────────────────────────────────────────┐
 * │ 推广卡片           │ 目标页面                                             │
 * ├──────────────────┼─────────────────────────────────────────────────────┤
 * │ Casino 推广       │ 导航到 /explore?type=casino&category=hot            │
 * │ Sports 推广       │ 导航到 /sports?bt-path=/                           │
 * └──────────────────┴─────────────────────────────────────────────────────┘
 *
 * 定位策略:
 * - PromotionalSection 中的 Casino/Sports 卡片包含硬编码的 alt 属性图片
 *   (img[alt="casino"] / img[alt="sport"])，不随语言切换变化。
 * - 利用 :has() 伪类定位绑定了 onClick 导航的父容器 .cursor-pointer。
 * - Sports 卡片的箭头按钮用 button:has(svg) 定位，替代 auto-generated class。
 */
test('Casino 和 Sports 推广卡片导航', async ({ page }) => {
  // ==========================================================
  // 1. Casino 推广卡片 → 导航到 explore 页面
  // ==========================================================
  await page.goto('/main/casino', { waitUntil: 'domcontentloaded' });
  await wait(page);

  // Casino 推广卡片：img[alt="casino"] 的父容器 .cursor-pointer 绑定了 navigate
  await click(page.locator('.cursor-pointer:has(img[alt="casino"])'));
  await wait(page);
  // 跳转 到 /main/explore?type=casino&category=hot
  await page.waitForURL('**/explore**', { timeout: 10000 });
  await wait(page);
  // 往下滚动
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await wait(page);

  // ==========================================================
  // 2. Sports 推广卡片 → 导航到 sports 页面
  // ==========================================================
  await page.goto('/main/casino', { waitUntil: 'domcontentloaded' });
  await wait(page);

  // Sports 推广卡片：点击箭头按钮触发 navigate，替代原 getByText + .sc-* 组合
  // 按钮位于 img[alt="sport"] 父容器内，用 button:has(svg) 稳定定位
  await click(page.locator('.cursor-pointer:has(img[alt="sport"]) button'));
  await wait(page);
  // 跳转 到 /main/sports?bt-path=/
  await page.waitForURL('**/sports**', { timeout: 15000 });
  await wait(page);
  // 往下滚动
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await wait(page);

  // 回到 casino 首页
  await page.goto('/main/casino', { waitUntil: 'domcontentloaded' });
  await wait(page);
});
