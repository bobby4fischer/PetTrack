import jwt from 'jsonwebtoken'
export const authMiddleware = (req, res, next) => {
  const h = req.headers.authorization || ''
  const t = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!t) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const p = jwt.verify(t, process.env.JWT_SECRET)
    req.userId = p.id
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}