import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: rawBaseUrl.trim().replace(/\/+$/, ""),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization header if JWT token is stored, enabling seamless
// cross-site auth even in browsers that block third-party cookies.
api.interceptors.request.use((config) => {
  try {
    const storedAuth = localStorage.getItem("lenslm_auth");
    if (storedAuth) {
      const parsed = JSON.parse(storedAuth);
      const token = parsed.token || parsed.user?.token;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // Ignore storage parsing issues
  }
  return config;
});

// Handle API responses and errors centrally.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong. Please try again.";

    error.message = message;

    return Promise.reject(error);
  },
);

export default api;
