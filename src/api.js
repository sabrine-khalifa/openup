// src/api.js
import axios from "axios";

// Axios public (sans token)
const publicApi = axios.create({
  baseURL: "https://backend-hqhy.onrender.com",
});

// Axios privé (avec token)
const api = axios.create({
  baseURL: "https://backend-hqhy.onrender.com",
});

// =======================
// REFRESH TOKEN
// =======================
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token");

  const response = await publicApi.post("/api/auth/refreshToken", {
    refreshToken,
  });

  const newToken = response.data.accessToken;
  localStorage.setItem("token", newToken);
  return newToken;
};

// =======================
// REQUEST INTERCEPTOR
// =======================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =======================
// RESPONSE INTERCEPTOR
// =======================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ❌ NE PAS refresh sur login / register
    if (
      originalRequest?.url?.includes("/api/auth/login") ||
      originalRequest?.url?.includes("/api/auth/register")
    ) {
      return Promise.reject(error);
    }

    // 🔁 Refresh si 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export { api, publicApi };
