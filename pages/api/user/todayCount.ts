import { queryInviteUserCount } from "@/lib/api/user";
import dbConnect from "@/lib/dbConnect";
import { sessionOptions } from "@/lib/session";
import Completion from "@/models/Completion";
import { getTodayTime } from "@/utils/index";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect()
    const [todayStartUTC, todayEndUTC] = getTodayTime()
    const result = await Completion.aggregate([
      {
        $match: {
          $or: [
            {userId: req.session.user?._id},
            {fingerprint: req.session.user?.fingerprint}
          ],
          createAt: {
            $gte: new Date(todayStartUTC),
            $lte: new Date(todayEndUTC)
          }
        }
      },
      {
        $count: 'count',
      },
    ])
    const todayQueryCount = result[0]?.count || 0
    return res.status(200).json({ status: 'ok', data: todayQueryCount });
  } catch (error) {
    console.log('error', error)
    return res.status(500).json({ status: 'failed', message: '服务器错误' })
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)