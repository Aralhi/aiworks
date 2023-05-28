import { NextApiRequest, NextApiResponse } from "next";
import { getPayUrl } from '@/lib/wechatPay';
import { sessionOptions } from "@/lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import Order, { OrderStatus } from "@/models/Order";
import { PRICING_PLAN } from "@/utils/constants";
import { queryUserVoucher } from "@/lib/api/user";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const planId = req.query.planId as string;
    const { _id: userId, userCode } = req.session.user || {};
    if (!userId) {
      throw 'not login';
    }
    const tradeNo = `wechat-${new Date().getTime()}-${Math.round(Math.random()*1000)}`;
    const pricing = PRICING_PLAN.filter(i => i.id == planId)[0];
    // 后台计算优惠价格
    const [voucherPrice] = await queryUserVoucher(userCode, pricing.price)
    const orderPrice = process.env.NODE_ENV === 'development' ? 0.01 : pricing.price - (voucherPrice || 0)
    const prePayParams = await getPayUrl(
      tradeNo,
      pricing.name,
      orderPrice,
    );
    console.log('prePayParams', prePayParams);
    await new Order({
      userId,
      tradeNo,
      paidPrice: 0,
      status: OrderStatus.PENDING,
      pricing: Object.assign({}, pricing, {
        orderPrice,
        startAt: new Date(),
        endAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * pricing.days),
      }),
      createAt: new Date(),
      extra: {
        prePayParams,
      },
    }).save();
    res.json({
      payUrl: prePayParams,
      tradeNo,
      orderPrice
    });
  } catch (e) {
    res.json({
      succes: false,
      message: e
    })
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)