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
  },
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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Track errors per URL to avoid global state issues
const errorTracking = new Map<string, { count: number; lastTime: number }>();

function getErrorCount(url: string): number {
  const tracking = errorTracking.get(url);
  if (!tracking) return 0;

  // Reset if it's been more than 30 seconds
  if (Date.now() - tracking.lastTime > 30000) {
    errorTracking.delete(url);
    return 0;
  }

  return tracking.count;
}

function incrementErrorCount(url: string): number {
  const current = getErrorCount(url);
  const newCount = current + 1;
  errorTracking.set(url, { count: newCount, lastTime: Date.now() });
  return newCount;
}

function resetErrorCount(url?: string) {
  if (url) {
    errorTracking.delete(url);
  } else {
    errorTracking.clear();
  }
}

authAxiosInstance.interceptors.response.use(
  (response) => {
    // Reset error count for successful requests
    if (response.config.url) {
      resetErrorCount(response.config.url);
    }

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

    // Handle Network Errors (no response, CORS, connection refused, etc.)
    if (!error.response && error.message === "Network Error" && originalRequest?.url) {
      const errorCount = incrementErrorCount(originalRequest.url);

      if (process.env.NODE_ENV === "development") {
        console.warn(`🌐 Network error detected, count: ${errorCount} for ${originalRequest.url}`);
      }

      // If we've had 3+ consecutive network errors for this URL, assume auth is invalid
      if (errorCount >= 3) {
        clearAuth(`network_errors:${originalRequest.url}:${errorCount}`);

        // Reset error count after clearing
        resetErrorCount(originalRequest.url);

        return Promise.reject(error);
      }
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
