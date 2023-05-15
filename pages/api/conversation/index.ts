import dbConnect from "@/lib/dbConnect";
import { sessionOptions } from "@/lib/session";
import Conversation from "@/models/Conversation";
import { MAX_CONVERSATION_NAME_LEN } from "@/utils/constants";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!req.session.user || !req.session.user.isLoggedIn || !req.session.user._id) {
    res.status(400).json({ status: 'failed', message: '您无法做此操作，请先登录' })    
  }
  if (req.method === 'GET') {
    try {
      await dbConnect()
      const conversations = await Conversation.find({ userId: req.session.user?._id }).sort({ createAt: -1 })
      return res.status(200).json({ status: 'ok', message: '获取会话列表成功', data: conversations })
    } catch (e) {
      console.error('get conversations error', e)
      return res.status(400).json({ status: 'failed', message: '获取会话列表失败' })
    }
  } else if (req.method === 'PUT') {
    if (!req.body._id || !req.body.name) {
      return res.status(400).json({ status: 'failed', message: '请输入正确的名字' })
    }
    try {
      await dbConnect()
      const result = await Conversation.updateOne({ _id: req.body._id }, { $set: { name: req.body.name.slice(0, MAX_CONVERSATION_NAME_LEN) } })
      console.log('update conversation result', result)
      return res.status(200).json({ status: 'ok', message: '更新成功' })
    } catch (e) {
      console.error('update conversation error', e)
    }
  } else if (req.method === 'DELETE') {
    const { _id } = req.query
    if (!_id) {
      return res.status(400).json({ status: 'failed', message: '请输入正确的ID' })
    }
    try {
      await dbConnect()
      const result = await Conversation.deleteOne({ _id })
      console.log('delete conversation result', result)
      if (result.deletedCount === 1) {
        return res.status(200).json({ status: 'ok', message: '删除成功' })  
      } else {
        return res.status(400).json({ status: 'failed', message: '删除失败' })
      }
    } catch (e) {
      console.error('delete conversation error', e)
    }
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)
