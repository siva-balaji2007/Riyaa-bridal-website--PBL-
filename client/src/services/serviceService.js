import api from './api';

export const serviceService = {
  getAllServices: async (category = '') => {
    const params = category && category !== 'all' ? { category } : {};
    const response = await api.get('/services', { params });
    return response.data;
  },

  getServiceById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },
};
