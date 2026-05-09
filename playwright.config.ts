import { defineConfig, devices } from "@playwright/test";

// 从环境变量读取目标地址，默认本地开发环境
// 用法：npx playwright test --base-url=https://your-domain.com
const baseURL = process.env.E2E_BASE_URL ?? "https://localhost:3000";

/**
 * Playwright E2E 测试配置
 * 文档: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 测试文件目录
  testDir: "./e2e",

  // 所有测试完成前的超时时间（毫秒）
  timeout: 30 * 1000,

  // 期望（expect）断言超时时间
  expect: {
    timeout: 5000,
  },

  // 在 CI 环境中禁止 test.only
  forbidOnly: !!process.env.CI,

  // 失败时重试次数（CI 环境重试2次，本地不重试）
  retries: process.env.CI ? 2 : 0,

  // 并发 worker 数量（本地使用一半 CPU 核心）
  workers: process.env.CI ? 1 : undefined,

  // 测试报告器
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],

  // 所有测试共享的基础配置
  use: {
    // 从环境变量或默认值读取
    baseURL,

    // 线上环境通常不忽略 HTTPS 错误，仅本地开发需要
    ignoreHTTPSErrors: baseURL.includes("localhost"),

    // 失败时自动截图
    screenshot: "only-on-failure",

    // 失败时录制视频（"retain-on-failure" 仅保留失败用例的视频）
    video: "retain-on-failure",

    // 追踪文件（失败时保留，用于调试）
    trace: "retain-on-failure",
  },

  // 浏览器配置（仅 Chromium）
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // 运行测试前自动启动开发服务器（可选，取消注释即可启用）
  // webServer: {
  //   command: "pnpm dev",
  //   url: "http://localhost:3000",
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
