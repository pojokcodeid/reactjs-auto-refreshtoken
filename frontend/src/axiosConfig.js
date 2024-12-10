// src/utils/axiosConfig.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

// Refresh token logic
const refreshAuthLogic = async (failedRequest) => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    const response = await axios.post(
      "/auth/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
    const { accessToken, refreshToken: newRefreshToken } = response.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);

    failedRequest.response.config.headers["Authorization"] =
      "Bearer " + accessToken;
    return Promise.resolve();
  } catch (error) {
    // Handle refresh token expiration, e.g., redirect to login page
    localStorage.clear();
    window.location.href = "/login";
    return Promise.reject(error);
  }
};

// Add authorization header to every request
api.interceptors.request.use((request) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    request.headers["Authorization"] = `Bearer ${token}`;
  }
  return request;
});

// Interceptor untuk refresh token ketika access token expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await refreshAuthLogic(originalRequest);
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;
