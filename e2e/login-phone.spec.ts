import { test, expect } from '@playwright/test';

test.setTimeout(120_000);

const STEP_DELAY = parseInt(process.env.STEP_DELAY || '0', 10);
const wait = (page: any) => STEP_DELAY > 0 && page.waitForTimeout(STEP_DELAY);

/** Playwright 内置高亮 + 点击，headed 模式下可见红框闪烁 */
async function click(locator: any, options?: any) {
  if (STEP_DELAY > 0) await locator.highlight();
  await locator.click(options);
}

test.use({
  ignoreHTTPSErrors: true,
  viewport: { height: 1200, width: 1880 },
});

test('用户可以使用手机号登录', async ({ page }) => {
  // ?openLogin=true 会自动打开登录弹窗，无需点击 header 按钮
  await page.goto('/main/casino?openLogin=true', { waitUntil: 'domcontentloaded' });
  await wait(page);

  // 手机号输入框（限定在可见弹窗 dialog[open] 内，排除隐藏的注册弹窗）
  const phoneInput = page.locator('dialog[open] .phone-email-input-container input');
  await click(phoneInput);
  await wait(page);
  await phoneInput.fill('134');
  await wait(page);

  // 国家码选择按钮（限定在可见弹窗内）
  await click(page.locator('dialog[open] button[aria-haspopup="listbox"]'));
  await wait(page);

  // 国家搜索输入框（在下拉容器 div.absolute 内，不在 role="listbox" 内）
  await page.locator('dialog[open] .phone-email-input-container .absolute input[type="text"]').fill('86');
  await wait(page);

  // 选中"China"（搜索后只剩一条结果 +86，用 role 定位不依赖文字）
  await click(page.locator('[role="listbox"] [role="option"]').first());
  await wait(page);

  // 填写完整手机号
  await phoneInput.fill('13422323556');
  await wait(page);

  // 密码输入框（限定在可见弹窗内，排除隐藏弹窗的密码框）
  const pwd = page.locator('dialog[open] input[type="password"]');
  await click(pwd);
  await wait(page);
  await pwd.fill('123456');
  await wait(page);

  // 在提交前注册 API 响应拦截
  const loginRespPromise = page.waitForResponse(
    resp => resp.url().includes('/Authentication/login') && resp.request().method() === 'POST'
  );

  // 提交按钮（限定在可见弹窗内）
  await click(page.locator('dialog[open] button[type="submit"]'));
  await wait(page);

  // ==== 登录接口检查 =====
  const loginResp = await loginRespPromise;
  expect(loginResp.ok()).toBeTruthy();
  const loginBody = await loginResp.json();
  expect(loginBody.code).toBe(0);
});
