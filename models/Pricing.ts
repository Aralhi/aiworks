import { Schema, model, models } from 'mongoose'

// 用户的套餐信息，下单后更新到用户表
export interface IPricing {
  name: string; // 套餐名
  queryCount: number; // 套餐内查询次数
  startAt: number; // 套餐生效开始时间
  endAt: number; // 套餐结束时间
}

// 套餐信息
const PricingSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide pricing name.'],
  },
  label: {
    type: String,
    required: [true, 'Please provide pricing label.'],
  },
  queryCount: {
    type: Number,
    required: [true, 'Please provide query count.']
  },
  price: {
    type: Number,
    required: [true, 'Please provide price.'],
  },
  period: {
    type: Number,
    required: [true, 'Please provide period.'],
  },
})

export default models.Pricing ||  model('Pricing', PricingSchema, 'pricing')
