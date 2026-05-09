import { test, expect } from '@playwright/test';

// 增加超时时间以支持多分类循环测试
test.setTimeout(300_000);

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

/**
 * Casino 首页全量分类测试 (Featured + All Categories)
 * 
 * 对应业务逻辑：
 * - FeaturedGames (热门游戏)
 * - CategoryGames map (各类游戏：Slots, Live Casino, Fishing, Fast 等)
 * 
 * 测试流程（基于 Codegen 录制改写）：
 * 1. 遍历所有分类区块 (.animate-fade-in)
 * 2. 对每个区块执行：
 *    - 点击游戏卡片进入详情 -> 返回
 *    - 点击 "All" 按钮进入 Explore -> 验证 API -> 点击 Explore 卡片 -> 返回
 *    - 点击左右翻页箭头
 */
test('Casino 首页全量分类测试 (Featured + All Categories)', async ({ page }) => {
  await page.goto('/main/casino', { waitUntil: 'domcontentloaded' });
  await wait(page);

  // 1. 获取所有分类区块（.animate-fade-in）
  const sections = page.locator('.animate-fade-in');
  await sections.first().waitFor({ state: 'visible', timeout: 20000 });
  const sectionCount = await sections.count();
  console.log(`Detected ${sectionCount} game sections to test.`);

  // 2. 循环遍历每个区块
  for (let i = 0; i < sectionCount; i++) {
    // 每次循环重新定位 section，防止 DOM 刷新导致失效
    const section = page.locator('.animate-fade-in').nth(i);
    
    // 获取当前 section 的标题（用于日志/调试）
    const title = await section.locator('p.text-md, p.text-lg').first().innerText().catch(() => `Section ${i}`);
    console.log(`Testing section ${i}: ${title}`);

    // --- A. 随机点击该区块的一个游戏卡片 ---
    const gameCards = section.locator('[class*="aspect-"][class*="cursor-pointer"]');
    const cardCount = await gameCards.count();
    if (cardCount > 0) {
      // 随机选择一个索引（限制在前 10 个以内，确保可见性）
      const randomIndex = Math.floor(Math.random() * Math.min(cardCount, 10));
      const targetCard = gameCards.nth(randomIndex);
      
      console.log(`Clicking random game card at index ${randomIndex} in section ${title}`);
      await targetCard.scrollIntoViewIfNeeded(); // 确保滚动到视口
      await click(targetCard);
      
      await wait(page);
      // 跳转到游戏详情页，放宽超时时间到 20s
      await page.waitForURL('**/games/**', { timeout: 20000 });
      await wait(page);
      
      // 回到首页
      await page.goto('/main/casino', { waitUntil: 'domcontentloaded' });
      await wait(page);
    }

    // --- B. 点击该区块的 "All" 按钮 ---
    const currentSection = page.locator('.animate-fade-in').nth(i);
    const allButton = currentSection.locator('button:not(.btn-square)');
    if (await allButton.count() > 0) {
      // 注册 API 拦截（Explore 页面加载时触发 getCommonGameListV2）
      const exploreApiPromise = page.waitForResponse(
        resp => resp.url().includes('/GameList/getCommonGameListV2') && resp.status() === 200,
        { timeout: 20000 }
      );

      await click(allButton);
      await wait(page);
      await page.waitForURL('**/explore**', { timeout: 15000 });
      await wait(page);

      // 验证 Explore 页面接口
      const exploreResp = await exploreApiPromise;
      const exploreBody = await exploreResp.json();
      expect(exploreBody.code).toBe(0);

      // 在 Explore 页面等待列表加载完成
      await page.locator('[class*="aspect-"][class*="cursor-pointer"]').first().waitFor({ state: 'visible', timeout: 10000 });

      // 在 Explore 页面随机点击一个卡片
      const exploreGameCards = page.locator('[class*="aspect-"][class*="cursor-pointer"]');
      const exploreCount = await exploreGameCards.count();
      if (exploreCount > 0) {
        // Explore 页面通常卡片较多，取前 20 个
        const randomIndex = Math.floor(Math.random() * Math.min(exploreCount, 20));
        const targetExploreCard = exploreGameCards.nth(randomIndex);
        
        console.log(`Clicking random game card at index ${randomIndex} on Explore page`);
        await targetExploreCard.scrollIntoViewIfNeeded();
        await click(targetExploreCard);
      }
      
      await wait(page);
      await page.waitForURL('**/games/**', { timeout: 20000 });
      await wait(page);

      // 回到首页
      await page.goto('/main/casino', { waitUntil: 'domcontentloaded' });
      await wait(page);
    }

    // --- C. 测试该区块的左右箭头 ---
    const targetSection = page.locator('.animate-fade-in').nth(i);
    const arrows = targetSection.locator('button.btn-square');
    if (await arrows.count() >= 2) {
      // 右箭头
      await click(arrows.nth(1));
      await wait(page);
      // 左箭头
      await click(arrows.nth(0));
      await wait(page);
    }
    
    console.log(`Finished testing section: ${title}`);
  }
});

