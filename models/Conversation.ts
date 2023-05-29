import { Schema, model, models } from 'mongoose'

export interface IConversation {
  userId: string;
  name: string;
  createAt?: string;
  _id: string;
}

const ConversationSchema = new Schema({
  userId: {
    type: String,
    required: [true, 'Please provide a user id.'],
  },
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
})

ConversationSchema.index({ userId: 1, createAt: -1 })

export default models?.Conversation ||  model('Conversation', ConversationSchema, 'conversation')

