import api from './api';

const analyticsService = {
  getEngagement: async () => {
    const response = await api.get('/analytics/engagement');
    return response.data;
  },
  getGrowth: async () => {
    const response = await api.get('/analytics/growth');
    return response.data;
  },
  getPopularTags: async () => {
    const response = await api.get('/analytics/tags/popular');
    return response.data;
  }
};

export default analyticsService;
