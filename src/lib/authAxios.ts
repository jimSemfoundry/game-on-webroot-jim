import { clearAuth, getAuth } from "@/utils/auth";
import axios from "axios";
import { setTraceIdHeader } from "./trace";

// Authenticated axios instance - includes custom auth headers
// Uses getAuth() to generate authentication parameters for each request
// For public APIs that don't require authentication, use publicAxios instead
const authAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://tg.b03test.xyz",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
  }
});

authAxiosInstance.interceptors.request.use(
  (config) => {
    try {
      const auth = getAuth();
      if (auth) {
        config.headers.auth = JSON.stringify(auth);
      }
      if (config.data instanceof FormData) {
        config.headers["Content-Type"] = "multipart/form-data";
      }
    } catch (error) {
      // getAuth可能会抛出错误如果用户未认证
      console.warn("Failed to get auth credentials:", error);
    }

    config.params = {
      ...(config.params || {})
    }
    
    // 每次请求生成新的 trace ID
    config.headers['X-Trace-Id'] = `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;

    // 每次请求生成新的 trace ID
    setTraceIdHeader(config);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

authAxiosInstance.interceptors.response.use(
  (response) => {
    // Log only in development
    if (process.env.NODE_ENV === "development") {
      console.debug("✅ Auth request successful:", response.config.url);
    }

    if (response?.data?.code === 401) {
      // If we can't get auth, it means token is invalid, clear it
      clearAuth(`❌ Auth request failed:${response.config.url}`);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log errors only in development
    if (process.env.NODE_ENV === "development") {
      console.error(`❌ Auth request failed: ${error.response?.status || "Network Error"} ${originalRequest?.url}`, error);
    }

    // Handle 401 unauthorized errors
    if (error.response?.status === 401) {
      clearAuth(`http_401:${originalRequest?.url}`);
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default authAxiosInstance;
