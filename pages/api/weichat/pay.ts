import { NextApiRequest, NextApiResponse } from "next";
import { prePay } from '@/lib/wechatPay';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.info('paying...');
  try {
    const prePayParams = await prePay(
      // TODO: change to current user openid
      'osQSQ5-V5Qjpn3srLdH-XqcZ7mDk',
      { name: 'test', price: 0.01 * 100, startAt: 0, endAt: 100, queryCount: 10 }
    );
    res.json(prePayParams);
  } catch (e) {
    res.json({
      succes: false,
      message: e
    })
  }
}