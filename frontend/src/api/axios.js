import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Attach token on every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("talent_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401s globally — clear stale tokens
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("talent_token");
      localStorage.removeItem("talent_user");
      // Let the component handle the redirect
    }
    return Promise.reject(err);
  }
);

export default api;
