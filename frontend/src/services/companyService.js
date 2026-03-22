import api from './api';

const companyService = {
  getCompanies: async () => {
    const response = await api.get('/companies');
    return response.data;
  },

  registerCompany: async (companyData) => {
    const response = await api.post('/companies', companyData);
    return response.data;
  },

  verifyCompany: async (id, status) => {
    const response = await api.put(`/companies/${id}/verify`, { status });
    return response.data;
  }
};

export default companyService;
