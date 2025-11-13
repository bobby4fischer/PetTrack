import mongoose from 'mongoose'
const activityEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  type: { type: String, enum: ['idle','deviation'] },
  url: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true })
export default mongoose.model('ActivityEvent', activityEventSchema)