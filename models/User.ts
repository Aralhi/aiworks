import { USERNAME_LENGTH } from '@/utils/constants'
import { Schema, model, Document, models } from 'mongoose'
import { IPricing } from './Pricing';

export interface IUser extends Document {
  name: string;
  userCode: string;
  phone: string;
  avatarUrl?: string;
  pricing?: IPricing;
}

/* PetSchema will correspond to a collection in your MongoDB database. */
const UserSchema = new Schema({
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
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  }
})

export default models.User ||  model('User', UserSchema, 'user')
