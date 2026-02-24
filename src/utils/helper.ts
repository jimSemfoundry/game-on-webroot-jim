import { useCallback, useEffect, useRef } from "react";
import { debounce } from "es-toolkit";
import { v4 as uuidv4 } from "uuid";
import { readIDBValueByKey, writeIDBValueByKey } from "@/components/firebase/IndexDB";
import { useAuth } from "@/contexts/AuthContext.tsx";

let uuidIDBLoadPromise: Promise<void> | null = null;
let uuidIDBCachedValue: string | null | undefined = undefined;

const ensureUUIDIDBLoaded = () => {
  if (uuidIDBLoadPromise) return;
  uuidIDBLoadPromise = (async () => {
    try {
      const val = await readIDBValueByKey<string>("uuid");
      uuidIDBCachedValue = val ?? null;
    } catch {
      uuidIDBCachedValue = null;
    }
  })();
};

export function rum_sdk_user_log(data: Record<string, any>) {
  if (window.RumSDK?.default) {
    const ArmsRum = window.RumSDK.default;

    const config = ArmsRum.getConfig();
    ArmsRum.setConfig({
      ...config,
      user: {
        name: data?.nickname || data?.username,
        tags: data?.id
      }
    });
  }
}

/**
 * 区域禁止 结算币禁止
 * @param regions
 * @param country_code
 */
export const fn_regions = (regions: string, country_code: string) => {
  return regions != "" && regions != "ALL" && country_code && !regions.toLowerCase()?.includes(country_code?.toLowerCase());
};

/**
 * 区域禁止 结算币禁止
 * @param ban_regions
 * @param country_code
 */
export const fn_ban_regions = (ban_regions: string, country_code: string) => {
  return ban_regions != "" && country_code && ban_regions.toLowerCase()?.includes(country_code?.toLowerCase());
};

/**
 * 区域禁止 结算币禁止
 * @param support_settlement_currencies
 * @param currency
 */
export const fn_support_settlement_currencies = (support_settlement_currencies: string, currency: string) => {
  const currency_lower = currency?.toLowerCase();
  const final_currency_lower = currency_lower === "usdt" ? "usd" : currency_lower;
  return final_currency_lower && support_settlement_currencies != "" && support_settlement_currencies != "ALL" && !support_settlement_currencies.toLowerCase()?.includes(final_currency_lower);
};

/**
 * 区域禁止 结算币禁止
 * @param ban_support_settlement_currencies
 * @param currency
 */
export const fn_ban_support_settlement_currencies = (ban_support_settlement_currencies: string, currency: string) => {
  const currency_lower = currency?.toLowerCase();
  const final_currency_lower = currency_lower === "usdt" ? "usd" : currency_lower;
  return final_currency_lower && ban_support_settlement_currencies != "" && ban_support_settlement_currencies.toLowerCase()?.includes(final_currency_lower);
};

// FIXME: PWA 应用更新消息，需要用户确认是否更新
export function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (typeof BroadcastChannel === "undefined") return null;
  return new BroadcastChannel("pwa-update");
}

export const useRumSdkUserLog = () => {
  const { user } = useAuth();

  const debouncedRef = useRef<ReturnType<typeof debounce> | null>(null);

  const rumCustomLog = useCallback((name: string, payload: any) => {
    if (!debouncedRef.current) {

      debouncedRef.current = debounce((name: string, payload: any) => {
        if (window.RumSDK?.default) {
          const ArmsRum = window.RumSDK.default;

          ArmsRum.sendCustom({
            name,
            metrics: {
              page: location.pathname,
              user_id: user?.id,
            },
            tags: {
              user_name: user?.nickname,
              // 把整个 payload 当作标签（如果 payload 是简单对象）
              ...(typeof payload === 'object' ? payload : { action: payload })
            }
          });
        }
      }, 5_000);
    }

    debouncedRef.current(name, payload);
  }, [user?.id]);

  const rumException = useCallback((error: unknown, extra?: Record<string, any>) => {
    if (window.RumSDK?.default) {
      const ArmsRum = window.RumSDK.default;
      const err = error instanceof Error ? error : new Error(String(error));
      ArmsRum.sendException({
        user: {
          name: user?.id,
          tags: user?.nickname
        },
        message: err.message,
        stack: err.stack,
        page: location.pathname,
        extra
      });
    }
  }, [user?.id]);

  useEffect(() => {
    return () => {
      debouncedRef.current?.cancel();
    };
  }, []);

  return {
    rumCustomLog,
    rumException
  };
};

/**
 * TODO: 生成设备标识，即使一个浏览器登录了多个用户也认为是同一个人，放弃 fingerprint
 */
export const uuidv4Generate = () => {
  const isLocalStorageAvailable = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

  const generateUUID = () => {
    try {
      if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    } catch {
      // ignore
    }

    try {
      return uuidv4();
    } catch {
      return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
    }
  };

  const safeGetLocalUUID = () => {
    try {
      if (isLocalStorageAvailable()) return window.localStorage.getItem("uuid");
    } catch {
      // ignore
    }

    return null;
  };

  const safeSetLocalUuid = (uuid: string) => {
    try {
      if (isLocalStorageAvailable()) window.localStorage.setItem("uuid", uuid);
    } catch {
      // ignore
    }
  };

  const local_uuid_value = safeGetLocalUUID();

  if (local_uuid_value) return local_uuid_value;

  if (uuidIDBCachedValue === undefined) ensureUUIDIDBLoaded();
  if (uuidIDBCachedValue) return uuidIDBCachedValue;

  const uuid = generateUUID();

  uuidIDBCachedValue = uuid;

  safeSetLocalUuid(uuid);

  void writeIDBValueByKey("uuid", uuid);

  return uuid;
};

/**
 * 检查 value 是否为空。
 * 支持 null, undefined, boolean, number, string, array, object, Map, Set。
 * @param {*} value 要检查的值。
 * @returns {boolean} 如果 value 为空，返回 true，否则返回 false。
 */
export function isEmpty(value: any) {
  // 1. 处理 null 和 undefined
  if (value == null) { // 使用 == 可以同时检查 null 和 undefined
    return true;
  }

  // 2. 处理具有 length 属性的类数组对象和字符串
  // 包括：arguments, array, string。注意：function 没有 length
  if (typeof value === "object" || typeof value === "string") {
    if (Array.isArray(value) || typeof value === "string" ||
      (typeof value === "object" && value.hasOwnProperty("length"))) {
      return value.length === 0;
    }
  }

  // 3. 处理 Map 和 Set (现代JS类型)
  // 检查是否存在 size 属性，这是 Map 和 Set 的特征
  if (typeof Map !== "undefined" && value instanceof Map ||
    typeof Set !== "undefined" && value instanceof Set) {
    return value.size === 0;
  }

  // 4. 处理普通对象 (POJO)
  // 对象通过检查其可枚举的自身属性数量来判断
  if (typeof value === "object") {
    // Object.keys() 返回一个包含所有给定对象自身可枚举字符串键属性的数组
    // 如果数组长度为 0，则视为空对象
    return Object.keys(value).length === 0;
  }

  // 5. 处理布尔值和数字（Lodash 认为它们总是“空”的，因为它们不是集合或对象）
  // 这是一个与原生JS直觉不同的地方，但符合 Lodash 的设计
  if (typeof value === "boolean" || typeof value === "number" || typeof value === "symbol") {
    return true;
  }

  // 默认情况下返回 false（例如对于 Function 等其他类型）
  return false;
}

/*
 * 设置图片的压缩参数
 *
 * w: 图宽
 * q: 质量
 * dpr: 分辨率
 *
 * @param url
 */
export function getImgCompressParams(url: string, w: string | number = 140, q = 0) {
  const network = getNetworkType();
  let params = "";
  switch (network) {
    case "2g":
    case "slow-2g":
      params = "w=100&auto=compress&fm=webp&q=1";
      break;
    case "3g":
      params = `w=${w}&auto=compress&fm=webp&q=${q || 15}`;
      break;
    case "4g":
      params = `w=${w}&auto=compress&fm=webp&q=${q || 75}`;
      break;
    default:
      params = `w=${w}&auto=compress&fm=webp&q=${q || 85}`;
      break;
  }

  const _url = url?.replace(/(1stgame\.imgix\.net|image\.1st\.game)/g, 'cdn-a.imgix.net');
  return hasAnySearchParams(_url) ? `${_url}&${params}` : `${_url}?${params}`;
}

export function getNetworkType(): "4g" | "3g" | "slow-2g" | "2g" {
  if ("connection" in navigator) return (navigator as any)?.connection?.effectiveType ?? "4g";
  return "4g";
}

function hasAnySearchParams(url: string) {
  try {
    const parse_url = new URL(url);
    return parse_url.search.length > 0;
  } catch (_e) {
    return false;
  }
}

/*
 * 旧浏览器不支持 requestIdleCallback 时的 fallback
 * setTimeout(cb, 0) 将任务放入事件队列，尽快执行但不阻塞当前渲染
 * 实际效果
 * 现代浏览器：在主线程空闲时执行（通常是渲染完成后）
 * 旧浏览器：放入下一个事件循环，不阻塞当前渲染
 * 超时保护：确保任务不会无限期延迟
 * @param cb
 */
export const scheduleIdle = (cb: () => void) => {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (typeof w.requestIdleCallback === "function") {
    w.requestIdleCallback(cb, { timeout: 1500 });
    return;
  }
  window.setTimeout(cb, 0);
};

export const getPathInROIBEST = () => {
  const model = import.meta.env.VITE_PROMOTION_MODEL
  const appid = import.meta.env.VITE_FOLDER
  return appid && model === 'roibest' ? `/${appid}` : ''
}