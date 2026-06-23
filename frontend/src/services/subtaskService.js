import axiosClient from '../api/axiosClient';

const subtaskService = {
  getSubtasks: async (taskId) => {
    const response = await axiosClient.get(`/tasks/${taskId}/subtasks`);
    return response.data.data || [];
  },

  createSubtask: async (taskId, title) => {
    const response = await axiosClient.post(`/tasks/${taskId}/subtasks`, { title });
    return response.data.data;
  },

  bulkCreateSubtasks: async (taskId, subtasks) => {
    const response = await axiosClient.post(`/tasks/${taskId}/subtasks/bulk`, { subtasks });
    return response.data.data;
  },

  updateSubtask: async (taskId, subtaskId, data) => {
    const response = await axiosClient.put(`/tasks/${taskId}/subtasks/${subtaskId}`, data);
    return response.data.data;
  },

  deleteSubtask: async (taskId, subtaskId) => {
    const response = await axiosClient.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
    return response.data;
  }
};

export default subtaskService;