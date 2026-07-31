import apiClient from './client.js';

export const authApi = {
    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },
    getProfile: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
};
