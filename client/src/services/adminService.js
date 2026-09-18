import api from './api';

export const adminService = {
  getAllAppointments: async (params = {}) => {
    const response = await api.get('/admin/appointments', { params });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getTodayAppointments: async () => {
    const response = await api.get('/admin/appointments/today');
    return response.data;
  },

  getUpcomingAppointments: async () => {
    const response = await api.get('/admin/appointments/upcoming');
    return response.data;
  },

  updateAppointmentStatus: async (id, data) => {
    const response = await api.put(`/admin/appointments/${id}/status`, data);
    return response.data;
  },

  getCustomerHistory: async (params = {}) => {
    const response = await api.get('/admin/customers/history', { params });
    return response.data;
  },
};
