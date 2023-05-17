import { Schema, model, models } from 'mongoose'
import { IPricing } from './Pricing';

export interface IOrder {
  userId: string; // 用户id
  paidPrice: number; // 实付金额，原价在pricing里
  status: string; // 订单状态。pending、paid、expired
  pricing: IPricing;
  // 第三方信息，比如微信支付订单号，回调状态等信息
}

// 套餐信息
const OrderSchema = new Schema({
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
  }
})

export default models.Order ||  model('Order', OrderSchema, 'order')
