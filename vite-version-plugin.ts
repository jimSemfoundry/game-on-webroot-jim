import type { Plugin } from "vite";
import { getThemeByName } from "./src/themes/presets";

type Version = {
  version: number | string;
  facebookPixelId: string;
  nameBlock: string;
  websiteUrl: string;
  nickname: string;
  theme: string;
  alibabaRumId?: string;
  themeConfig?: string;
  logoBaseUrl?: string;
  faviconBaseUrl?: string;
  baseUrl?: string;
  logoLoaderUrl?: string;
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
  pwaStatusBarStyle?: string;
};

export default ({
  version,
  nameBlock,
  nickname,
  websiteUrl,
  theme,
  alibabaRumId,
  themeConfig,
  logoBaseUrl,
  faviconBaseUrl,
  baseUrl,
  logoLoaderUrl: _logoLoaderUrl,
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
  pwaStatusBarStyle,
}: Version): Plugin => {
  return {
    name: "version-plugin", // 必须的，将会在 warning 和 error 中显示
    transformIndexHtml(html: string) {
      let base200 = "#2E3540";
      let base300 = "#1E242E";
      const fallbackTheme = getThemeByName("default");
      const parseThemeConfig = () => {
        if (!themeConfig) return null;
        try {
          let cleanConfig = themeConfig.trim();
          // 容错：去除可能包裹的单/双引号
          if (cleanConfig.length > 2) {
             const first = cleanConfig.charAt(0);
             const last = cleanConfig.charAt(cleanConfig.length - 1);
             if ((first === "'" && last === "'") || (first === '"' && last === '"')) {
                cleanConfig = cleanConfig.substring(1, cleanConfig.length - 1);
             }
          }
          return JSON.parse(cleanConfig);
        } catch (error) {
          console.warn("Failed to parse VITE_THEME_CONFIG for loader variables.", error);
          return null;
        }
      };

      const runtimeConfig = parseThemeConfig();
      const themeName = typeof runtimeConfig?.currentTheme === "string" ? runtimeConfig.currentTheme : (theme || "default");
      const presetTheme = getThemeByName(themeName);
      
      // 优先级: customOverrides.colors > colors > presetTheme > fallbackTheme
      const configColors = (runtimeConfig?.customOverrides?.colors || runtimeConfig?.colors || {}) as Record<string, string>;
      const presetColors = (presetTheme?.colors || fallbackTheme?.colors || {}) as Record<string, string>;
      
      base200 = configColors.base200 || presetColors.base200 || base200;
      base300 = configColors.base300 || presetColors.base300 || base300;

      const loaderThemeScript = `<script id="loader-theme-vars">
        (function(){
          var root = document.documentElement;
          root.style.setProperty("--color-base-200", "${base200}");
          root.style.setProperty("--color-base-300", "${base300}");
          root.style.background = "var(--color-base-300)";
          if (document.body) {
            document.body.style.background = "var(--color-base-300)";
          }
          var attempts = 0;
          var applyLoaderBg = function(){
            var loader = document.getElementById("initial-loader");
            if (loader) {
              loader.style.background = "radial-gradient(circle at center, var(--color-base-200) 0%, var(--color-base-300) 80%)";
              return true;
            }
            return false;
          };
          if (!applyLoaderBg()) {
            var timer = setInterval(function(){
              attempts += 1;
              if (applyLoaderBg() || attempts > 40) {
                clearInterval(timer);
              }
            }, 25);
          }
        })();
      </script>`;

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

      processedHtml = processedHtml.replace("</head>", `${loaderThemeScript}</head>`);

      const appConfigScript = `<script>window.__APP_CONFIG__ = { version: ${version} };</script>`;

      const rumScript = (() => {
        const fallbackPid = "1i6y71lx74v@06e3adcf022df54";
        const pid = alibabaRumId && alibabaRumId.trim().length > 0 ? alibabaRumId.trim() : fallbackPid;

        return `<script>
    !(function(c,b,d,a){c[a]||(c[a]={});c[a]=
    {
        pid: '${pid}',
        endpoint: 'https://1i6y71lx74v-default-us.rum.aliyuncs.com',
        // Set environment information, reference values: 'prod' | 'gray' | 'pre' | 'daily' | 'local'
        env: "${version}" + '-' + window.location.hostname, 
        // Set spa mode, reference values: 'history' | 'hash'
        spaMode: 'history',
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
        action: true,
        },
        // Link tracing configuration switch - Default disabled
        tracing: false,
    };
    var s=b.createElement("script");s.crossOrigin="";s.src=d;s.defer=true;s.async=true;b.body.appendChild(s)
})(window, document, "https://sdk.rum.aliyuncs.com/v2/browser-sdk.js", "__rum");
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

    // 其他第三方库
    return "vendor";
  }
}
