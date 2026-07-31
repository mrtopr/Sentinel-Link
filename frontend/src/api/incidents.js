import apiClient from './client.js';

export const incidentApi = {
    getIncidents: async (params) => {
        const response = await apiClient.get('/incidents', { params });
        return response.data;
    },
    getIncidentById: async (id) => {
        const response = await apiClient.get(`/incidents/${id}`);
        return response.data;
    },
    createIncident: async (formData) => {
        const response = await apiClient.post('/incidents', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    updateIncidentStatus: async (id, status) => {
        const response = await apiClient.patch(`/incidents/${id}/status`, { status });
        return response.data;
    },
    upvoteIncident: async (id) => {
        const response = await apiClient.post(`/incidents/${id}/upvote`);
        return response.data;
    },
    deleteIncident: async (id) => {
        const response = await apiClient.delete(`/incidents/${id}`);
        return response.data;
    },
    addNote: async (id, note) => {
        const response = await apiClient.post(`/incidents/${id}/notes`, { note });
        return response.data;
    },
    updateSeverity: async (id, severity) => {
        const response = await apiClient.patch(`/incidents/${id}/severity`, { severity });
        return response.data;
    },
};
