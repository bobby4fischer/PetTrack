import mongoose from 'mongoose'
const notificationLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  sentAt: { type: Date, default: Date.now },
  summary: { type: Object }
}, { timestamps: true })
export default mongoose.model('NotificationLog', notificationLogSchema)