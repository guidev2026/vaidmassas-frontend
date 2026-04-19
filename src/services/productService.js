import api from './api'

export const productService = {
  getAll: (categoryId) => api.get('/products', {
    params: categoryId ? { categoryId } : {}
  }).then(r => r.data),
  create: (data) => api.post('/products', data).then(r => r.data),
  update: (id, data) => api.put(`/products/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/products/${id}`),
}