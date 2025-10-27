/**
 * PWA 自动更新工具
 * 确保用户始终获取最新版本
 */

let updateCheckInterval: NodeJS.Timeout | null = null;
let isRefreshing = false;

if (typeof window !== "undefined") {
  (window as any).__WB_DISABLE_DEV_LOGS = true;
}

export function initPWAUpdate() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
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
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;

        refreshing = true;
        isRefreshing = true;

        window.location.reload();
      });

      // 页面可见性变更时检查更新（添加防抖）
      let visibilityTimeout: NodeJS.Timeout | null = null;
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden && !isRefreshing) {
          if (visibilityTimeout) {
            clearTimeout(visibilityTimeout);
          }

          visibilityTimeout = setTimeout(() => {
            navigator.serviceWorker.ready.then((reg) => {
              reg.update();
            });
          }, 3000);
        }
      });
    });
  }
}

export function cleanupPWAUpdate() {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
    updateCheckInterval = null;
  }
}

// 强制检查更新
export async function checkForUpdates(): Promise<boolean> {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        return true;
      }
    } catch (error) {
      console.error("PWA: Error checking for updates:", error);
    }
  }
  return false;
}

// 清除所有缓存（调试用）
export async function clearAllCaches(): Promise<boolean> {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    console.log("PWA: All caches cleared");
    return true;
  } catch (error) {
    console.error("PWA: Error clearing caches:", error);
    return false;
  }
}
