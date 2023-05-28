import { Schema, model, models } from 'mongoose'

export interface ICompletion {
  userId: string;
  prompt: string;
  role: string;
  stream: Boolean;
  chatId: string; // chat gpt id
  model: string;
  content: string;
  createAt?: string;
  conversationId: string;
  usage?: Usage 
  fingerprint?: string;
}

export type Usage = {
  prompt_tokens: Number;
  completion_tokens: Number;
  total_tokens: Number;
}

const CompletionSchema = new Schema({
  userId: {
    type: String,
  },
  prompt: {
    type: String,
    required: [true, 'Please provide prompt.'],
  },
  chatId: {
    type: String,
  },
  createAt: {
    type: Date,
    default: Date.now,
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
  },
  fingerprint: {
    type: String,
  }
})

export default models?.Completion ||  model('Completion', CompletionSchema, 'completion')
