import { io } from 'socket.io-client'
export const createSocket = () => {
  const token = localStorage.getItem('authToken')
  const url = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/_?api$/, '')
  return io(url, { auth: { token } })
}