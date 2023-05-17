import { USERNAME_LENGTH } from '@/utils/constants'
import { Schema, model, models } from 'mongoose'

export interface IUser {
  name: string;
  userCode: string;
  phone: string;
  createAt?: string;
  avatarUrl?: string;
  pricing?: UserPricing;
}

// 用户的套餐信息
export type UserPricing = {
  name: string; // 套餐名
  queryCount: number; // 查询次数
  isEffective: boolean; //是否生效
  startTimestamp: number; // 开始时间戳，ms
  endTimestamp: number; // 结束时间戳，ms
}

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
    unique: true,
  },
  avatarUrl: {
    type: String,
    required: false,
  },
  inviteCode: {
    type: String
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
