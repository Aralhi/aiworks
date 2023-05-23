import { Schema, model, models } from 'mongoose'

const SettingsSchema = new Schema({
  key: {
    type: String,
  },
  value: {
    type: String,
  },
  expireAt: {
    type: Date,
  },
  expireAtString: {
    type: String,
  },
  expiresIn: {
    type: Number,
  },
  timestamp: {
    type: Number,
  },
  expiresInSeconds: {
    type: Number
  }
})

export default models.Settings ||  model('Settings', SettingsSchema, 'settings')
