import { USERNAME_LENGTH } from '@/utils/constants'
import { Schema, model, Document } from 'mongoose'

export interface IPricing extends Document {
  name: string;
  queryCount: number;
}

/* PetSchema will correspond to a collection in your MongoDB database. */
const PricingSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
    maxlength: [USERNAME_LENGTH, `Name cannot be more than ${USERNAME_LENGTH} characters`],
  },
  userCode: {
    type: String,
    required: [true, 'Please provide a user code.']
  },
  phone: {
    type: String,
    required: [false, 'Please provide a phone number.'],
    unique: true,
  },
  avatarUrl: {
    type: String,
    required: false,
  }
})

export default model('Pricing', PricingSchema)
