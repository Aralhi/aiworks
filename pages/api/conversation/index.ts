import { deleteOne, find, findOneAndUpdate } from "@/lib/db";
import { sessionOptions } from "@/lib/session";
import { MAX_CONVERSATION_NAME_LEN } from "@/utils/constants";
import { withIronSessionApiRoute } from "iron-session/next";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!req.session.user || !req.session.user.isLoggedIn || !req.session.user._id) {
    return res.status(200).json({ status: 'failed' })    
  }
  if (req.method === 'GET') {
    try {
      const conversations = await find('conversation', { userId: req.session.user?._id })
      return res.status(200).json({ status: 'ok', message: '获取会话列表成功', data: conversations })
    } catch (e) {
      return res.status(500).json({ status: 'failed', message: '获取会话列表失败' })
    }
  } else if (req.method === 'PUT') {
    if (!req.body._id || !req.body.name) {
      return res.status(400).json({ status: 'failed', message: '请输入正确的名字' })
    }
    try {
      console.log('....update', req.body )
      const result = await findOneAndUpdate('conversation', { _id: new ObjectId(req.body._id) }, { $set: { name: req.body.name.slice(0, MAX_CONVERSATION_NAME_LEN) } })
      if (result?.ok) {
        return res.status(200).json({ status: 'ok', message: '更新成功' })
      } else {
        return res.status(500).json({ status: 'failed', message: '更新失败' })
      }
    } catch (e) {
      console.error('update conversation error', e)
    }
  } else if (req.method === 'DELETE') {
    const { _id } = req.query
    if (!_id) {
      return res.status(400).json({ status: 'failed', message: '请输入正确的ID' })
    }
    try {
      const result = await deleteOne('conversation', { _id })
      if (result?.acknowledged) {
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
