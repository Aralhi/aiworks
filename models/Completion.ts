import { Schema, model, Document, models } from 'mongoose'

export interface ICompletion extends Document {
  prompt: String;
  id: String;
  created: Number;
  model: String;
  content: String;
}

/* PetSchema will correspond to a collection in your MongoDB database. */
const CompletionSchema = new Schema({
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
  }
})

export default models.Completion ||  model('Completion', CompletionSchema, 'completion')

