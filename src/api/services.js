import api from './axios';

// ---- Auth ----
export const createTeamMember = (data) => api.post('/auth/register', data);

//
export const getAllUsers = () => api.get('/auth/users');

// ---- Projects ----
export const getProjects = () => api.get('/projects');
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post('/projects', data);
export const addMembersToProject = (id, members) =>
  api.put(`/projects/${id}/members`, { members });
export const getProjectProgress = (id) => api.get(`/projects/${id}/progress`);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// ---- Tasks ----
export const getTasks = (params) => api.get('/tasks', { params });
export const getTaskById = (id) => api.get(`/tasks/${id}`);
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const updateTaskStatus = (id, status) => api.patch(`/tasks/${id}/status`, { status });
export const addComment = (id, text) => api.post(`/tasks/${id}/comments`, { text });
export const getDeadlineHistory = (id) => api.get(`/tasks/${id}/deadline-history`);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);