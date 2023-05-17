import { NextApiRequest, NextApiResponse } from "next"
import crypto from 'crypto'
import { XMLParser } from 'fast-xml-parser';


if (!process.env.WX_PUBLIC_TOKEN) {
  throw new Error("Missing WX_PUBLIC_TOKEN");
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    console.log('weichat event', req.method)
    console.log('weichat event req.query', req.query)
    const parser = new XMLParser();
    let jObj = parser.parse(req.body);
    console.log('weichat event req.body', typeof jObj, jObj)
    if (req.method === 'POST') {
      // 验证微信消息
      const { signature, nonce, timestamp, echostr } = req.query || {}
      const str = [process.env.WX_PUBLIC_TOKEN, timestamp, nonce].sort().join('')
      const hash = crypto.createHash('sha1').update(str).digest('hex');
      console.log('weichat event hash', hash, signature)
      if (hash === signature) {
        return res.status(200).send(echostr)
      } else {
        return res.status(403).json({ status: 'failed', message: 'forbidden' })
      }
    }
  } catch (e) {
    console.error('weichat event error', e)
  } 
}