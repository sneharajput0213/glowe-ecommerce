import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    // Let Axios/browser set the correct Content-Type
    // for FormData requests, including multipart boundary.
    if (config.data instanceof FormData) {
      config.headers.setContentType(undefined);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    const isAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/register-seller");

    if (
      status === 401 &&
      !isAuthRequest &&
      localStorage.getItem("token")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");

      window.location.replace("/");
    }

    return Promise.reject(error);
  }
);

export default api;
