import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 60000,
});

API.interceptors.request.use(
  (config) => {
    // Always attach token from localStorage if available
    const stored = localStorage.getItem("tradecatalog_user");
    if (stored) {
      try {
        const { token } = JSON.parse(stored);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default API;