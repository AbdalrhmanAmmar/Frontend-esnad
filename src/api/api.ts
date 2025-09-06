import axios from "axios";
import { useAuthStore } from "../stores/authStore";


// إعداد Axios
const api = axios.create({
//   baseURL: "https://back-api.evasaudi.com/api",
  baseURL:"http://localhost:4000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});


api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// معالجة الأخطاء
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("token");
//       window.location.href = "/auth/login";
//     }
//     return Promise.reject(error);
//   }
// );

// Login API function
export const loginUser = async (username: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Verify token API function


// Add your other API functions here
export const fetchData = async () => {
  // Implementation here
};

export default api;