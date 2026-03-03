import api from './api';

const userService = {
    getUserProfile: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    followUser: async (id) => {
        const response = await api.post(`/users/${id}/follow`);
        return response.data;
    },

    unfollowUser: async (id) => {
        const response = await api.delete(`/users/${id}/follow`);
        return response.data;
    },

    getUserPosts: async (id, params) => {
        const response = await api.get(`/users/${id}/posts`, { params });
        return response.data;
    }
};

export default userService;
