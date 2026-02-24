import axios from "axios";
import { setTraceIdHeader } from "./trace";

const publicAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://tg.b03test.xyz",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
  }
});

publicAxiosInstance.interceptors.request.use(
  (config) => {
    config.params = {
      ...(config.params || {})
    }
    
    // 每次请求生成新的 trace ID
    config.headers['X-Trace-Id'] = `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;

    // 每次请求生成新的 trace ID
    setTraceIdHeader(config);

    return config
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Only basic response interceptor for error handling
publicAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Basic error handling without auth logic
    console.error("Public API Error:", error);
    return Promise.reject(error);
  },
);

export default publicAxiosInstance;
