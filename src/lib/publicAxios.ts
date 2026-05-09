import axios from "axios";
import { setTraceIdHeader } from "./trace";
import { rumException, rumResource, rumCustomLog } from "../utils/helper";
import { shouldExcludeFromRumLog } from "./auth-guards";

const publicAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://tg.b03test.xyz",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache"
  }
});

// 从缓存获取用户信息
export const getUserFromCache = (): Record<string, any> | undefined => {
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  } catch {
    return undefined;
  }
  return undefined;
};

publicAxiosInstance.interceptors.request.use(
  (config) => {
    config.params = {
      ...(config.params || {})
    };

    // 每次请求生成新的 trace ID
    config.headers["X-Trace-Id"] = `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;

    // 每次请求生成新的 trace ID
    setTraceIdHeader(config);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Only basic response interceptor for error handling
publicAxiosInstance.interceptors.response.use(
  (response) => {
    // TODO: rum ****************************
    // TODO: 服务于rum数据收集
    if (response.data && typeof response.data === "object") {
      response.data._request_url = (response.config.baseURL || "") + (response.config.url || "");
      response.data._request_name = response.config.url || "";
    }
    const user = getUserFromCache();
    if (user && !shouldExcludeFromRumLog(response.data._request_url)) {
      // TODO: 发送资源信息到 RUM
      rumResource({
        url: response.data._request_url,
        name: "Public Request ✅",
        event: "Public Request ✅"
      }, user);

      // TODO: 发送常规日志到 RUM
      rumCustomLog(`Public Request ✅`, { url: response.data._request_url }, user);
    }
    // TODO: rum ****************************

    return response;
  },
  (error) => {
    // Basic error handling without auth logic
    console.error("Public API Error:", error);

    // TODO: rum ****************************
    const errorUrl = (error?.config?.baseURL ?? "") + error?.config?.url;
    const user = getUserFromCache();
    if (user && !shouldExcludeFromRumLog(errorUrl)) {
      // TODO: 发送资源信息到 RUM
      rumResource({
        url: errorUrl,
        name: "Public Request ❌",
        event: "Public Request ❌"
      }, user);

      // TODO: 发送异常到 RUM
      rumException("Public Request ❌", error, user);
    }
    // TODO: rum ****************************

    return Promise.reject(error);
  }
);

export default publicAxiosInstance;
