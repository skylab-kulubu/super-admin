import axios from "axios";
import { parseCookies } from "nookies";

const api = axios.create({
  baseURL: "https://api.yildizskylab.com/api",
});

api.interceptors.request.use(
  (config) => {
    const cookies = parseCookies();
    const token = cookies.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
