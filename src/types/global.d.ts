// Betby Sports SDK 全局类型声明
import type { BTRendererClass } from './betby';

declare global {
  interface Window {
    BTRenderer: BTRendererClass;
    Telegram?: {
      WebApp?: {
        initData?: string;
        initDataUnsafe?: {
          query_id?: string;
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
          };
          auth_date?: number;
          hash?: string;
          [key: string]: any;
        };
        ready?: () => void;
        expand?: () => void;
        close?: () => void;
        colorScheme?: "light" | "dark";
        themeParams?: Record<string, any>;
        viewportHeight?: number;
        viewportStableHeight?: number;
        isExpanded?: boolean;
        [key: string]: any;
      };
    };
    RumSDK?: {
      default: {
        sendResource: (config: any) => void;
        sendException: (config: any) => void;
        sendCustom: (config: any) => void;
        setConfig: (config: any) => void;
        getConfig: () => any;
      };
    };
  }
}

export {};