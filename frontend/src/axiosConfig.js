// src/utils/axiosConfig.js
import axios from "axios";
import secureStorage from "react-secure-storage";

const burl = "http://localhost:3000";
const api = axios.create({
  baseURL: burl,
});

// Refresh token logic
const refreshAuthLogic = async (failedRequest) => {
  try {
    const refreshToken = secureStorage.getItem("refreshToken");
    const response = await axios.post(
      burl + "/auth/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
    const { accessToken, refreshToken: newRefreshToken } = response.data;

    secureStorage.setItem("accessToken", accessToken);
    secureStorage.setItem("refreshToken", newRefreshToken);
    console.log("Masuk Refresh token");
    failedRequest.headers["Authorization"] = "Bearer " + accessToken;
    return Promise.resolve();
  } catch (error) {
    // Handle refresh token expiration, e.g., redirect to login page
    secureStorage.clear();
    window.location.href = "/";
    return Promise.reject(error);
  }
};

// Add authorization header to every request
api.interceptors.request.use((request) => {
  const token = secureStorage.getItem("accessToken");
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
