import mongoose from 'mongoose'
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String },
  gems: { type: Number, default: 0 },
  settings: {
    theme: { type: String, default: 'light' },
    emailOptIn: { type: Boolean, default: true }
  },
  pet: {
    life: { type: Number, default: 100 },
    hunger: { type: Number, default: 0 },
    mood: { type: String, default: 'neutral' },
    level: { type: Number, default: 1 },
    lastDecayAt: { type: Date, default: Date.now }
  },
  inventory: {
    food: { type: Number, default: 0 },
    milk: { type: Number, default: 0 },
    toys: { type: Number, default: 0 }
  }
}, { timestamps: true })
export default mongoose.model('User', userSchema)