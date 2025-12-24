import { useCallback, useEffect, useRef } from "react";
import { debounce } from "lodash-es";

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
  return regions != "" && regions != "ALL" && !regions.toLowerCase()?.includes(country_code?.toLowerCase());
};

/**
 * 区域禁止 结算币禁止
 * @param ban_regions
 * @param country_code
 */
export const fn_ban_regions = (ban_regions: string, country_code: string) => {
  return ban_regions != "" && ban_regions.toLowerCase()?.includes(country_code?.toLowerCase());
};

/**
 * 区域禁止 结算币禁止
 * @param support_settlement_currencies
 * @param currency
 */
export const fn_support_settlement_currencies = (support_settlement_currencies: string, currency: string) => {
  const currency_lower = currency?.toLowerCase();
  const final_currency_lower = currency_lower === "usdt" ? "usd" : currency_lower;
  return support_settlement_currencies != "" && support_settlement_currencies != "ALL" && !support_settlement_currencies.toLowerCase()?.includes(final_currency_lower);
};

/**
 * 区域禁止 结算币禁止
 * @param ban_support_settlement_currencies
 * @param currency
 */
export const fn_ban_support_settlement_currencies = (ban_support_settlement_currencies: string, currency: string) => {
  const currency_lower = currency?.toLowerCase();
  const final_currency_lower = currency_lower === "usdt" ? "usd" : currency_lower;
  return ban_support_settlement_currencies != "" && ban_support_settlement_currencies.toLowerCase()?.includes(final_currency_lower);
};

// FIXME: PWA 应用更新消息，需要用户确认是否更新
export function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (typeof BroadcastChannel === "undefined") return null;
  return new BroadcastChannel("pwa-update");
}

export const useRumSdkUserLog = () => {
  const debouncedRef = useRef<ReturnType<typeof debounce> | null>(null);

  const rumCustomLog = useCallback((name: string, payload: any) => {
    if (!debouncedRef.current) {

      debouncedRef.current = debounce((name: string, payload: any) => {
        if (window.RumSDK?.default) {
          const ArmsRum = window.RumSDK.default;

          ArmsRum.sendCustom({
            name,
            data: payload,
            page: location.pathname
          });
        }
      }, 5_000);
    }

    debouncedRef.current(name, payload);
  }, []);

  const rumException = useCallback((error: unknown, extra?: Record<string, any>) => {
    if (window.RumSDK?.default) {
      const ArmsRum = window.RumSDK.default;
      const err = error instanceof Error ? error : new Error(String(error));
      ArmsRum.sendException({
        message: err.message,
        stack: err.stack,
        page: location.pathname,
        extra
      });
    }
  }, []);

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