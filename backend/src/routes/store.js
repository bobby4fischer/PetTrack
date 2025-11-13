import { Router } from 'express'
import User from '../models/User.js'
const router = Router()
router.get('/', async (req, res) => {
  const u = await User.findById(req.userId)
  res.json({ gems: u.gems, inventory: u.inventory })
})
router.post('/purchase', async (req, res) => {
  const type = req.body.type
  const cost = { food: 9, milk: 8, toys: 10 }[type] ?? 1
  const u = await User.findById(req.userId)
  if (u.gems < cost) return res.status(400).json({ error: 'Insufficient gems' })
  u.gems -= cost
  u.inventory[type] = Math.min(99, (u.inventory[type] || 0) + 1)
  await u.save()
  res.json({ gems: u.gems, inventory: u.inventory })
})
router.post('/spend', async (req, res) => {
  const amt = Number(req.body.amount || 0)
  const u = await User.findById(req.userId)
  u.gems = Math.max(0, (u.gems || 0) - amt)
  await u.save()
  res.json({ gems: u.gems })
})
router.post('/award', async (req, res) => {
  const amt = Number(req.body.amount || 0)
  const u = await User.findById(req.userId)
  u.gems = (u.gems || 0) + amt
  await u.save()
  res.json({ gems: u.gems })
})
export default router