import { clearAuth, getAuth } from "@/utils/auth";
import axios from "axios";
 
// Authenticated axios instance - includes custom auth headers
// Uses getAuth() to generate authentication parameters for each request
// For public APIs that don't require authentication, use publicAxios instead
const authAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://tg.b03test.xyz",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
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
      ...(config.params || {}),
      _t: Date.now(),
    }

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
      // Initialize retry count for this specific request
      originalRequest._retryCount = originalRequest._retryCount || 0;
      originalRequest._retryCount++;

      console.warn(`⚠️ 401 error detected, retry count: ${originalRequest._retryCount} for ${originalRequest.url}`);

      // If this specific request has failed 3 times, clear auth
      if (originalRequest._retryCount >= 3) {
        clearAuth(`multiple_401_errors:${originalRequest.url}:${originalRequest._retryCount}`);

        // Don't retry anymore
        return Promise.reject(error);
      }

      // Try to regenerate auth params and retry
      try {
        console.log("Attempting to regenerate auth for retry...");
        const auth = getAuth();
        if (auth) {
          console.log("Auth regenerated successfully, retrying request");
          originalRequest.headers.auth = JSON.stringify(auth);
          // Retry the request
          return authAxiosInstance(originalRequest);
        } else {
          console.warn("getAuth() returned null/undefined");
        }
      } catch (authError) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to regenerate auth for retry:", authError);
        }

        // If we can't get auth, it means token is invalid, clear it
        clearAuth(`auth_generation_failed:${originalRequest.url}`);
      }
    }

    return Promise.reject(error);
  },
);

export default authAxiosInstance;
