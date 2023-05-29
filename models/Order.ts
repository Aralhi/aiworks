import { PricingPlan } from '@/utils/constants';
import { Schema, model, models } from 'mongoose'

export interface IOrder {
  userId: string; // 用户id
  paidPrice: number; // 实付金额，原价在pricing里
  status: string; // 订单状态。pending、paid、expired
  pricing: PricingPlan;
  // 第三方信息，比如微信支付订单号，回调状态等信息
}

// 套餐信息
const OrderSchema = new Schema({
  tradeNo: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: [true, 'Please provide user id.'],
  },
  paidPrice: {
    type: Number,
    required: [true, 'Please provide paid price.'],
  },
  status: {
    type: String,
    required: [true, 'Please provide order status.']
  },
  pricing: {
    type: Object,
    required: [true, 'Please provide pricing.'],
  },
  extra: {
    type: Object,
  },
  createAt: {
    type: Date,
  },
  updateAt: {
    type: Date,
  }
})

export const OrderStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  COMPLETE: 'COMPLETE',
  CLOSED: 'CLOSED',
  // hold: 'hold',
  // canceled: 'canceled',
}

OrderSchema.index({ userId: 1, createAt: -1, updateAt: -1 })

export default models.Order ||  model('Order', OrderSchema, 'order')
