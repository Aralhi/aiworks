import { NextApiRequest, NextApiResponse } from "next";
import { sessionOptions } from "@/lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { OrderStatus } from "@/models/Order";
import { queryByTradeNo } from "@/lib/wechatPay";
import { updateMany } from "@/lib/db";

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
    if (orderInfo.trade_state === 'SUCCESS') {
      updateMany('order', {
        $set: {
          status: OrderStatus.COMPLETE,
          paidPrice: orderInfo.amount.total,
          extra: {
            $set: {
              wechatPayOriginalData: orderInfo
            }
          }
        }
      }, { tradeNo });
      res.json({
        //   payUrl: prePayParams,
        tradeNo,
        status: OrderStatus.COMPLETE,
      });
    } else {
      res.json({
        //   payUrl: prePayParams,
        tradeNo,
        status: OrderStatus.PENDING,
      });
    }
  } catch (e) {
    res.json({
      succes: false,
      message: e
    })
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)