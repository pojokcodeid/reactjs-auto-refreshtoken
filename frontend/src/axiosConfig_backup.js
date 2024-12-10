// src/axiosConfig.js
import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import secureStorage from "react-secure-storage";

const burl = "http://localhost:3000";

// Create Axios instance
const api = axios.create({
  baseURL: burl,
});

// Refresh token logic
const refreshAuthLogic = async (failedRequest) => {
  try {
    let headersList = {
      Authorization: "Bearer " + secureStorage.getItem("refreshToken"),
      "Content-Type": "application/json",
    };

    let reqOptions = {
      url: `${burl}/auth/refresh`,
      method: "POST",
      headers: headersList,
    };
    const tokenRefreshResponse = await axios.request(reqOptions);
    const { accessToken, refreshToken } = tokenRefreshResponse.data;
    console.log("Masuk Refresh token");
    secureStorage.setItem("accessToken", accessToken);
    secureStorage.setItem("refreshToken", refreshToken);

    failedRequest.response.config.headers["Authorization"] =
      "Bearer " + accessToken;
    return await Promise.resolve();
  } catch (error) {
    // Handle refresh token expiration, e.g., redirect to login page
    secureStorage.clear();
    window.location.href = "/";
    return await Promise.reject(error);
  }
};

// Instantiate the interceptor
createAuthRefreshInterceptor(api, refreshAuthLogic);

// Add authorization header to every request
api.interceptors.request.use((request) => {
  const token = secureStorage.getItem("accessToken");
  if (token) {
    request.headers["Authorization"] = `Bearer ${token}`;
  }
  return request;
});

export default api;
