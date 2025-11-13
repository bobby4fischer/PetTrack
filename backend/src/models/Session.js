import mongoose from 'mongoose'
const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  type: { type: String, default: 'pomodoro' },
  startAt: { type: Date },
  endAt: { type: Date },
  durationMinutes: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  interruptions: { type: Number, default: 0 }
}, { timestamps: true })
export default mongoose.model('Session', sessionSchema)