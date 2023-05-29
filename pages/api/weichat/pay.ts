import { NextApiRequest, NextApiResponse } from "next";
import { getNativePayUrl, getH5PayUrl, getJSAPIPayInfo } from '@/lib/wechatPay';
import { sessionOptions } from "@/lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import Order, { OrderStatus } from "@/models/Order";
import { PRICING_PLAN, PRICING_VOUCHER_UNIT } from "@/utils/constants";
import { queryUserVoucher } from "@/lib/api/user";
import { calOrderPrice } from "@/utils/index";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const planId = req.query.planId as string;
    const type = req.query.type as string;
    const { _id: userId, userCode, openid } = req.session.user || {};
    if (!userId) {
      throw 'not login';
    }
    const tradeNo = `wechat-${new Date().getTime()}-${Math.round(Math.random()*1000)}`;
    const pricing = PRICING_PLAN.filter(i => i.id == planId)[0];
    // 后台计算优惠价格
    const count = await queryUserVoucher(userCode)
    console.log('....pricing', pricing, count， req.session.user)
    const orderPrice = process.env.NODE_ENV === 'development' ? 0.01 : calOrderPrice(pricing.price, count)
    console.log('....planId', planId, pricing, count, orderPrice)
    let prePayParams;
    if (type === 'h5') {
      prePayParams = await getH5PayUrl(
        tradeNo,
        pricing.name,
        pricing.price,
      );
    } else if (type === 'jsapi') {
      prePayParams = await getJSAPIPayInfo(
        tradeNo,
        pricing.name,
        pricing.price,
        openid || 'osQSQ54tnHExzI5fPwvhINFqQv1c',
        );
    } else {
      prePayParams = await getNativePayUrl(
        tradeNo,
        pricing.name,
        pricing.price,
      );
      console.log('prePayParams', prePayParams);
      if (!prePayParams.code_url) {
        return res.status(500).json({
          success: false,
          message: prePayParams.message,
        });
      }
    }
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
      payUrl: prePayParams.code_url,
      prePayParams,
      tradeNo,
      orderPrice
    });
  } catch (e) {
    console.error(e);
    res.json({
      succes: false,
      message: e
    })
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)
