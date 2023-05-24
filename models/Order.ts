import { IPricing } from './Pricing';

export interface IOrder {
  userId: string; // 用户id
  paidPrice: number; // 实付金额，原价在pricing里
  status: string; // 订单状态。pending、paid、expired
  pricing: IPricing;
  // 第三方信息，比如微信支付订单号，回调状态等信息
}


export const OrderStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  COMPLETE: 'COMPLETE',
  CLOSED: 'CLOSED',
  // hold: 'hold',
  // canceled: 'canceled',
}
