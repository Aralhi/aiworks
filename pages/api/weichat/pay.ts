import { NextApiRequest, NextApiResponse } from "next";
import { getPayUrl } from '@/lib/wechatPay';
import { sessionOptions } from "@/lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { OrderStatus } from "@/models/Order";
import { insertOne } from "@/lib/db";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.info('paying...');
  try {
    const plan = req.query.planId;
    const { _id: userId } = req.session.user || {};
    if (!userId) {
      throw 'not login';
    }
    const tradeNo = `wechat-${new Date().getTime()}-${Math.round(Math.random()*1000)}`;
    const pricing = { name: 'test', price: 0.01 * 100, startAt: 0, endAt: 100, queryCount: 10 };
    const prePayParams = await getPayUrl(
      userId,
      tradeNo,
      pricing,
    );
    insertOne('order', {
      userId,
      tradeNo,
      paidPrice: 0,
      status: OrderStatus.PENDING,
      pricing,
      createAt: new Date(),
      extra: {
        prePayParams,
      },
    });
    res.json({
      payUrl: prePayParams,
      tradeNo,
    });
  } catch (e) {
    res.json({
      succes: false,
      message: e
    })
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)