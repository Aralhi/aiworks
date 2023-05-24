import { queryCompletion } from "@/lib/completion";
import { sessionOptions } from "@/lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // 查询会话下的问答列表
  if (!req.session.user || !req.session.user.isLoggedIn || !req.session.user._id) {
    return res.status(400).json({ status: 'failed', message: '您无法做此操作，请先登录' })    
  }
  if (req.method === 'GET') {
    try {
      const result = await queryCompletion({
        conversationId: req.query.conversationId,
        userId: req.session.user?._id
      })
      return res.status(200).json({ status: 'ok', message: '获取问答列表成功', data: result.reverse() })
    } catch (e) {
      console.error('get conversation error', e)
      return res.status(200).json({ status: 'failed', message: '获取问答列表失败' })
    }
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)
