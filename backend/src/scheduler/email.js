import cron from 'node-cron'
import { createTransport, sendMail } from '../utils/email.js'
import User from '../models/User.js'
import Task from '../models/Task.js'
import NotificationLog from '../models/NotificationLog.js'
export const setupEmailScheduler = () => {
  const transporter = createTransport()
  cron.schedule('0 */6 * * *', async () => {
    try {
      const users = await User.find({ 'settings.emailOptIn': true })
      const since = new Date(Date.now() - 6 * 60 * 60 * 1000)
      for (const u of users) {
        const completed = await Task.find({ userId: u._id, status: 'completed', completedAt: { $gte: since } })
        const pending = await Task.find({ userId: u._id, status: 'pending' })
        const summary = {
          windowStart: since.toISOString(),
          completedCount: completed.length,
          pendingCount: pending.length,
          completed: completed.map(t => ({ id: String(t._id), title: t.title, completedAt: t.completedAt })),
          pending: pending.map(t => ({ id: String(t._id), title: t.title }))
        }
        const html = `<h2>Your 6-hour Productivity Summary</h2><p>Completed: ${summary.completedCount}</p><p>Pending: ${summary.pendingCount}</p>`
        const ok = await sendMail(transporter, u.email, 'Your Productivity Summary', html)
        if (ok) await NotificationLog.create({ userId: u._id, summary })
      }
    } catch {}
  })
}