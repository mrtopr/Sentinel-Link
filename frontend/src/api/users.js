import apiClient from './client.js';

export const userApi = {
    getUsers: async () => {
        const response = await apiClient.get('/auth/users');
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await apiClient.delete(`/auth/users/${id}`);
        return response.data;
    },

    updateUserRole: async (id, role) => {
        const response = await apiClient.patch(`/auth/users/${id}/role`, { role });
        return response.data;
    },

    createUser: async (userData) => {
        const response = await apiClient.post('/auth/users', userData);
        return response.data;
    }
};
