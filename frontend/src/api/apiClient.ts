import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling 401 Unauthorized (Review Finding [HIGH])
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Request new access token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        if (response.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;

          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, logout user
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Catalog methods
export const getCategories = () => apiClient.get('/services/categories');
export const createCategory = (data: { name: string; description?: string }) =>
  apiClient.post('/services/categories', data);
export const updateCategory = (
  id: number,
  data: { name: string; description?: string; is_active: boolean },
) => apiClient.put(`/services/categories/${id}`, data);

export const getServices = (categoryId?: number) =>
  apiClient.get('/services', { params: { categoryId } });
export const createService = (data: any) => apiClient.post('/services', data);
export const updateService = (id: number, data: any) => apiClient.put(`/services/${id}`, data);

// Appointment methods
export const getAvailability = (date: string) =>
  apiClient.get('/appointments/availability', { params: { date } });
export const createAppointment = (bookingData: {
  serviceId: number;
  date: string;
  time: string;
  notes?: string;
}) => apiClient.post('/appointments', bookingData);
export const getAppointments = () => apiClient.get('/appointments');
export const completeAppointment = (id: number, data: { paymentMethod: 'cash' | 'gcash' }) =>
  apiClient.post(`/appointments/${id}/complete`, data);
export const getCommissionSummary = () => apiClient.get('/appointments/commission-summary');
export const getStaffCommissions = () => apiClient.get('/appointments/staff-commissions');

// Customer CRM methods
export const searchCustomers = (query: string) =>
  apiClient.get('/customers/search', { params: { query } });
export const getCustomerHistory = (id: number) => apiClient.get(`/customers/${id}/history`);
export const updateCustomerProfile = (data: any) => apiClient.put('/customers/profile', data);

// Attendance methods
export const getAttendanceStatus = () => apiClient.get('/attendance/status');
export const checkIn = () => apiClient.post('/attendance/check-in');
export const checkOut = () => apiClient.post('/attendance/check-out');

// Report methods
export const getReports = (params: { startDate?: string; endDate?: string }) =>
  apiClient.get('/reports/payroll', { params });
export const getDailySales = (date?: string) =>
  apiClient.get('/reports/daily-sales', { params: { date } });

// Notification methods
export const getNotifications = () => apiClient.get('/notifications');
export const markNotificationRead = (id: number) => apiClient.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => apiClient.put('/notifications/read-all');

export default apiClient;
