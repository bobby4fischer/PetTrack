import { Router } from 'express'
import Task from '../models/Task.js'
const router = Router()
router.get('/', async (req, res) => {
  const items = await Task.find({ userId: req.userId }).sort({ createdAt: -1 })
  res.json(items)
})
router.post('/', async (req, res) => {
  const title = String(req.body.title || '').trim()
  if (!title) return res.status(400).json({ error: 'Title required' })
  const item = await Task.create({ userId: req.userId, title })
  res.json(item)
})
router.patch('/:id/complete', async (req, res) => {
  const id = req.params.id
  const hasSession = await (await import('../models/Session.js')).default.findOne({ userId: req.userId, taskId: id, completed: true, durationMinutes: { $gte: 25 } })
  if (!hasSession) return res.status(400).json({ error: 'Complete a 25-minute session linked to this task first' })
  const item = await Task.findOneAndUpdate({ _id: id, userId: req.userId }, { status: 'completed', completedAt: new Date() }, { new: true })
  try {
    const io = req.app.get('io')
    io.to(`user:${req.userId}`).emit('pet:react', { type: 'taskComplete', taskId: String(item._id) })
    io.to(`user:${req.userId}`).emit('reward:update', { gemsDelta: 3 })
  } catch {}
  res.json(item)
})
router.delete('/:id', async (req, res) => {
  const id = req.params.id
  await Task.deleteOne({ _id: id, userId: req.userId })
  res.json({ ok: true })
})
export default router