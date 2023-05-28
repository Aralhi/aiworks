import dbConnect from "@/lib/dbConnect";
import { sessionOptions } from "@/lib/session";
import User from "@/models/User";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userCode } = req.session.user || {};
  try {
    await dbConnect()
    // 查询数据库里该用户邀请的人员列表
    const data = await User.find({ inviteCode: userCode })
    return res.json({ status: 'ok', data });
  } catch (e) {
    console.error('invite error:', e)
    res.status(500).json({ status: 'failed', message: "获取邀请列表失败" });
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)