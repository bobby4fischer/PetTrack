import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
const router = Router()
router.post('/signup', async (req, res) => {
  const { email, password, displayName } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Invalid' })
  const exists = await User.findOne({ email })
  if (exists) return res.status(409).json({ error: 'Exists' })
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ email, passwordHash, displayName })
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user._id, email: user.email, displayName: user.displayName, gems: user.gems, settings: user.settings, pet: user.pet, inventory: user.inventory } })
})
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user._id, email: user.email, displayName: user.displayName, gems: user.gems, settings: user.settings, pet: user.pet, inventory: user.inventory } })
})
export default router