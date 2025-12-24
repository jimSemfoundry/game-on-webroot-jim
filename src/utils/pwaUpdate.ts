/**
 * PWA 自动更新工具
 * 确保用户始终获取最新版本
 */
import { getBroadcastChannel } from "@/utils/helper.ts";

let updateCheckInterval: NodeJS.Timeout | null = null;
let isRefreshing = false;
let isInitialized = false;
let visibilityTimeout: NodeJS.Timeout | null = null;

let onWindowLoad: (() => void) | null = null;
let onControllerChange: ((this: ServiceWorkerContainer, ev: Event) => any) | null = null;
let onVisibilityChange: ((this: Document, ev: Event) => any) | null = null;

if (typeof window !== "undefined") {
  (window as any).__WB_DISABLE_DEV_LOGS = true;
}

export function initPWAUpdate() {
  if (isInitialized) return;
  isInitialized = true;
  if ("serviceWorker" in navigator) {
    onWindowLoad = () => {
      navigator.serviceWorker.ready.then((registration) => {
        // 延迟首次检查更新，避免页面加载时立即触发
        setTimeout(() => {
          registration.update();
        }, 5000);

        // 降低更新检查频率到每10分钟
        updateCheckInterval = setInterval(
          () => {
            if (!document.hidden && !isRefreshing) {
              registration.update();
            }
          },
          10 * 60 * 1000,
        );

        // 监听新的 Service Worker 安装
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("✨ PWA: 新版本可用");
              }
            });
          }
        });
      });

      // 监听 Service Worker 控制权变更
      let refreshing = false;
      onControllerChange = () => {
        if (refreshing || isRefreshing) return;

        // FIXME: 利用 sessionStorage【同标签页内保持】 防止刷新瞬间再次触发
        const pwa_reload_lock = "pwa_reload_lock";
        const lastReload = sessionStorage.getItem(pwa_reload_lock);
        const date_now = Date.now();

        // FIXME: PWA: 拦截到短时间内的重复刷新
        if (lastReload && date_now - parseInt(lastReload) < 10_000) return;

        // 同一次会话（同一 tab）里，只允许提醒一次
        const pwa_prompt_lock = "pwa_update_prompt_lock";
        const lastPrompt = sessionStorage.getItem(pwa_prompt_lock);
        if (lastPrompt) return;

        refreshing = true;
        isRefreshing = true;
        sessionStorage.setItem(pwa_reload_lock, date_now.toString());
        sessionStorage.setItem(pwa_prompt_lock, date_now.toString());

        // FIXME:
        //  PWA 应用更新消息，需要用户确认是否更新
        //  延迟一小段时间刷新，确保浏览器缓存层处理完毕
        setTimeout(() => {
          const channel = getBroadcastChannel();
          if (channel) channel.postMessage("pwa-update");
        }, 100);
      };
      navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

      // 页面可见性变更时检查更新（添加防抖）
      onVisibilityChange = () => {
        if (!document.hidden && !isRefreshing) {
          if (visibilityTimeout) {
            clearTimeout(visibilityTimeout);
          }

          visibilityTimeout = setTimeout(() => {
            navigator.serviceWorker.ready.then((reg) => {
              if (navigator.onLine) {
                void reg.update();
              }
            });
          }, 3000);
        }
      };
      document.addEventListener("visibilitychange", onVisibilityChange);
    };

    // 如果 init 在 load 之后调用，直接执行一次即可，避免依赖 load 事件
    if (document.readyState === "complete") {
      onWindowLoad();
    } else {
      window.addEventListener("load", onWindowLoad);
    }
  }
}

export function cleanupPWAUpdate() {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
    updateCheckInterval = null;
  }

  if (visibilityTimeout) {
    clearTimeout(visibilityTimeout);
    visibilityTimeout = null;
  }

  if (onWindowLoad) {
    window.removeEventListener("load", onWindowLoad);
    onWindowLoad = null;
  }

  if (onControllerChange) {
    navigator.serviceWorker?.removeEventListener("controllerchange", onControllerChange);
    onControllerChange = null;
  }

  if (onVisibilityChange) {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    onVisibilityChange = null;
  }

  isInitialized = false;
}

// 强制检查更新
// export async function checkForUpdates(): Promise<boolean> {
//   if ("serviceWorker" in navigator) {
//     try {
//       const registration = await navigator.serviceWorker.getRegistration();
//       if (registration) {
//         await registration.update();
//         return true;
//       }
//     } catch (error) {
//       console.error("PWA: Error checking for updates:", error);
//     }
//   }
//   return false;
// }

// 清除所有缓存（调试用）
// export async function clearAllCaches(): Promise<boolean> {
//   try {
//     const cacheNames = await caches.keys();
//     await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
//     console.log("PWA: All caches cleared");
//     return true;
//   } catch (error) {
//     console.error("PWA: Error clearing caches:", error);
//     return false;
//   }
// }