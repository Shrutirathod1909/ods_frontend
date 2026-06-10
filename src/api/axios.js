import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// =======================================
// RESPONSE INTERCEPTOR
// =======================================

api.interceptors.response.use(

  (response) => response,

  (error) => {

    // TOKEN EXPIRED / UNAUTHORIZED
    if (error.response?.status === 401) {

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;