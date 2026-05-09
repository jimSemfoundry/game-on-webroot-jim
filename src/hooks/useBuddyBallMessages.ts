import { useEffect, RefObject, useRef } from "react";
import { authService } from "@/services/authService.ts";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useUserBuddyBallsHome } from "@/hooks/api/useAuth.ts";

const isWindowMessageSource = (source: MessageEventSource | null): source is Window => {
  // In cross-origin scenarios `event.source` is a WindowProxy and may not expose `location`.
  // Only require `postMessage` to avoid accidentally dropping valid messages.
  return typeof window !== "undefined" && !!source && "postMessage" in source;
};

type UseBuddyBallMessagesParams = {
  onClose?: () => void;
  onError?: () => void;
  onGameReady?: () => void;
  iframeRef?: RefObject<HTMLIFrameElement | null>;
  containerRef?: RefObject<HTMLElement | null>;
  iframeSrc?: string;
};

function normalizeGameApiResponse(response: unknown, fallbackMessage?: string) {
  const base = (typeof response === "object" && response != null ? response : {}) as Record<string, unknown>;
  const code = typeof base.code === "number" ? base.code : -1;
  const msg = typeof base.msg === "string" ? base.msg : (fallbackMessage || "");
  const rawData = base.data;
  const data = (typeof rawData === "object" && rawData != null ? rawData : {}) as Record<string, unknown>;

  const ensureArray = (key: string) => {
    const value = data[key];
    if (!Array.isArray(value)) data[key] = [];
  };

  // The game code may read `.length` from some list-like fields.
  ensureArray("list");
  ensureArray("history");
  ensureArray("records");
  ensureArray("items");

  // Ball count fallbacks
  if (typeof data.balls !== "number") data.balls = 0;
  if (typeof data.count !== "number") data.count = 0;

  return { ...base, code, msg, data };
}

export function useBuddyBallMessages({ onClose, onError, onGameReady, iframeRef, containerRef, iframeSrc }: UseBuddyBallMessagesParams) {
  const isIframeLoadedRef = useRef(false);
  const pendingGameReadyRef = useRef(false);
  const isUnmountedRef = useRef(false);
  const prevUserRef = useRef<unknown>(undefined);
  const hasSentBallCountRef = useRef(false);
  const { exchangeRates, formatCurrency, getCurrencySymbol } = useCurrencyData();
  const { user } = useAuth();

  const { refetch: refetchBuddyBallsHome } = useUserBuddyBallsHome()

  useEffect(() => {
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  useEffect(() => {
    isIframeLoadedRef.current = false;
    pendingGameReadyRef.current = false;
  }, [iframeSrc]);

  useEffect(() => {
    const resolveIframeOrigin = () => {
      if (typeof window === "undefined") return "";

      const src = iframeSrc || iframeRef?.current?.src;
      if (!src) return "";

      try {
        return new URL(src, window.location.origin).origin;
      } catch {
        return "";
      }
    };

    const ensureGameReadyAfterLoad = () => {
      if (!iframeRef?.current) return;

      if (isIframeLoadedRef.current) {
        pendingGameReadyRef.current = false;
        onGameReady?.();
        return;
      }

      pendingGameReadyRef.current = true;
    };

    const handleGetBall = async (event: MessageEvent) => {
      const { source, origin, data } = event;
      if (!isWindowMessageSource(source)) return;

      try {
        const response = await authService.getBuddyBallsPlay();
        if (isUnmountedRef.current) return;

        const payload = normalizeGameApiResponse(response);

        source.postMessage?.(
          {
            source: "buddyball-web",
            type: "GetBallResponse",
            data: payload,
            requestId: typeof data === "object" && data ? (data as Record<string, unknown>).requestId : undefined
          },
          origin || resolveIframeOrigin() || window.location.origin
        );
      } catch (error) {
        if (isUnmountedRef.current) return;
        console.error("Failed to fetch BuddyBalls play data", error);
        onError?.();

        const payload = normalizeGameApiResponse(undefined, error instanceof Error ? error.message : "Failed to fetch BuddyBalls play data");

        source.postMessage?.(
          {
            source: "buddyball-web",
            type: "GetBallResponse",
            data: payload,
            requestId: typeof data === "object" && data ? (data as Record<string, unknown>).requestId : undefined
          },
          origin || resolveIframeOrigin() || window.location.origin
        );
      }
    };

    const handleGetExchangeRate = async (event: MessageEvent) => {
      const { source, origin, data } = event;
      if (!isWindowMessageSource(source)) return;

      try {
        const currency_fiat = user?.currency_fiat || "USD";
        const usdtRate = exchangeRates["USDT"];
        const fiatRate = exchangeRates[currency_fiat];

        // Graceful fallback when rates are unavailable: default to USD 1:1
        const fallbackToUsd = !usdtRate || !fiatRate;
        if (fallbackToUsd) {
          console.warn("Exchange rates not available, falling back to USD 1:1", { usdtRate, fiatRate, currency: currency_fiat });
        }

        const effectiveUsdtRate = usdtRate ? parseFloat(usdtRate) : 1;
        const effectiveFiatRate = fiatRate ? parseFloat(fiatRate) : 1;

        // 计算汇率：1 USDT = ? 用户货币 (or 1:1 in USD fallback)
        const exchangeRate = effectiveUsdtRate / effectiveFiatRate;

        // 获取货币符号 (fallback to $ for USD)
        const currencySymbol = fallbackToUsd ? "$" : getCurrencySymbol(currency_fiat);
        
        // 格式化汇率显示
        const formattedExchangeRate = formatCurrency({
          amount: 1,
          currency: currency_fiat,
          showSymbol: true,
          showCode: false
        });

        const payload = {
          code: 0,
          msg: "success",
          data: {
            fromCurrency: "USDT",
            toCurrency: currency_fiat,
            exchangeRate: exchangeRate,
            currencySymbol: currencySymbol,
            formattedExchangeRate: formattedExchangeRate.formatted,
            usdtRate: usdtRate,
            fiatRate: fiatRate,
            timestamp: Date.now()
          }
        };

        source.postMessage?.(
          {
            source: "buddyball-web",
            type: "GetExchangeRateResponse",
            data: payload,
            requestId: typeof data === "object" && data ? (data as Record<string, unknown>).requestId : undefined
          },
          origin || resolveIframeOrigin() || window.location.origin
        );
      } catch (error) {
        if (isUnmountedRef.current) return;
        console.error("Failed to fetch exchange rate data", error);

        const payload = {
          code: -1,
          msg: error instanceof Error ? error.message : "Failed to fetch exchange rate data",
          data: null
        };

        source.postMessage?.(
          {
            source: "buddyball-web",
            type: "GetExchangeRateResponse",
            data: payload,
            requestId: typeof data === "object" && data ? (data as Record<string, unknown>).requestId : undefined
          },
          origin || resolveIframeOrigin() || window.location.origin
        );
      }
    };

    const handleGetBuddyBallConfig = async (event: MessageEvent) => {
      const { source, origin, data } = event;
      if (!isWindowMessageSource(source)) return;

      try {
        const response = await authService.buddyBallConfigList();
        if (isUnmountedRef.current) return;

        source.postMessage?.(
          {
            source: "buddyball-web",
            type: "GetBuddyBallConfigResponse",
            data: response,
            requestId: typeof data === "object" && data ? (data as Record<string, unknown>).requestId : undefined
          },
          origin || resolveIframeOrigin() || window.location.origin
        );
      } catch (error) {
        if (isUnmountedRef.current) return;
        console.error("Failed to fetch BuddyBall config data", error);
        onError?.();

        const payload = normalizeGameApiResponse(undefined, error instanceof Error ? error.message : "Failed to fetch BuddyBall config data");

        source.postMessage?.(
          {
            source: "buddyball-web",
            type: "GetBuddyBallConfigResponse",
            data: payload,
            requestId: typeof data === "object" && data ? (data as Record<string, unknown>).requestId : undefined
          },
          origin || resolveIframeOrigin() || window.location.origin
        );
      }
    };

    const handleGetBallCount = async (event: MessageEvent) => {
      const { source, origin, data } = event;
      if (!isWindowMessageSource(source)) return;

      try {
        setTimeout(() => ensureGameReadyAfterLoad(), 1000);
        //console.error("Request BuddyBallsCount");
        const response = await authService.userBuddyBallsHome();
        //console.error("Get BuddyBallsCount play data", response);
        const payload = normalizeGameApiResponse(response);

        source.postMessage?.(
          {
            source: "buddyball-web",
            type: "GetBallCountResponse",
            data: payload,
            requestId: typeof data === "object" && data ? (data as Record<string, unknown>).requestId : undefined
          },
          origin || window.location.origin
        );

      } catch (error) {
        console.error("Failed to fetch BuddyBallsCount play data", error);
        onError?.();

        const payload = normalizeGameApiResponse(undefined, error instanceof Error ? error.message : "Failed to fetch BuddyBalls Count data");

        source.postMessage?.(
          {
            source: "buddyball-web",
            type: "GetBallCountResponse",
            data: payload,
            requestId: typeof data === "object" && data ? (data as Record<string, unknown>).requestId : undefined
          },
          origin || window.location.origin
        );
        ensureGameReadyAfterLoad();
      }
    };

    const handleMessage = (event: MessageEvent) => {
      const iframeWindow = iframeRef?.current?.contentWindow;
      if (iframeWindow && event.source !== iframeWindow) return;

      const rawData = event.data;
      const data = (() => {
        if (typeof rawData === "object" && rawData != null) return rawData as Record<string, unknown>;
        if (typeof rawData === "string") {
          try {
            const parsed = JSON.parse(rawData) as unknown;
            if (typeof parsed === "object" && parsed != null) return parsed as Record<string, unknown>;
          } catch {
            return null;
          }
        }
        return null;
      })();

      if (!data) return;
      if (data.source !== "buddyball-web") return;

      switch (data.type) {
        case "close":
          onClose?.();
          break;
        case "error":
          onError?.();
          break;
        case "GetBall":
          void handleGetBall(event);
          break;
        case "GetBallCount":
          void handleGetBallCount(event);
          break;
        case "GetExchangeRate":
          void handleGetExchangeRate(event);
          break;
        case "GetBuddyBallConfig":
          void handleGetBuddyBallConfig(event);
          break;
        case "BallFallDown":
          void refetchBuddyBallsHome();
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onClose, onError, onGameReady, iframeRef, iframeSrc, exchangeRates, formatCurrency, getCurrencySymbol, user]);

  useEffect(() => {
    const prevUser = prevUserRef.current;
    prevUserRef.current = user;

    if (prevUser === undefined) return;
    if (!user || prevUser) return;
    if (hasSentBallCountRef.current) return;
    if (!iframeRef?.current?.contentWindow) return;

    hasSentBallCountRef.current = true;
    const iframe = iframeRef.current;
    const resolveOrigin = () => {
      try {
        return new URL(iframe.src, window.location.origin).origin;
      } catch {
        return window.location.origin;
      }
    };

    authService.userBuddyBallsHome().then((response) => {
      const payload = normalizeGameApiResponse(response);
      iframe.contentWindow?.postMessage(
        { source: "buddyball-web", type: "GetBallCountResponse", data: payload },
        resolveOrigin()
      );
    }).catch((error) => {
      console.error("Failed to send BuddyBallsCount after login", error);
      const payload = normalizeGameApiResponse(undefined, error instanceof Error ? error.message : "Failed to fetch BuddyBalls Count data");
      iframe.contentWindow?.postMessage(
        { source: "buddyball-web", type: "GetBallCountResponse", data: payload },
        resolveOrigin()
      );
    });
  }, [user, iframeRef, iframeSrc]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!iframeRef?.current) return;

    const iframe = iframeRef.current;

    const resolveOrigin = () => {
      try {
        return new URL(iframe.src, window.location.origin).origin;
      } catch {
        return window.location.origin;
      }
    };

    const postViewportSize = () => {
      const width = containerRef?.current?.clientWidth || iframe.clientWidth || window.innerWidth;
      const height = containerRef?.current?.clientHeight || iframe.clientHeight || window.innerHeight;

      if (!width || !height) return;

      iframe.contentWindow?.postMessage(
        {
          source: "buddyball-web",
          type: "ViewportSize",
          data: { width, height }
        },
        resolveOrigin()
      );
    };

    const handleResize = () => postViewportSize();

    let resizeObserver: ResizeObserver | undefined;
    if (containerRef?.current && "ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => postViewportSize());
      resizeObserver.observe(containerRef.current);
    }

    postViewportSize();
    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [iframeRef, containerRef]);
}