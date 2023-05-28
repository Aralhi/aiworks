import { NextApiRequest, NextApiResponse } from "next";
import { sessionOptions } from "@/lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import Order, { IOrder, OrderStatus } from "@/models/Order";
import { queryByTradeNo } from "@/lib/wechatPay";
import User, { IUser, UserPricing } from "@/models/User";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.info('paying...');
  try {
    const tradeNo = req.query.tradeNo as string;
    const { _id: userId } = req.session.user || {};
    if (!userId) {
      throw 'not login';
    }
    if (!tradeNo) {
      throw 'no trade no';
    }
    const orderInfo = await queryByTradeNo(tradeNo);
    if (orderInfo.code) {
      res.json({
        status: 'failed',
        data: orderInfo.code,
        message: orderInfo.message
      });
    } else if (orderInfo.trade_state === 'SUCCESS') {
      const order = await Order.findOneAndUpdate({ tradeNo }, {
        $set: {
          status: OrderStatus.COMPLETE,
          paidPrice: orderInfo.amount.total,
          extra: {
            $set: {
              wechatPayOriginalData: orderInfo
            }
          },
          updateAt: new Date()
        }
      });
      const user = await User.findById(userId);
      let updatedPricings = []
      if (!user.pricings?.length) {
        updatedPricings = order.pricing
      } else {
        updatedPricings = (user.pricings || []).map((pricing: UserPricing) => {
          if (pricing.id === order.pricing.id) {
            return { ...pricing, ...order.pricing };
          }
          return pricing;
        });
      }
      const userRes = await User.findByIdAndUpdate(userId, {
        pricings: updatedPricings,
        updateAt: new Date()
      });
      console.log('update user pricings success', userRes);
      res.json({
        tradeNo,
        status: OrderStatus.COMPLETE,
      });
    } else {
      res.json({
        tradeNo,
        status: OrderStatus.PENDING,
      });
    }
  } catch (e) {
    console.error('query weixin pay order failed', e);
    res.json({
      succes: false,
      message: e
    })
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)