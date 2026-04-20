import api from './api'

export const saleService = {
  create:          (data)         => api.post('/sales', data).then(r => r.data),
  update:          (id, data)     => api.put(`/sales/${id}`, data).then(r => r.data),
  remove:          (id)           => api.delete(`/sales/${id}`),
  getHistory:      (period)       => api.get('/sales/history', { params: { period } }).then(r => r.data),
  getDetailed:     (period)       => api.get('/sales/history/detailed', { params: { period } }).then(r => r.data),
}