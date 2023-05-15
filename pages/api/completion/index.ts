import dbConnect from "@/lib/dbConnect";
import { sessionOptions } from "@/lib/session";
import Completion from "@/models/Completion";
import { MAX_COMPLETION_QUERY_COUNT } from "@/utils/constants";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // 查询会话下的问答列表
  if (!req.session.user || !req.session.user.isLoggedIn || !req.session.user._id) {
    res.status(400).json({ status: 'failed', message: '您无法做此操作，请先登录' })    
  }
  if (req.method === 'GET') {
    try {
      await dbConnect()
      const result = await Completion.find({
        conversationId: req.query.conversationId,
        userId: req.session.user?._id
      }).sort({ created: 1 }).limit(MAX_COMPLETION_QUERY_COUNT)
      return res.status(200).json({ status: 'ok', message: '获取问答列表成功', data: result })
    } catch (e) {
      console.error('get conversation error', e)
    }
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)
