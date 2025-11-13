import { Router } from 'express'
import Session from '../models/Session.js'
const router = Router()
router.post('/start', async (req, res) => {
  const taskId = req.body.taskId || null
  const s = await Session.create({ userId: req.userId, taskId, type: 'pomodoro', startAt: new Date() })
  res.json(s)
})
router.post('/stop', async (req, res) => {
  const id = req.body.id
  const now = new Date()
  const s0 = await Session.findOne({ _id: id, userId: req.userId })
  const dur = s0?.startAt ? Math.max(0, Math.round((now.getTime() - s0.startAt.getTime()) / 60000)) : 0
  const s = await Session.findOneAndUpdate({ _id: id, userId: req.userId }, { endAt: now, durationMinutes: dur, completed: true }, { new: true })
  try {
    const io = req.app.get('io')
    io.to(`user:${req.userId}`).emit('reward:update', { gemsDelta: 5 })
    io.to(`user:${req.userId}`).emit('pet:react', { type: 'sessionComplete', sessionId: String(s._id) })
  } catch {}
  res.json(s)
})
router.get('/history', async (req, res) => {
  const list = await Session.find({ userId: req.userId }).sort({ startAt: -1 }).limit(50)
  res.json(list)
})
export default router