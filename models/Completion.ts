import { Schema, model, models } from 'mongoose'

export interface ICompletion {
  userId: string;
  prompt: string;
  role: string;
  stream: Boolean;
  id: string; // chatgpt id
  created: Number;
  model: string;
  content: string;
  conversationId: string;
  usage?: Usage 
}

export type Usage = {
  prompt_tokens: Number;
  completion_tokens: Number;
  total_tokens: Number;
}

/* PetSchema will correspond to a collection in your MongoDB database. */
const CompletionSchema = new Schema({
  userId: {
    type: String,
  },
  prompt: {
    type: String,
    required: [true, 'Please provide prompt.'],
  },
  id: {
    type: String,
    required: [true, 'Please provide a completion id.'],
    unique: true,
  },
  created: {
    type: Number,
    required: [true, 'Please provide a created.'],
  },
  model: {
    type: String,
    required: [true, 'Please provide a model.'],
  },
  content: {
    type: String,
    required: [true, 'Please provide content.'],
  },
  role: {
    type: String,
    required: [true, 'Please provide a role.'],
  },
  conversationId: {
    type: String,
  },
  stream: {
    type: Boolean,
  },
  usage: {
    type: Object,
  }
})

export default models.Completion ||  model('Completion', CompletionSchema, 'completion')

