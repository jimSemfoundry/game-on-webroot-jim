import { test, expect } from '@playwright/test';

test.setTimeout(120_000);

const STEP_DELAY = parseInt(process.env.STEP_DELAY || '0', 10);
const wait = (page: any) => STEP_DELAY > 0 && page.waitForTimeout(STEP_DELAY);

/** Playwright 内置高亮 + 点击，headed 模式下可见红框闪烁 */
async function click(locator: any, options?: any) {
  if (STEP_DELAY > 0) await locator.highlight();
  await locator.click(options);
}

const BIN_WIN_API = 'https://uat1.betfrom.com/api/GameOrderBigWin/binWinList?lang=en';

test.use({
  ignoreHTTPSErrors: true,
  viewport: { height: 1200, width: 1880 },
});

test('RecentBigWins 弹窗和游戏跳转', async ({ page }) => {
  // ====== 接口检查：无需登录，RecentBigWins 使用 public API ======
  const apiResp = await page.request.get(BIN_WIN_API);
  expect(apiResp.ok()).toBeTruthy();
  const apiBody = await apiResp.json();
  expect(apiBody.code).toBe(0);
  expect(apiBody.data).toBeInstanceOf(Array);
  expect(apiBody.data.length).toBeGreaterThan(0);

  // ====== 页面交互 ======
  await page.goto('/main/casino', { waitUntil: 'domcontentloaded' });
  await wait(page);

  // 向下滚动触发 LazySection 加载 RecentBigWins
  await page.evaluate(() => window.scrollTo(0, 500));
  await wait(page);

  // .relative.w-18.cursor-pointer 组合唯一标识 RecentBigWins 的游戏项
  // w-18 = 72px 是 RecentBigWins 专用的自定义宽度
  const gameItems = page.locator('.relative.w-18.cursor-pointer');
  await gameItems.first().waitFor({ state: 'visible', timeout: 10000 });
  const gameCount = await gameItems.count();
  expect(gameCount).toBeGreaterThan(0);

  // Marquee 可能克隆内容用于无限滚动，随机时仅取前半（原始项）
  const originalCount = Math.min(gameCount, 30);

  // 随机选第一个游戏打开弹窗
  // 注：Marquee 持续滚动导致元素不断移动，使用 force 跳过稳定性检查
  const idx1 = Math.floor(Math.random() * originalCount);
  await click(gameItems.nth(idx1), { force: true });
  await wait(page);

  // 关闭弹窗（Modal 关闭时会 scrollTo(0,0)，需重新滚动）
  await click(page.locator('dialog[open] .modal-box button.btn-square'));
  await wait(page);
  await page.evaluate(() => window.scrollTo(0, 500));
  await wait(page);
  await gameItems.first().waitFor({ state: 'visible', timeout: 10000 });
  await wait(page);

  // 再随机选第二个游戏，点击 Play
  const idx2 = Math.floor(Math.random() * originalCount);
  await click(gameItems.nth(idx2), { force: true });
  await wait(page);
  await click(page.locator('dialog[open] .modal-box button.btn-primary'));
  await wait(page);

  // ==== 验证跳转到游戏页 =====
  // 注：跳转后 URL 变为 /main/games/<gameId> 且保持不变，无需额外断言
  await page.waitForURL('**/games/**', { timeout: 10000 });
});
