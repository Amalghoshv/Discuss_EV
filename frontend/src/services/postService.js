import api from './api';

const postService = {
  getPosts: async (params = {}) => {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  getPostById: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  getFeedPosts: async (params = {}) => {
    const response = await api.get('/posts/feed', { params });
    return response.data;
  },

  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  updatePost: async (id, postData) => {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  },

  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  likePost: async (id, type = 'like') => {
    const response = await api.post(`/posts/${id}/like`, { type });
    return response.data;
  },

  getTrendingPosts: async (limit = 10) => {
    const response = await api.get('/posts/trending', { params: { limit } });
    return response.data;
  },
};

export default postService;
