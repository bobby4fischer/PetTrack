import { Router } from 'express'
import User from '../models/User.js'
const router = Router()
router.get('/', async (req, res) => {
  const u = await User.findById(req.userId)
  res.json({ pet: u.pet })
})
router.post('/feed', async (req, res) => {
  const u = await User.findById(req.userId)
  const type = req.body.type
  const amt = type === 'food' ? 10 : type === 'milk' ? 5 : 15
  const newLife = Math.min(100, (u.pet.life || 0) + amt)
  u.pet.life = newLife
  u.pet.lastDecayAt = new Date()
  await u.save()
  res.json({ pet: u.pet })
})
router.post('/renew', async (req, res) => {
  const u = await User.findById(req.userId)
  u.pet.life = 80
  u.pet.lastDecayAt = new Date()
  u.inventory = { food: 0, milk: 0, toys: 0 }
  u.gems = 0
  await u.save()
  res.json({ pet: u.pet, inventory: u.inventory, gems: u.gems })
})
export default router