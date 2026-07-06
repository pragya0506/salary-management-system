import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password })
}

export const employeeApi = {
  getAll: (params: any) => api.get('/employees', { params }),
  getById: (id: string) => api.get(`/employees/${id}`),
  create: (data: any) => api.post('/employees', data),
  update: (id: string, data: any) => api.put(`/employees/${id}`, data),
  deactivate: (id: string) => api.delete(`/employees/${id}`),
  bulkImport: (csv: string) => api.post('/employees/import', { csv })
}

export const analyticsApi = {
  getSummary: () => api.get('/analytics/summary'),
  getByDepartment: () => api.get('/analytics/by-department'),
  getByCountry: () => api.get('/analytics/by-country')
}