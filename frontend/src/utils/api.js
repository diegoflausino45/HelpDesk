import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Criar instância do Axios com configurações padrão
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado, redirecionar para login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Funções de API para Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Funções de API para Usuários
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Funções de API para Setores
export const sectorsAPI = {
  getAll: () => api.get('/sectors'),
  create: (data) => api.post('/sectors', data),
  update: (id, data) => api.put(`/sectors/${id}`, data),
  delete: (id) => api.delete(`/sectors/${id}`),
};

// Funções de API para Chamados
export const ticketsAPI = {
  getAll: () => api.get('/tickets'),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post('/tickets', data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
  getHistory: (id) => api.get(`/tickets/${id}/history`),
};

// Funções de API para Comentários
export const commentsAPI = {
  getByTicket: (ticketId) => api.get(`/comments/ticket/${ticketId}`),
  create: (data) => api.post('/comments', data),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
};

// Funções de API para Anexos
export const attachmentsAPI = {
  uploadToTicket: (ticketId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/attachments/ticket/${ticketId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadToComment: (commentId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/attachments/comment/${commentId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getDownloadUrl: (id) => `${API_BASE_URL}/attachments/${id}/download`,
  delete: (id) => api.delete(`/attachments/${id}`),
};

// Funções de API para Notificações
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete('/notifications'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;