import { queryUserVoucher } from "@/lib/api/user";
import { sessionOptions } from "@/lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userCode } = req.session?.user || {};
  // 查询用户优惠金额，邀请并付费的人数
  const count = await queryUserVoucher(userCode)
  res.json({ status: 'ok', data: {
    inviteCount: count
  } });
}

export default withIronSessionApiRoute(handler, sessionOptions)