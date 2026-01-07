// src/api.js
import axios from "axios";

// Fonction pour rafraîchir le token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("Pas de refreshToken");

  const response = await axios.post("https://backend-hqhy.onrender.com/api/auth/refreshToken", {
    refreshToken,
  });

  const newToken = response.data.accessToken;
  localStorage.setItem("token", newToken);
  return newToken;
};

// Création d'une instance Axios
const api = axios.create({
  baseURL: "https://backend-hqhy.onrender.com",
});

// Intercepteur de requête : ajoute le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse : gère les 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ⛔ Ne jamais intercepter le refreshToken
    if (originalRequest.url.includes("/refreshToken")) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      error.response?.data?.erreur === "Token expiré" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;