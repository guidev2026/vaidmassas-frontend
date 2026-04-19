import api from './api'

export const ingredientService = {
  getAll: () => api.get('/ingredients').then(r => r.data),
  create: (data) => api.post('/ingredients', data).then(r => r.data),
  update: (id, data) => api.put(`/ingredients/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/ingredients/${id}`),
}