import dbConnect from "@/lib/dbConnect";
import { sessionOptions } from "@/lib/session";
import Conversation from "@/models/Conversation";
import { MAX_CONVERSATION_NAME_LEN } from "@/utils/constants";
import { withIronSessionApiRoute } from "iron-session/next/dist";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PUT') {
    if (!req.body._id || !req.body.name) {
      return res.status(400).json({ status: 'failed', message: '请输入正确的名字' })
    }
    try {
      await dbConnect()
      const result = await Conversation.updateOne({ _id: req.body._id }, { $set: { name: req.body.name.slice(0, MAX_CONVERSATION_NAME_LEN) } })
      console.log('update conversation result', result)
      return res.status(200).json({ status: 'success', message: '更新成功' })
    } catch (e) {
      console.error('update conversation error', e)
    }
  } else if (req.method === 'DELETE') {
    if (!req.body._id) {
      return res.status(400).json({ status: 'failed', message: '请输入正确的ID' })
    }
    try {
      await dbConnect()
      const result = await Conversation.deleteOne({ _id: req.body._id })
      console.log('delete conversation result', result)
      return res.status(200).json({ status: 'success', message: '删除成功' })
    } catch (e) {
      console.error('delete conversation error', e)
    }
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)
