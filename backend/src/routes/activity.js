import { Router } from 'express'
import ActivityEvent from '../models/ActivityEvent.js'
const router = Router()
router.post('/', async (req, res) => {
  const { type, url } = req.body
  const e = await ActivityEvent.create({ userId: req.userId, type, url })
  try {
    const io = req.app.get('io')
    io.to(`user:${req.userId}`).emit('idle:alert', { type, url })
  } catch {}
  res.json(e)
})
export default router