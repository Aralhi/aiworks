import { NextApiRequest, NextApiResponse } from "next"
import crypto from 'crypto'

if (!process.env.WX_PUBLIC_TOKEN) {
  throw new Error("Missing WX_PUBLIC_TOKEN");
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('weichat event', process.env.WX_PUBLIC_TOKEN, req.method, req.query, req.body)
  if (req.method === 'GET') {
    // 验证微信消息
    const { signature, nonce, timestamp, echostr } = req.query || {}
    const str = [process.env.WX_PUBLIC_TOKEN, timestamp, nonce].sort().join('')
    const hash = crypto.createHash('sha1').update(str).digest('hex');
    if (hash === signature) {
      return res.status(200).send(echostr)
    } else {
      return res.status(403).json({ status: 'failed', message: 'forbidden' })
    }
  }
}