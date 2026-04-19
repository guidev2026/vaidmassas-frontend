import api from './api'

export const saleService = {
  create: (data) => api.post('/sales', data).then(r => r.data),
  getHistory: (period) => api.get('/sales/history', { params: { period } }).then(r => r.data),
}