import axiosClient from '../api/axiosClient';

const projectService = {
  getProjects: async () => {
    const response = await axiosClient.get('/projects');
    return response.data.data || [];
  },

  getProjectById: async (id) => {
    const response = await axiosClient.get(`/projects/${id}`);
    return response.data.data;
  },

  createProject: async (data) => {
    const response = await axiosClient.post('/projects', data);
    return response.data.data;
  },

  updateProject: async (id, data) => {
    const response = await axiosClient.put(`/projects/${id}`, data);
    return response.data.data;
  },

  deleteProject: async (id) => {
    const response = await axiosClient.delete(`/projects/${id}`);
    return response.data;
  },

  getProjectTasks: async (id, filters = {}) => {
    const response = await axiosClient.get(`/projects/${id}/tasks`, { params: filters });
    return response.data.data || [];
  }
};

export default projectService;