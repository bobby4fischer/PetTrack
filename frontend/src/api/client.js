import axios from 'axios'
const base = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api')
export const api = axios.create({ baseURL: base })
api.interceptors.request.use((config) => {
  const t = localStorage.getItem('authToken')
  if (t) config.headers.Authorization = `Bearer ${t}`
  return config
})
export const authSignup = (email, password, displayName) => api.post('/auth/signup', { email, password, displayName })
export const authLogin = (email, password) => api.post('/auth/login', { email, password })
export const tasksList = () => api.get('/tasks')
export const taskCreate = (title) => api.post('/tasks', { title })
export const taskComplete = (id) => api.patch(`/tasks/${id}/complete`)
export const taskDelete = (id) => api.delete(`/tasks/${id}`)
export const sessionStart = (taskId) => api.post('/sessions/start', { taskId })
export const sessionStop = (id) => api.post('/sessions/stop', { id })