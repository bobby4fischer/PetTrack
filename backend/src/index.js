import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import http from 'http'
import { Server } from 'socket.io'
import authRoutes from './routes/auth.js'
import taskRoutes from './routes/tasks.js'
import petRoutes from './routes/pet.js'
import storeRoutes from './routes/store.js'
import sessionRoutes from './routes/sessions.js'
import activityRoutes from './routes/activity.js'
import { authMiddleware } from './middleware/auth.js'
import { setupEmailScheduler } from './scheduler/email.js'
dotenv.config()
const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL, credentials: true } })
app.set('io', io)
io.on('connection', (socket) => {
  try {
    const t = socket.handshake?.auth?.token || socket.handshake?.query?.token
    if (!t) return
    const p = JSON.parse(Buffer.from(t.split('.')[1] || '', 'base64').toString('utf8'))
    const id = p?.id || p?._id
    if (!id) return
    socket.join(`user:${id}`)
  } catch {}
})
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/tasks', authMiddleware, taskRoutes)
app.use('/api/pet', authMiddleware, petRoutes)
app.use('/api/store', authMiddleware, storeRoutes)
app.use('/api/sessions', authMiddleware, sessionRoutes)
app.use('/api/activity', authMiddleware, activityRoutes)
const port = Number(process.env.SERVER_PORT || 4000)
const uri = process.env.MONGODB_URI
const start = async () => {
  try {
    if (uri) {
      await mongoose.connect(uri)
    }
    server.listen(port)
    setupEmailScheduler()
  } catch (e) {
    process.exit(1)
  }
}
start()