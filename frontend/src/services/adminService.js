import api from './api';

const adminService = {
  // Bootstrap
  bootstrapAdmin: async () => {
    const response = await api.post('/admin/bootstrap');
    return response.data;
  },

  // Users
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  toggleUserStatus: async (id, isActive) => {
    const response = await api.put(`/admin/users/${id}/status`, { isActive });
    return response.data;
  },

  // Moderation
  deletePostAdmin: async (id) => {
    const response = await api.delete(`/admin/posts/${id}`);
    return response.data;
  },
  
  getReports: async () => {
    const response = await api.get('/admin/reports');
    return response.data;
  },
  
  resolveReport: async (id, status) => {
    const response = await api.put(`/admin/reports/${id}/resolve`, { status });
    return response.data;
  }
};

export default adminService;
