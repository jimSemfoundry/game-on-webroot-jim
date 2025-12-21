// Betby Sports SDK 全局类型声明
import type { BTRendererClass } from './betby';

declare global {
  interface Window {
    BTRenderer: BTRendererClass;
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