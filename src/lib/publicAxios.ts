import axios from "axios";

const publicAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://tg.b03test.xyz",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  params: {
    _t: Date.now(),
  },
});

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
