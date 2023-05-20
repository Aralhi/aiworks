import { NextApiRequest, NextApiResponse } from "next"
import crypto from 'crypto'
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import cache from 'memory-cache'
import { SCENE_STR, WXtEventMessage, getQrCacheKey, getUserInfo } from "@/lib/weichat";
import { WXUserInfo } from "@/models/User";
import { LOGIN_QR_TIME } from "@/utils/constants";


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
      const message: WXtEventMessage = parser.parse(req.body).xml;
      console.log('weichat event message', message)
      // https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Receiving_event_pushes.html
      let { MsgType, Event, EventKey, FromUserName, Ticket } = message
      const resBody = {
        ToUserName: message.FromUserName,
        FromUserName: message.ToUserName,
        CreateTime: Math.floor(new Date().getTime() / 1000),
        MsgType: 'text',
        Content: ''
      }
      const builder = new XMLBuilder();
      res.setHeader('Content-Type', 'application/xml')
      if (MsgType === 'event') {
        switch (Event) {
          case 'subscribe':
            resBody.Content = '感谢您的关注，AI works团队为您倾情服务。'
            break
          case 'unsubscribe':
            // 取消关注不需要做什么
            resBody.Content = '江湖再见!'
            break
          // 关注后扫码
          case  'SCAN':
            resBody.Content = '登录成功'
            break
        }
        if(!!EventKey) {
          const userInfo: WXUserInfo | undefined = await getUserInfo(FromUserName)
          if (!userInfo) {
            return res.send(builder.build({ xml: resBody }))
          }
          // EventKey: 'wx_login'
          // 缓存扫码状态，供浏览器轮询扫码状态
          cache.put(getQrCacheKey(Ticket as string), `${userInfo.openid}_scan`, LOGIN_QR_TIME)
        }
      }
      const xml = builder.build({ xml: resBody })
      console.log('weichat event res', xml)
      res.send(xml)
    }
  } catch (e) {
    console.error('weichat event error', e)
  } 
}