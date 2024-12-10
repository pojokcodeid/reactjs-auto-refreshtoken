// src/axiosConfig.js
import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";

// Create Axios instance
const api = axios.create({
  baseURL: "http://localhost:3000",
});

// Refresh token logic
const refreshAuthLogic = async (failedRequest) => {
  try {
    const tokenRefreshResponse = await api.post(
      "/auth/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
        },
      }
    );
    const { accessToken, refreshToken } = tokenRefreshResponse.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    failedRequest.response.config.headers["Authorization"] =
      "Bearer " + accessToken;
    return await Promise.resolve();
  } catch (error) {
    // Handle refresh token expiration, e.g., redirect to login page
    localStorage.clear();
    window.location.href = "/login";
    return await Promise.reject(error);
  }
};

// Instantiate the interceptor
createAuthRefreshInterceptor(api, refreshAuthLogic);

// Add authorization header to every request
api.interceptors.request.use((request) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    request.headers["Authorization"] = `Bearer ${token}`;
  }
  return request;
});

export default api;
