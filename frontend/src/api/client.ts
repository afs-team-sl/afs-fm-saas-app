import axios from 'axios';

/**
 * Create an Axios instance with base configuration
 */
const apiClient = axios.create({
  // import.meta.env.VITE_API_URL එකෙන් .env ෆයිල් එකේ ඇති URL එක ගන්නවා. 
  // නැත්නම් default විදියට http://localhost:3000 පාවිච්චි කරනවා.
  baseURL: import.meta.env.VITE_API_URL ,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor:
 * This runs before every request is sent to the backend.
 * It automatically attaches the JWT Token and Tenant ID if they exist.
 */
apiClient.interceptors.request.use(
  (config) => {
    // LocalStorage එකෙන් දත්ත ලබා ගැනීම
    const token = localStorage.getItem('access_token');
    const tenantId = localStorage.getItem('tenant_id');

    // 1. JWT Token එක තිබේ නම් Authorization Header එකට එකතු කිරීම
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Tenant ID එක තිබේ නම් x-tenant-id Header එකට එකතු කිරීම (SaaS Isolation සඳහා)
    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * This handles common errors globally (like 401 Unauthorized).
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // ටෝකන් එකේ කාලය ඉවර වුණොත් (Expired) ඔටෝම Logout වෙන්න සැලැස්වීම
    if (error.response && error.response.status === 401) {
      console.error('Session expired or unauthorized. Logging out...');
      // localStorage.clear(); // අවශ්‍ය නම් මෙය පාවිච්චි කළ හැක
    }
    return Promise.reject(error);
  }
);

export default apiClient;
