import axios from 'axios';
import type {
  CreateStaffRequest,
  UpdateAttendanceRequest,
  SubmitReviewRequest,
  CreateAppointmentRequest,
  CreateServiceRequest,
  UpdateServiceRequest,
  ScheduleItem,
  UpdateCustomerProfileRequest,
  SiteSettingsData,
  SiteContent,
  SaveSettingsRequest,
  ServicePackage,
  CreatePackagePayload,
  UpdatePackagePayload,
  StaffPerformanceStat,
  RetentionData,
  KpiSummaryData,
} from '@/types/api';

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

// Response interceptor for handling 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        if (response.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
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

// File upload method (multipart/form-data)
export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('../upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteFile = (url: string) => apiClient.delete('../upload', { data: { url } });

// Catalog methods
export const getCategories = () => apiClient.get('/services/categories');
export const createCategory = (data: { name: string; description?: string }) =>
  apiClient.post('/services/categories', data);
export const updateCategory = (
  id: number,
  data: { name: string; description?: string; is_active: boolean },
) => apiClient.put(`/services/categories/${id}`, data);
export const deleteCategory = (id: number) => apiClient.delete(`/services/categories/${id}`);

export const getServices = (categoryId?: number) =>
  apiClient.get('/services', { params: { categoryId } });
export const createService = (data: CreateServiceRequest) => apiClient.post('/services', data);
export const updateService = (id: number, data: UpdateServiceRequest) => apiClient.put(`/services/${id}`, data);

// Staff methods
export const getAllStaff = () => apiClient.get('/staff');
export const createStaff = (data: CreateStaffRequest) => apiClient.post('/staff', data);
export const updateStaff = (id: number, data: Partial<CreateStaffRequest>) => apiClient.put(`/staff/${id}`, data);
export const getStaffSchedule = (id: number) => apiClient.get(`/staff/${id}/schedule`);
export const updateStaffSchedule = (id: number, data: { schedules: ScheduleItem[] }) => apiClient.put(`/staff/${id}/schedule`, data);

// Appointment methods
export const getAvailability = (date: string) =>
  apiClient.get('/appointments/availability', { params: { date } });
export const createAppointment = (bookingData: CreateAppointmentRequest) => apiClient.post('/appointments', bookingData);
export const getAppointments = (params?: { cursor?: string; limit?: number }) =>
  apiClient.get('/appointments', { params });
export const completeAppointment = (id: number, data: { paymentMethod: 'cash' | 'gcash' }) =>
  apiClient.post(`/appointments/${id}/complete`, data);
export const getCommissionSummary = () => apiClient.get('/appointments/commission-summary');
export const getStaffCommissions = () => apiClient.get('/appointments/staff-commissions');

// Payroll methods
export const getMyPayroll = () => apiClient.get('/payroll/my-payroll');
export const getPayrollPeriods = () => apiClient.get('/payroll/periods');
export const getPayrollDetails = (id: number) => apiClient.get(`/payroll/periods/${id}`);
export const generatePayroll = (data: { startDate: string; endDate: string; totalSalonSales: number }) => 
  apiClient.post('/payroll/generate', data);
export const addDeduction = (data: { staffId: number; type: string; amount: number; notes?: string }) =>
  apiClient.post('/payroll/deductions', data);
export const lockPayroll = (id: number) => apiClient.patch(`/payroll/periods/${id}/lock`);

// Message methods
export const getMyMessages = () => apiClient.get('/messages');
export const sendMessage = (data: { receiverId: number; subject: string; body: string }) =>
  apiClient.post('/messages', data);
export const markMessageRead = (id: number) => apiClient.patch(`/messages/${id}/read`);

// Review methods
export const submitReview = (data: SubmitReviewRequest) => apiClient.post('/reviews', data);
export const getStaffReviews = (staffId: number) => apiClient.get(`/reviews/staff/${staffId}`);
export const getAllReviews = () => apiClient.get('/reviews');
export const moderateReview = (id: number, isApproved: boolean) => apiClient.patch(`/reviews/${id}/moderate`, { isApproved });
export const getPublicReviews = () => apiClient.get('/reviews/public');

// Customer CRM methods
export const searchCustomers = (query: string) =>
  apiClient.get('/customers/search', { params: { query } });
export const getCustomerHistory = (id: number) => apiClient.get(`/customers/${id}/history`);
export const updateCustomerProfile = (data: UpdateCustomerProfileRequest) => apiClient.put('/customers/profile', data);

// Attendance methods
export const getAttendanceStatus = () => apiClient.get('/attendance/status');
export const checkIn = () => apiClient.post('/attendance/check-in');
export const checkOut = () => apiClient.post('/attendance/check-out');
export const getAllAttendance = (params: { startDate?: string; endDate?: string }) => 
  apiClient.get('/attendance/all', { params });
export const updateAttendance = (id: number, data: UpdateAttendanceRequest) => apiClient.put(`/attendance/${id}`, data);

// Report methods
export const getReports = (params: { startDate?: string; endDate?: string }) =>
  apiClient.get('/reports/payroll', { params });
export const getDailySales = (date?: string) =>
  apiClient.get('/reports/daily-sales', { params: { date } });
export const getHistoricalAnalytics = (params: { startDate: string; endDate: string }) =>
  apiClient.get('/reports/historical-analytics', { params });

// Analytics endpoints
export const getStaffPerformance = (params: { startDate: string; endDate: string }) =>
  apiClient.get<{ success: boolean; data: StaffPerformanceStat[] }>('/reports/staff-performance', { params });

export const getRetentionAnalytics = (params: { startDate: string; endDate: string }) =>
  apiClient.get<{ success: boolean; data: RetentionData }>('/reports/retention', { params });

export const getKpiSummary = (params: { startDate: string; endDate: string }) =>
  apiClient.get<{ success: boolean; data: KpiSummaryData }>('/reports/kpi-summary', { params });

// Notification methods
export const getNotifications = () => apiClient.get('/notifications');
export const markNotificationRead = (id: number) => apiClient.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => apiClient.put('/notifications/read-all');

// Exhibit methods
export const getExhibits = () => apiClient.get('/exhibits');
export const createExhibit = (data: { title: string; image_url: string; staff_id: number; service_id?: number }) =>
  apiClient.post('/exhibits', data);
export const deleteExhibit = (id: number) => apiClient.delete(`/exhibits/${id}`);

// CMS methods

// Settings (landing page copy)
export const getCmsSettings = () =>
  apiClient.get<{ success: boolean; data: SiteSettingsData }>('/cms/settings');

export const saveCmsSettings = (data: SaveSettingsRequest) =>
  apiClient.put<{ success: boolean; data: { updated: number } }>('/cms/settings', data);

// Content (FAQ + policies)
export const getCmsContent = (params?: { type?: 'faq' | 'policy'; limit?: number; activeOnly?: boolean }) =>
  apiClient.get<{ success: boolean; data: SiteContent[] }>('/cms/content', { params });

export const createCmsContent = (data: { type: 'faq' | 'policy'; title: string; body: string; sort_order?: number; is_active?: boolean }) =>
  apiClient.post<{ success: boolean; data: SiteContent }>('/cms/content', data);

export const updateCmsContent = (id: number, data: { title?: string; body?: string; sort_order?: number; is_active?: boolean }) =>
  apiClient.put<{ success: boolean; data: SiteContent }>(`/cms/content/${id}`, data);

export const deleteCmsContent = (id: number) =>
  apiClient.delete<{ success: boolean; message: string }>(`/cms/content/${id}`);

// Package endpoints
export const getPackages = () =>
  apiClient.get<{ success: boolean; data: ServicePackage[] }>('/packages');

export const getActivePackages = () =>
  apiClient.get<{ success: boolean; data: ServicePackage[] }>('/packages/active');

export const getPackage = (id: number) =>
  apiClient.get<{ success: boolean; data: ServicePackage }>(`/packages/${id}`);

export const createPackage = (data: CreatePackagePayload) =>
  apiClient.post<{ success: boolean; data: ServicePackage }>('/packages', data);

export const updatePackage = (id: number, data: UpdatePackagePayload) =>
  apiClient.put<{ success: boolean; data: ServicePackage }>(`/packages/${id}`, data);

export const togglePackage = (id: number, isActive: boolean) =>
  apiClient.patch<{ success: boolean; data: ServicePackage }>(`/packages/${id}/toggle`, { is_active: isActive });

export const deletePackage = (id: number) =>
  apiClient.delete<{ success: boolean; message: string }>(`/packages/${id}`);

export default apiClient;
