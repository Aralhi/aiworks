import { NextApiRequest, NextApiResponse } from "next"
import crypto from 'crypto'
import { XMLParser } from 'fast-xml-parser';
import { WXtMessage, getUserInfo } from "@/lib/weichat";


if (!process.env.WX_PUBLIC_TOKEN) {
  throw new Error("Missing WX_PUBLIC_TOKEN");
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    console.log('weichat event req.query', req.url)
    console.log('weichat event req.body', typeof req.body, req.body)
    // 验证微信消息
    if (req.method === 'GET') {
      const { signature, nonce, timestamp, echostr } = req.query || {}
      const str = [process.env.WX_PUBLIC_TOKEN, timestamp, nonce].sort().join('')
      const hash = crypto.createHash('sha1').update(str).digest('hex');
      if (hash === signature) {
        return res.status(200).send(echostr)
      } else {
        return res.status(403).json({ status: 'failed', message: 'forbidden' })
      }
    } else if (req.method === 'POST') {
      const parser = new XMLParser();
      const message: WXtMessage = parser.parse(req.body.xml);
      console.log('weichat event message', message)
      let { MsgType, Event, EventKey, FromUserName } = message
      if (MsgType === 'event') {
        switch (Event) {
          case 'subscribe':
            // TODO 记录数据库
            res.send('感觉您的关注，AI works团队为您倾情服务。')
            break
          case 'unsubscribe':
            // TODO 记录数据库
            res.send('江湖再见!')
            break
          // 关注后扫码
          case  'SCAN':
            res.send('扫码成功')
            break
        }
        if(!!EventKey) {
          const userInfo = await getUserInfo(FromUserName)
          if (EventKey.slice(0, 8) === 'qrscene_') {
            // 扫码并关注
            // 关注就创建帐号的话可以在这里把用户信息写入数据库完成用户注册
            EventKey = EventKey.slice(8)
            console.log(userInfo + '扫码并关注了公众号')
          } else {
            // 已关注
            console.log(userInfo + '扫码进入了公众号')
          }
        }
      }
    }
  } catch (e) {
    console.error('weichat event error', e)
  } 
}