import mongoose from 'mongoose'
const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['pending','completed'], default: 'pending' },
  category: { type: String },
  completedAt: { type: Date }
}, { timestamps: true })
export default mongoose.model('Task', taskSchema)