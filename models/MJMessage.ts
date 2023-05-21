import { Schema, model, models } from 'mongoose'

export type ResponseError = {
  message: string
}

export interface IMJMessage {
  userId: string
  fingerprint?: string
  prompt: string
  type: string
  index?: number
  msgId?: string
  msgHash?: string
}

const MJMessageSchema = new Schema({
  userId: {
    type: String,
  },
  fingerprint: {
    type: String,
  },
  prompt: {
    type: String,
    required: [true, 'Please provide prompt.'],
  },
  type: { // imagine, upscale, variation
    type: String,
    required: [true, 'Please provide a type.'],
  },
  index: {
    type: Number,
  },
  msgId: {
    type: String,
  },
  msgHash: {
    type: String,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
})

export default models.MJMessageSchema ||  model('MJMessage', MJMessageSchema, 'mjmessage')