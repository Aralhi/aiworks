import { Schema, model, models } from 'mongoose'

export interface ICompletion {
  userId: String;
  prompt: String;
  role: String;
  stream: Boolean;
  id: String;
  created: Number;
  model: String;
  content: String;
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
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Please provide content.'],
  },
  role: {
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

