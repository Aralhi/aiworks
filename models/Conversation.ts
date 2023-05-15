import { Schema, model, models } from 'mongoose'

export interface IConversation {
  userId: string;
  name: string;
  createAt: Number;
  _id: string;
}

/* PetSchema will correspond to a collection in your MongoDB database. */
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
    type: Number,
    required: [true, 'Please provide a createAt.'],
    default: Date.now
  },
})

export default models.Conversation ||  model('Conversation', ConversationSchema, 'conversation')

