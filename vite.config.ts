import { defineConfig, loadEnv } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'
import { nodePolyfills } from 'vite-plugin-node-polyfills';

import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path, { resolve } from 'node:path'
import { writeFileSync, readFileSync, existsSync, copyFileSync } from 'node:fs'
import versionPlugin from './vite-version-plugin';
import mkcert from 'vite-plugin-mkcert';

// const workboxMode = process.env.WORKBOX_MODE === 'production' ? 'production' : 'development';

// const pwaOptions: Partial<VitePWAOptions> = {
//   minify: false,
//   registerType: 'autoUpdate',
//   includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
//   injectRegister: 'inline',
//   devOptions: {
//     enabled: true,
//     suppressWarnings: true
//   },
//   workbox: {
//     mode: workboxMode,
//     globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf,otf}'],
//     maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
//     cleanupOutdatedCaches: true,
//     skipWaiting: false,
//     clientsClaim: false,
//     navigateFallback: null,
//     disableDevLogs: true,
//     runtimeCaching: [
//       // HTML 文件 - 总是从网络获取最新版本
//       {
//         urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
//         handler: 'NetworkOnly' // 强制从网络获取，不使用缓存
//       },
//       // 多语言文件 - 使用 NetworkFirst 确保获取最新内容
//       {
//         urlPattern: /\/locales\/.*\.json$/i,
//         handler: 'NetworkFirst',
//         options: {
//           cacheName: 'i18n-cache',
//           expiration: {
//             maxEntries: 50,
//             maxAgeSeconds: 60 * 60 * 24 // 24小时
//           },
//           networkTimeoutSeconds: 3 // 3秒超时后使用缓存
//         }
//       },
//       // 主题配置文件 - 同样需要实时更新
//       {
//         urlPattern: /theme-config\.json$/i,
//         handler: 'NetworkFirst',
//         options: {
//           cacheName: 'theme-cache',
//           expiration: {
//             maxEntries: 5,
//             maxAgeSeconds: 60 * 60 * 24 // 24小时
//           },
//           networkTimeoutSeconds: 3
//         }
//       },
//       // 其他 JSON 配置文件
//       {
//         urlPattern: /\.json$/i,
//         handler: 'NetworkFirst',
//         options: {
//           cacheName: 'json-cache',
//           expiration: {
//             maxEntries: 30,
//             maxAgeSeconds: 60 * 60 * 24 // 24小时
//           },
//           networkTimeoutSeconds: 3
//         }
//       },
//       // Google Fonts
//       {
//         urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
//         handler: 'StaleWhileRevalidate',
//         options: {
//           cacheName: 'google-fonts-stylesheets',
//           expiration: {
//             maxEntries: 10,
//             maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
//           }
//         }
//       },
//       {
//         urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
//         handler: 'CacheFirst',
//         options: {
//           cacheName: 'google-fonts-webfonts',
//           expiration: {
//             maxEntries: 30,
//             maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
//           }
//         }
//       },
//       // 图片资源
//       {
//         urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
//         handler: 'CacheFirst',
//         options: {
//           cacheName: 'images-cache',
//           expiration: {
//             maxEntries: 200,
//             maxAgeSeconds: 60 * 60 * 24 * 30 // 30天
//           }
//         }
//       },
//       // API缓存 - 适用于相对稳定的数据
//       {
//         urlPattern: /\/api\/public\/.*/i,
//         handler: 'NetworkFirst', // 使用 networkTimeoutSeconds 时必须是 NetworkFirst
//         options: {
//           cacheName: 'api-public-cache',
//           expiration: {
//             maxEntries: 50,
//             maxAgeSeconds: 60 * 60 * 2 // 2小时
//           },
//           networkTimeoutSeconds: 3 // 3秒后从缓存中获取
//         }
//       },
//       // 关键静态资源 - 网络优先，短缓存
//       {
//         urlPattern: /\.(?:js|css)$/i,
//         handler: 'NetworkFirst', // 网络优先，快速获取最新版本
//         options: {
//           cacheName: 'critical-resources',
//           expiration: {
//             maxEntries: 100,
//             maxAgeSeconds: 60 * 30 // 30分钟极短缓存
//           },
//           networkTimeoutSeconds: 3 // 3秒超时后使用缓存
//         }
//       },
//       // 字体文件 - 可以使用较长缓存
//       {
//         urlPattern: /\.(?:woff2|woff|ttf|otf)$/i,
//         handler: 'CacheFirst',
//         options: {
//           cacheName: 'fonts-cache',
//           expiration: {
//             maxEntries: 30,
//             maxAgeSeconds: 60 * 60 * 24 * 30 // 30天
//           }
//         }
//       }
//     ]
//   },
//   manifest: {
//     name: 'GAME.ON - Gaming Platform',
//     short_name: 'GAME.ON',
//     description: 'Premium online gaming platform with casino games, sports betting, and more',
//     lang: 'en',
//     theme_color: '#0f1419', // 使用更现代的深色主题
//     background_color: '#0f1419',
//     display: 'standalone',
//     display_override: ['window-controls-overlay', 'standalone'],
//     orientation: 'portrait-primary',
//     scope: '/',
//     start_url: '/?source=pwa',
//     id: 'game-on-pwa',
//     categories: ['games', 'entertainment', 'sports'],
//     screenshots: [
//       {
//         src: '/images/screenshot-mobile.png',
//         sizes: '390x844',
//         type: 'image/png',
//         form_factor: 'narrow',
//         label: 'Mobile view of the gaming platform'
//       },
//       {
//         src: '/images/screenshot-desktop.png',
//         sizes: '1920x1080',
//         type: 'image/png',
//         form_factor: 'wide',
//         label: 'Desktop view of the gaming platform'
//       }
//     ],
//     icons: [
//       {
//         src: '/favicon.ico',
//         sizes: '48x48',
//         type: 'image/x-icon'
//       },
//       {
//         src: '/icons/icon-192x192.png',
//         sizes: '192x192',
//         type: 'image/png',
//         purpose: 'any'
//       },
//       {
//         src: '/icons/icon-192x192.png',
//         sizes: '192x192',
//         type: 'image/png',
//         purpose: 'maskable'
//       },
//       {
//         src: '/logo-512x512.png',
//         sizes: '512x512',
//         type: 'image/png',
//         purpose: 'any'
//       },
//       {
//         src: '/logo-512x512.png',
//         sizes: '512x512',
//         type: 'image/png',
//         purpose: 'maskable'
//       },
//       {
//         src: '/apple-touch-icon.png',
//         sizes: '180x180',
//         type: 'image/png'
//       }
//     ],
//     shortcuts: [
//       {
//         name: 'Casino Games',
//         short_name: 'Casino',
//         description: 'Access casino games directly',
//         url: '/casino?source=pwa-shortcut',
//         icons: [
//           {
//             src: '/icons/casino-shortcut.png',
//             sizes: '192x192',
//             type: 'image/png'
//           }
//         ]
//       },
//       {
//         name: 'Sports Betting',
//         short_name: 'Sports',
//         description: 'Access sports betting',
//         url: '/sports?source=pwa-shortcut',
//         icons: [
//           {
//             src: '/icons/sports-shortcut.png',
//             sizes: '192x192',
//             type: 'image/png'
//           }
//         ]
//       }
//     ]
//   }
// }

const timeVersion = new Date().getTime();

// 将 timeVersion 写入 .env 文件，保留现有内容
function writeVersionToEnv(version: number) {
  const envPath = resolve(process.cwd(), '.env');

  try {
    let envContent = '';

    // 如果 .env 文件存在，读取现有内容
    if (existsSync(envPath)) {
      const existingContent = readFileSync(envPath, 'utf8');

      // 检查是否已有 VITE_VERSION 变量
      const viteVersionRegex = /^VITE_VERSION=.*$/m;
      if (viteVersionRegex.test(existingContent)) {
        // 替换现有的 VITE_VERSION
        envContent = existingContent.replace(viteVersionRegex, `VITE_VERSION=${version}`);
      } else {
        // 添加新的 VITE_VERSION 到文件末尾
        envContent = existingContent.trim() + '\n\n# Auto-generated version\nVITE_VERSION=' + version + '\n';
      }
    } else {
      // 如果文件不存在，创建新文件
      envContent = `# Environment variables
VITE_VERSION=${version}
`;
    }

    writeFileSync(envPath, envContent, 'utf8');
    console.log(`✅ VITE_VERSION=${version} 已更新到 .env 文件`);
  } catch (error) {
    console.warn('⚠️ 无法写入 .env 文件:', error);
  }
}

// 写入版本号到 .env 文件
writeVersionToEnv(timeVersion);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const baseFolder = env.VITE_FOLDER;
  const isRoibest = env.VITE_PROMOTION_MODEL === 'roibest';
  const isLanding = env.VITE_PROMOTION_MODEL === 'landing';
  const baseUrl = isRoibest && env.NODE_ENV !== 'development' ? `/${baseFolder}/` : '/';

  const pwaOptions: Partial<VitePWAOptions> = {
    registerType: 'autoUpdate',
    workbox: {
      cacheId: env.VITE_WEBSITE_NICKNAME || '1st.game',
      navigateFallback: 'index.html',
      navigateFallbackDenylist: [/^\/landing\//],
      // Increase maximum file size limit for precached assets (default is 2 MiB)
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    },
    devOptions: {
      enabled: true,
    },
    manifest: {
      id: "/pwa-main",
      name: env.VITE_WEBSITE_NICKNAME || '1st.game',
      short_name: env.VITE_WEBSITE_NICKNAME_LEFT || '1ST',
      description: `Enter the world of ${env.VITE_WEBSITE_NICKNAME || '1st.game'} - your premier crypto entertainment hub. Play instantly, earn exclusive rewards, rise through the ranks, and challenge everything. No limits. Just the thrill.`,
      theme_color: '#0f1419',
      icons: [
        {
          src: `favicon/${env.VITE_THEME || '1stgame'}/web-app-manifest-192x192.png`,
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: `favicon/${env.VITE_THEME || '1stgame'}/web-app-manifest-512x512.png`,
          sizes: "512x512",
          type: "image/png",
        }
      ],
    },
  };


  // 自定义插件：处理 roibest 静态资源路径
  function staticPathPlugin() {
    if (isRoibest) {
      return {
        name: 'static-path-plugin',
        transform(code: string, id: string) {
          if (id.includes('node_modules')) return null

          // 处理 TypeScript/JavaScript/JSX/TSX 文件
          if (id.endsWith('.ts') || id.endsWith('.tsx') || id.endsWith('.js') || id.endsWith('.jsx')) {
            let transformedCode = code;
            // 只替换字符串字面量中的静态资源路径，避免影响 import 语句
            // 使用更精确的正则表达式，确保只匹配字符串字面量中的路径
            // 匹配引号内的路径，但不匹配 import/from/require 语句
            const assetsBaseUrl = baseUrl.length > 1 ? baseUrl : '';
            transformedCode = transformedCode.replace(/['"`]\/images\//g, match => match[0] + assetsBaseUrl + 'images/');
            transformedCode = transformedCode.replace(/['"`]\/locales\//g, match => match[0] + assetsBaseUrl + 'locales/');
            transformedCode = transformedCode.replace(/['"`]\/icons\//g, match => match[0] + assetsBaseUrl + 'icons/');
            transformedCode = transformedCode.replace(/['"`]\/logos\//g, match => match[0] + assetsBaseUrl + 'logos/');
            transformedCode = transformedCode.replace(/['"`]\/favicon\//g, match => match[0] + assetsBaseUrl + 'favicon/');
            return transformedCode;
          }
          // 处理 CSS 文件
          if (id.endsWith('.css') || id.endsWith('.scss') || id.endsWith('.sass')) {
            let transformedCode = code;
            // 替换 CSS 中的 url() 引用
            const assetsBaseUrl = baseUrl.length > 1 ? baseUrl : '';
            transformedCode = transformedCode.replace(/url\(\/images\//g, `url(${assetsBaseUrl}images/`);
            transformedCode = transformedCode.replace(/url\(\/locales\//g, `url(${assetsBaseUrl}locales/`);
            transformedCode = transformedCode.replace(/url\(\/icons\//g, `url(${assetsBaseUrl}icons/`);
            transformedCode = transformedCode.replace(/url\(\/logos\//g, `url(${assetsBaseUrl}logos/`);
            transformedCode = transformedCode.replace(/url\(\/favicon\//g, `url(${assetsBaseUrl}favicon/`);
            return transformedCode;
          }
          return code;
        },
      };
    }
  }

  function faviconCopyPlugin() {
    return {
      name: 'favicon-copy-plugin',
      apply: 'build' as const,
      buildStart() {
        const theme = env.VITE_THEME || '1stgame';
        const sourcePath = path.resolve(__dirname, `public/favicon/${theme}/favicon.ico`);
        const targetPath = path.resolve(__dirname, 'public/favicon.ico');

        try {
          // 检查源文件是否存在
          if (existsSync(sourcePath)) {
            // 复制文件
            copyFileSync(sourcePath, targetPath);
            console.log(`✅ 已复制 favicon.ico: ${theme} -> public/favicon.ico`);
          } else {
            console.warn(`⚠️  源文件不存在: ${sourcePath}`);
          }
        } catch (error) {
          console.error(`❌ 复制 favicon.ico 失败:`, error);
        }
      },
    };
  }

  const plugins = [
    nodePolyfills({
      include: ['buffer', 'process', 'crypto', 'stream'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      overrides: {
        vm: resolve(__dirname, './src/polyfills/vm.js'),
      },
    }),
    mkcert(),
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    ...(isRoibest ? [staticPathPlugin()!] : []),
    faviconCopyPlugin(),
    versionPlugin({
      version: timeVersion,
      facebookPixelId: env.VITE_FACEBOOK_PIXEL_ID,
      nameBlock: env.VITE_WEBSITE_NAME_BLOCK || '1st.game',
      nickname: env.VITE_WEBSITE_NICKNAME || '1st.game',
      websiteUrl: env.VITE_WEBSITE_URL || 'https://1st.game',
      theme: env.VITE_THEME || '1stgame'
    }),
  ]

  // 根据环境条件添加PWA插件
  if (!isRoibest && !isLanding) {
    plugins.push(VitePWA(pwaOptions));
  }

  return {
    plugins,
    base: baseUrl,
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        vm: resolve(__dirname, './src/polyfills/vm.js')
      },
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: () => `assets/[name].${timeVersion}.js`,
          chunkFileNames: () => `assets/[name].${timeVersion}.js`,
          assetFileNames: (assetInfo: { name?: string }) => {
            const rawName = assetInfo.name || '';
            const baseName = rawName.split('/').pop() || rawName;
            const isImage = /\.(png|jpg|jpeg|svg|webp|gif|ico)$/i.test(baseName);
            const isLogo = /^logo-/i.test(baseName);
            if (isImage && isLogo) {
              // logo 系列资源：不在文件名插入时间戳
              return `assets/[name].[ext]`;
            }
            return `assets/[name].${timeVersion}.[ext]`;
          },
        },
      },
    },
  } as any
})