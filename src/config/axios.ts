import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// If API_BASE_URL is a full URL (starts with http), don't set baseURL in axios
// because endpoints already include the full URL
// If it's a relative path, use it as baseURL for axios
const axiosBaseURL = API_BASE_URL.startsWith('http') ? undefined : API_BASE_URL;

const apiClient = axios.create({
  baseURL: axiosBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - إضافة Token
apiClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - معالجة الأخطاء
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // معالجة عدم المصادقة
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
