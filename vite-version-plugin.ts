import type { Plugin } from "vite";
import { getThemeByName } from "./src/themes/presets";

type Version = {
  version: number | string;
  facebookPixelId: string;
  nameBlock: string;
  websiteUrl: string;
  nickname: string;
  theme: string;
  alibabaRumEndpoint?: string;
  gtmId?: string;
  themeConfig?: string;
  logoBaseUrl?: string;
  faviconBaseUrl?: string;
  baseUrl?: string;
  logoLoaderUrl?: string;
  logoPwaUrl?: string;
  faviconPngUrl?: string;
  faviconSvgUrl?: string;
  faviconIcoUrl?: string;
  faviconAppleUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoOgTitle?: string;
  seoOgDescription?: string;
  seoOgImage?: string;
  seoOgImageWidth?: string;
  seoOgImageHeight?: string;
  seoOgSiteName?: string;
  pwaThemeColor?: string;
  pwaBackgroundColor?: string;
  pwaStatusBarStyle?: string;
};

export default ({
  version,
  nameBlock,
  nickname,
  websiteUrl,
  theme,
  alibabaRumEndpoint,
  gtmId,
  themeConfig,
  logoBaseUrl,
  faviconBaseUrl,
  baseUrl,
  logoLoaderUrl: _logoLoaderUrl,
  logoPwaUrl: _logoPwaUrl,
  faviconPngUrl: _faviconPngUrl,
  faviconSvgUrl: _faviconSvgUrl,
  faviconIcoUrl: _faviconIcoUrl,
  faviconAppleUrl: _faviconAppleUrl,
  seoTitle,
  seoDescription,
  seoOgTitle,
  seoOgDescription,
  seoOgImage,
  seoOgImageWidth,
  seoOgImageHeight,
  seoOgSiteName,
  pwaThemeColor,
  pwaBackgroundColor,
  pwaStatusBarStyle,
}: Version): Plugin => {
  return {
    name: "version-plugin", // 必须的，将会在 warning 和 error 中显示
    transformIndexHtml(html: string) {
      const normalizedPwaBackgroundColor = pwaBackgroundColor?.trim();
      const normalizedPwaThemeColor = pwaThemeColor?.trim();
      const defaultLoaderBase = normalizedPwaBackgroundColor || normalizedPwaThemeColor || "#0f1419";
      let base200 = defaultLoaderBase;
      let base300 = defaultLoaderBase;
      const parseThemeConfig = () => {
        if (!themeConfig) return null;
        const rawConfig = themeConfig.trim();
        const candidates = [rawConfig];

        if (rawConfig.length > 2) {
          const first = rawConfig.charAt(0);
          const last = rawConfig.charAt(rawConfig.length - 1);
          if ((first === "'" && last === "'") || (first === '"' && last === '"')) {
            candidates.push(rawConfig.substring(1, rawConfig.length - 1));
          }
        }

        for (const candidate of candidates) {
          try {
            const parsed = JSON.parse(candidate);
            if (typeof parsed === "string") {
              return JSON.parse(parsed);
            }
            return parsed;
          } catch {
            // continue
          }

          try {
            const normalizedCandidate = candidate.replace(/\\"/g, '"');
            if (normalizedCandidate !== candidate) {
              const parsed = JSON.parse(normalizedCandidate);
              if (typeof parsed === "string") {
                return JSON.parse(parsed);
              }
              return parsed;
            }
          } catch {
            // continue
          }
        }

        console.warn("Failed to parse VITE_THEME_CONFIG for loader variables.");
        return null;
      };

      const runtimeConfig = parseThemeConfig();
      const fallbackThemeName = runtimeConfig?.colorSchema === "light" ? "light" : "default";
      const fallbackTheme = getThemeByName(fallbackThemeName) || getThemeByName("default");
      const themeName = typeof runtimeConfig?.currentTheme === "string" ? runtimeConfig.currentTheme : (theme || "default");
      const presetTheme = getThemeByName(themeName);

      // 优先级: customOverrides.colors > colors > presetTheme > fallbackTheme
      const configColors = (runtimeConfig?.customOverrides?.colors || runtimeConfig?.colors || {}) as Record<string, string>;
      const presetColors = (presetTheme?.colors || fallbackTheme?.colors || {}) as Record<string, string>;
      const fallbackColors = (runtimeConfig ? (fallbackTheme?.colors || {}) : {}) as Record<string, string>;

      base200 = configColors.base200 || presetColors.base200 || fallbackColors.base200 || base200;
      base300 = configColors.base300 || presetColors.base300 || fallbackColors.base300 || base300;

      // 构建时解析完整的颜色映射表：CSS 变量名 -> 颜色值
      // configColors 优先，presetColors 兜底
      const colorVarMap: Record<string, string> = {
        "--color-primary": configColors.primary || presetColors.primary || "",
        "--color-primary-content": configColors.primaryContent || presetColors.primaryContent || "",
        "--color-secondary": configColors.secondary || presetColors.secondary || "",
        "--color-secondary-content": configColors.secondaryContent || presetColors.secondaryContent || "",
        "--color-accent": configColors.accent || presetColors.accent || "",
        "--color-accent-content": configColors.accentContent || presetColors.accentContent || "",
        "--color-neutral": configColors.neutral || presetColors.neutral || "",
        "--color-neutral-content": configColors.neutralContent || presetColors.neutralContent || "",
        "--color-base-100": configColors.base100 || presetColors.base100 || "",
        "--color-base-200": configColors.base200 || presetColors.base200 || "",
        "--color-base-300": configColors.base300 || presetColors.base300 || "",
        "--color-base-400": configColors.base400 || presetColors.base400 || "",
        "--color-base-content": configColors.baseContent || presetColors.baseContent || "",
        "--color-info": configColors.info || presetColors.info || "",
        "--color-info-content": configColors.infoContent || presetColors.infoContent || "",
        "--color-success": configColors.success || presetColors.success || "",
        "--color-success-content": configColors.successContent || presetColors.successContent || "",
        "--color-warning": configColors.warning || presetColors.warning || "",
        "--color-warning-content": configColors.warningContent || presetColors.warningContent || "",
        "--color-error": configColors.error || presetColors.error || "",
        "--color-error-content": configColors.errorContent || presetColors.errorContent || "",
      };

      // 构建非颜色主题变量
      const configOverrides = runtimeConfig?.customOverrides || {};
      const themeVarMap: Record<string, string> = {};
      const radiusSelector = configOverrides.radiusSelector || presetTheme?.radiusSelector || fallbackTheme?.radiusSelector;
      const radiusField = configOverrides.radiusField || presetTheme?.radiusField || fallbackTheme?.radiusField;
      const radiusBox = configOverrides.radiusBox || presetTheme?.radiusBox || fallbackTheme?.radiusBox;
      const sizeSelector = configOverrides.sizeSelector || presetTheme?.sizeSelector || fallbackTheme?.sizeSelector;
      const sizeField = configOverrides.sizeField || presetTheme?.sizeField || fallbackTheme?.sizeField;
      const borderWidth = configOverrides.border || presetTheme?.border || fallbackTheme?.border;
      const fontFamily = configOverrides.fontFamily || presetTheme?.fontFamily || fallbackTheme?.fontFamily;

      if (radiusSelector) themeVarMap["--radius-selector"] = radiusSelector;
      if (radiusField) themeVarMap["--radius-field"] = radiusField;
      if (radiusBox) themeVarMap["--radius-box"] = radiusBox;
      if (sizeSelector) themeVarMap["--size-selector"] = sizeSelector;
      if (sizeField) themeVarMap["--size-field"] = sizeField;
      if (borderWidth) themeVarMap["--border"] = borderWidth;
      if (fontFamily) themeVarMap["--font-family"] = fontFamily;

      // 生成 :root CSS 声明
      const allVars = { ...colorVarMap, ...themeVarMap };
      const cssDeclarations = Object.entries(allVars)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}:${v}`)
        .join(";");

      // 注入 <style> 到 <head> 最前面，确保在 loader.css 之前生效
      // 这是纯 CSS，浏览器解析 HTML 时立即生效，无需等 JS 执行
      const loaderThemeStyle = `<style id="loader-theme-vars">:root{${cssDeclarations}}</style>`;

      const loaderCriticalStyle = `<style id="loader-critical-colors">
        :root {
          --color-base-200: ${base200};
          --color-base-300: ${base300};
        }
        html, body {
          background: ${base300};
        }
        #initial-loader {
          background: radial-gradient(circle at center, ${base200} 0%, ${base300} 80%);
        }
      </style>`;

      // 处理环境变量的默认值
      const fallbackName = nameBlock || nickname;
      const defaultDescription = `Enter the world of ${nickname || '1st.game'} - your premier crypto entertainment hub. Play instantly, earn exclusive rewards, rise through the ranks, and challenge everything. No limits. Just the thrill.`;
      const defaultOgTitle = `${nickname || '1st.game'} - Challenge Everything.`;

      const fallbackBaseUrl = baseUrl || "/";

      const defaultLogoLoaderUrl = logoBaseUrl
        ? `${logoBaseUrl}logos/1stlogo.svg`
        : `${fallbackBaseUrl}logos/${theme}/1stlogo.svg`;
      const defaultFaviconPngUrl = faviconBaseUrl
        ? `${faviconBaseUrl}favicon/${theme}/favicon-192x192.png`
        : `${fallbackBaseUrl}favicon/${theme}/favicon-192x192.png`;
      const defaultFaviconSvgUrl = faviconBaseUrl
        ? `${faviconBaseUrl}favicon/${theme}/favicon.svg`
        : `${fallbackBaseUrl}favicon/${theme}/favicon.svg`;
      const defaultFaviconIcoUrl = faviconBaseUrl
        ? `${faviconBaseUrl}favicon.ico`
        : `${fallbackBaseUrl}favicon.ico`;
      const defaultFaviconAppleUrl = faviconBaseUrl
        ? `${faviconBaseUrl}favicon/${theme}/apple-touch-icon.png`
        : `${fallbackBaseUrl}favicon/${theme}/apple-touch-icon.png`;

      let processedHtml = html
        .replace(/%_WEBSITE_NAME_BLOCK_%/g, nameBlock)
        .replace(/%_WEBSITE_NICKNAME_%/g, nickname)
        .replace(/%_WEBSITE_URL_%/g, websiteUrl)
        .replace(/%_THEME_%/g, theme)
        .replace(/%_VERSION_%/g, version.toString())
        .replace(/%_LOGO_BASE_%/g, logoBaseUrl || fallbackBaseUrl)
        .replace(/%_FAVICON_BASE_%/g, faviconBaseUrl || fallbackBaseUrl)
        .replace(/%_LOGO_LOADER_URL_%/g, _logoLoaderUrl || defaultLogoLoaderUrl)
        .replace(/%_FAVICON_PNG_URL_%/g, _faviconPngUrl || defaultFaviconPngUrl)
        .replace(/%_FAVICON_SVG_URL_%/g, _faviconSvgUrl || defaultFaviconSvgUrl)
        .replace(/%_FAVICON_ICO_URL_%/g, _faviconIcoUrl || defaultFaviconIcoUrl)
        .replace(/%_FAVICON_APPLE_URL_%/g, _faviconAppleUrl || defaultFaviconAppleUrl)
        .replace(/%_SEO_TITLE_%/g, seoTitle || fallbackName || "1st.game")
        .replace(/%_SEO_DESCRIPTION_%/g, seoDescription || defaultDescription)
        .replace(/%_SEO_OG_TITLE_%/g, seoOgTitle || defaultOgTitle)
        .replace(/%_SEO_OG_DESCRIPTION_%/g, seoOgDescription || seoDescription || defaultDescription)
        .replace(/%_SEO_OG_IMAGE_%/g, seoOgImage || "")
        .replace(/%_SEO_OG_IMAGE_WIDTH_%/g, seoOgImageWidth || "1000")
        .replace(/%_SEO_OG_IMAGE_HEIGHT_%/g, seoOgImageHeight || "1000")
        .replace(/%_SEO_OG_SITE_NAME_%/g, seoOgSiteName || nickname || "1st.game")
        .replace(/%_PWA_THEME_COLOR_%/g, pwaThemeColor || "#0f1419")
        .replace(/%_PWA_STATUS_BAR_STYLE_%/g, pwaStatusBarStyle || "black-translucent");

      // 将 <style> 注入到 <head> 开头（在 charset meta 之后），确保 CSS 变量在 loader.css 解析前可用
      processedHtml = processedHtml.replace("<meta charset=\"UTF-8\" />", `<meta charset="UTF-8" />\n  ${loaderThemeStyle}`);

      const loaderCssTagPattern = /<link\s+rel=["']stylesheet["']\s+href=["'][^"']*styles\/loader\.css["'][^>]*>/i;
      if (loaderCssTagPattern.test(processedHtml)) {
        processedHtml = processedHtml.replace(loaderCssTagPattern, `${loaderCriticalStyle}$&`);
      } else {
        processedHtml = processedHtml.replace("</head>", `${loaderCriticalStyle}</head>`);
      }

      processedHtml = processedHtml.replace("</head>", `${loaderThemeStyle}</head>`);

      // 注入 GTM head script 到 </head> 之前
      if (gtmId && gtmId.trim()) {
        const gtmHeadScript = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId.trim()}');</script>
<!-- End Google Tag Manager -->
`;
        processedHtml = processedHtml.replace("</head>", `${gtmHeadScript}</head>`);

        // 注入 GTM noscript 到 <body> 之后
        const gtmNoscript = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId.trim()}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
`;
        processedHtml = processedHtml.replace("<body>", `<body>\n${gtmNoscript}`);
      }

      const appConfigScript = `<script>window.__APP_CONFIG__ = { version: ${version} };</script>`;

      const rumScript = (() => {
        const defaultEndpoint = "https://proj-xtrace-92861219819891bcc6637e9aa76e99-us-west-1.us-west-1.log.aliyuncs.com/rum/web/v2?workspace=default-cms-5503844035881823-us-west-1&service_id=1i6y71lx74v@e484ad089e19e544235bb";
        const endpoint = alibabaRumEndpoint && alibabaRumEndpoint.trim().length > 0 ? alibabaRumEndpoint.trim() : defaultEndpoint;

        return `<script>
          (function () {
            var storageKey = "__problem_report_rum__";
            var maxDuration = 30 * 60 * 1000;
            var replaySampling = 1;
            var storage = null;

            try {
              storage = window.localStorage;
            } catch (error) {
              storage = null;
            }

            if (storage) {
              try {
                var rawValue = storage.getItem(storageKey);

                if (rawValue) {
                  var parsedValue = JSON.parse(rawValue);
                  var expiresAt = typeof parsedValue.expiresAt === "number" ? parsedValue.expiresAt : 0;
                  var isEnabled = Boolean(parsedValue.enabled) && expiresAt > Date.now() && expiresAt <= Date.now() + maxDuration;

                  if (isEnabled) {
                    replaySampling = 100;
                  } else {
                    storage.removeItem(storageKey);
                  }
                }
              } catch (error) {
                storage.removeItem(storageKey);
              }

              if (replaySampling !== 100) {
                storage.removeItem("_arms_session");
              }
            }

            window.__PROBLEM_REPORT_REPLAY_SAMPLING__ = replaySampling;
          })();

          // t110774 PR10: 把 Aliyun RUM SDK (74 KB) 加载推迟到 paint 后的 idle 期。
          // SDK 阻塞 main thread 435ms scripting 时间（lighthouse bootup-time top 5）；
          // 它本身只用于 perf / error 监控，对首屏功能不关键。Safari 16- fallback setTimeout(2000ms)。
          var __initRum = function () {
          !(function(c,b,d,a){c[a]||(c[a]={});c[a]=
            {
              endpoint: '${endpoint}',              
              // Set environment information, reference values: 'prod' | 'gray' | 'pre' | 'daily' | 'local'
              env: "${version}" + '-' + window.location.hostname, 
              // Set spa mode, reference values: 'history' | 'hash'
              spaMode: 'history',
              replay: {
                enable: true, 
                sampling: window.__PROBLEM_REPORT_REPLAY_SAMPLING__ || 1,
                privacy: {
                  level: 'allow'
                }
              },
              collectors: {
                // Page performance metrics monitoring switch - Default enabled
                perf: true,
                // webVitals metrics monitoring switch - Default enabled
                webVitals: true,
                // AJAX monitoring switch - Default enabled
                api: true,
                // Static resource switch - Default enabled
                staticResource: true,
                // JavaScript error monitoring switch - Default enabled
                jsError: true,
                // Console error monitoring switch - Default enabled
                consoleError: true,
                // User behavior monitoring switch - Default enabled
                action: {
                  enable: true,
                  trackUserInteractions: true,
                  sampling: 100, // 100% 采样率
                },
              },
              // Session configuration 
              sessionConfig: {
                sampleRate: 100, // Session sampling configuration, default 100% sampling rate
                storage: 'localStorage',
              },
              // Link tracing configuration switch - Default disabled
              tracing: false,
            }
            with (b) with (body) with (insertBefore(createElement("script"), firstChild)) setAttribute("crossorigin", "", src = d)
          })(window, document, "https://1i6y71lx74v-sdk.rum.aliyuncs.com/v2/browser-sdk.js?env=gray", "__rum");
          };
          if (typeof window.requestIdleCallback === "function") {
            window.requestIdleCallback(__initRum, { timeout: 5000 });
          } else {
            setTimeout(__initRum, 2000);
          }
        </script>`;
      })();

      return processedHtml.replace("</body>", `${appConfigScript}${rumScript}</body>`);
    }
  };
};


/**
 * 包拆分
 */
export function manualChunksFun(id: string | string[]) {
  if (id.includes("node_modules")) {
    // if (id.includes('react')) {
    //   if (id.includes('react-dom')) {
    //     尝试将 react-dom 的不同部分分开
    // if (id.includes('client')) return 'react-dom-client';
    // if (id.includes('server')) return 'react-dom-server';
    // if (id.includes('test-utils')) return 'react-dom-test-utils';
    // return 'react-dom';
    // }
    if (id.includes("@tanstack/react-router")) return "router";
    if (id.includes("@tanstack/react-query")) return "query";
    // return 'react-core';
    // }

    // UI 组件库
    if (id.includes("lucide-react") || id.includes("daisyui")) {
      return "ui";
    }

    // 工具库
    if (id.includes("es-toolkit")) {
      return "utils";
    }

    // 动画库
    if (id.includes("framer-motion") || id.includes("motion")) {
      return "animation";
    }

    // 日期处理
    if (id.includes("dayjs")) {
      return "date";
    }

    // 国际化
    if (id.includes('react-i18next') || id.includes('i18next')) {
      return 'i18n';
    }

    // 电话号码输入
    if (id.includes('react-phone-number-input')) {
      return 'phone-input';
    }

    // 轮播图组件 - Embla
    if (id.includes('embla-carousel')) {
      return 'embla';
    }

    // TODO: 暂时还未上线 Firebase 功能
    if (id.includes('firebase')) {
      return 'firebase';
    }

    // 图标系统
    if (id.includes('@iconify/react')) {
      return 'icons';
    }

    // 样式组件
    if (id.includes('styled-components') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
      return 'styles';
    }

    // 工具类库
    if (id.includes('clsx')) {
      return 'helpers';
    }

    // 验证和安全
    if (id.includes('@hcaptcha')) {
      return 'security';
    }

    // 轻量级 QR 码库
    if (id.includes('qr.js')) {
      return 'qr';
    }

    // 媒体处理
    if (id.includes('react-avatar-editor') || id.includes('node-vibrant')) {
      return 'media';
    }

    // mqtt
    if (id.includes('mqtt')) {
      return 'mqtt';
    }

    // paginate
    if (id.includes('react-paginate')) {
      return 'paginate';
    }

    // pwa-install
    if (id.includes('@khmyznikov/pwa-install')) {
      return 'pwa-install';
    }

    // axios
    if (id.includes('axios')) {
      return 'axios';
    }

    // t110774 PR11: 把以下重依赖从 vendor 拆出，减小 entry-time vendor 体积。
    // 它们大多只在特定路由或场景用到（finance / wallet / spin / video player / TG），
    // 拆出后浏览器只在用到的路由才下载对应 chunk。

    // Sentry 错误监控（~80 KB）—— 只在错误捕获路径用
    if (id.includes('@sentry')) {
      return 'sentry';
    }

    // Telegram Mini App SDK（~30 KB）—— 仅 TG 路径用
    if (id.includes('@tma.js') || id.includes('@telegram-apps')) {
      return 'telegram';
    }

    // Cloudflare Stream React 视频播放器（~30 KB）—— 极少首屏路径用
    if (id.includes('@cloudflare/stream-react')) {
      return 'stream';
    }

    // matter-js 物理引擎（~80 KB）—— spin-wheel 才会用
    if (id.includes('matter-js')) {
      return 'physics';
    }

    // gsap 动画（~50 KB）—— 跟 framer-motion 互补，单独拆
    if (id.includes('gsap')) {
      return 'gsap';
    }

    // swiper 轮播（~30 KB）—— 跟 embla 是替代关系，少数页面用
    if (id.includes('swiper')) {
      return 'swiper';
    }

    // react-virtuoso 虚拟列表（~30 KB）—— 长列表场景
    if (id.includes('react-virtuoso')) {
      return 'virtuoso';
    }

    // simplebar 自定义滚动条（~40 KB）
    if (id.includes('simplebar')) {
      return 'scrollbar';
    }

    // react-day-picker 日历（~30 KB）—— 报表 / 历史筛选才用
    if (id.includes('react-day-picker')) {
      return 'datepicker';
    }

    // spin-wheel 转盘（~20 KB + matter-js 80 KB 配套）
    if (id.includes('spin-wheel')) {
      return 'spin-wheel';
    }

    // 其他第三方库
    return "vendor";
  }
}
