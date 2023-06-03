import Settings from '@/models/Settings';
import { WXUserInfo } from '@/models/User';
import { ACCESS_TOKEN_NAME, FINGERPRINT_KEY, LOGIN_QR_STATUS, LOGIN_QR_TIME, MP_WX_API, WX_API, WX_EVENT_TYPE } from '@/utils/constants'
import dbConnect from './dbConnect';
import cache from 'memory-cache'
import WxEvent from '@/models/WxEvent';
import redis from './redis';
import { getUserInfoByOpenid } from './api/user';
import { UserSession } from 'pages/api/user/user';
import { checkQueryCount, getPayload } from './completion';

export type AccessTokenResponse = {
  access_token: string;
  expires_in: number;
}

export type CreateQrResponse = {
  ticket: string;
  expire_seconds: number;
  url: string;
  errcode?: number;
}

export type WXtEventMessage = {
  MsgType: string;
  Event: string;
  FromUserName: string;
  ToUserName: string;
  EventKey: string;
  Ticket?: string;
  Content?: string;
}

const CHAT_CACHE_TIME = 60 * 5

export const SCENE_STR = 'wx_login'
export function getQrCacheKey(ticket: string) {
  return `${ticket}_${SCENE_STR}`
}

// 获取订阅号或服务号的Access Token
export async function getWXAccessToken(type: string = 'service') {
  // 本地还是调WX接口获取，线上从DB读取
  if (process.env.NODE_ENV === 'development') {
    const accessToken = cache.get('wx_access_token')
    if (accessToken) {
      console.log('get cached wx access_token', accessToken)
      return accessToken
    }
    // 服务号
    const appId = process.env[type === 'service' ? 'SERVICE_APP_ID' : 'SUB_APP_ID']
    const appSecret = process.env[type === 'service' ? 'SERVICE_APP_SECRET' : 'SUB_APP_SECRET']
    let url = `${WX_API}/cgi-bin/stable_token`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'client_credential',
        appid: appId,
        secret: appSecret
      })
    })
    if (!res.ok) { 
      throw new Error(`getWXAccessToken failed, status: ${res.status}`)
    }
    const result: AccessTokenResponse = await res.json()
    if (result.access_token) {
      cache.put('wx_access_token', result.access_token, result.expires_in * 1000)
      console.log('fetch wx access_token success and cached', result)
      return result.access_token
    } else {
      console.log('getWXAccessToken failed', result)
      return
    }
  } else {
    // read from db
    try {
      await dbConnect()
      const setting = await Settings.findOne({ key: ACCESS_TOKEN_NAME })
      console.log('getWXAccessToken from db success', setting)
      return setting?.value
    } catch (e) {
      console.error('getWXAccessToken from db failed', e)
    }
  }
}

// 根据Access Token创建二维码
export async function createQrCode() {
  const accessToken = await getWXAccessToken()
  if(!accessToken) {
    return
  }
  const url = `${WX_API}/cgi-bin/qrcode/create?access_token=${accessToken}`
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expire_seconds: LOGIN_QR_TIME, // 2 minutes
        action_name: "QR_STR_SCENE",
        action_info: { scene: { scene_str: SCENE_STR } },
      }),
    });
    if (!res.ok) {
      throw new Error(`createQrCode failed, status: ${res.status}`)
    }
    const result: CreateQrResponse = await res.json()
    if (!result.errcode) {
      const cacheKey = getQrCacheKey(result?.ticket)
      await dbConnect()
      const newDoc = await new WxEvent({
        type: WX_EVENT_TYPE.login_qr,
        key: cacheKey,
        value: LOGIN_QR_STATUS.generated,
        expireAt: +Date.now() + result.expire_seconds
      }).save()
      console.log('createQrCode and insert db success', result, newDoc)
      return result
    } else {
      console.error('createQrCode failed', result)
    }
  } catch (error) {
    console.error('createQrCode exception', error)
  }
}

export async function getUserInfo(openid: string) {
  const token = await getWXAccessToken()
  const url = `${WX_API}/cgi-bin/user/info?access_token=${token}&openid=${openid}&lang=zh_CN`
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      }
    })
    const result: WXUserInfo = await res.json()
    if (!result?.errcode) {
      console.log('get user info success', result)
      return result
    }
  } catch (e) {
    console.error('get user info failed', e)
  }
}

export async function handleWechatTextMsg(message: WXtEventMessage) {
  const { Content, FromUserName } = message
  if (!Content) {
    return
  }
  const chatCacheKey = getEventCacheKey(FromUserName, 'chat')
  const mjCacheKey = getEventCacheKey(FromUserName, 'mj')
  const chatCache = await redis.get(chatCacheKey)
  if (Content === '/chat') {
    // chatGPT聊天模式开始或结束
    if (chatCache) {
      // 结束聊天模式
      redis.del(chatCacheKey)
    } else {
      // 开始聊天模式
      redis.set(chatCacheKey, 'start', 'EX', CHAT_CACHE_TIME)
      return '请输入您的问题'
    }
  } else if (Content?.startsWith('/mj')) {
    // 作图
    const prompts = Content.replace('/mj ', '').trim()
  } else if (chatCache) {
    if (Content === '继续') {
      return chatCache
    }
    // 聊天模式
    const user = await getUserInfoByOpenid(FromUserName)
    // 查询次数
    const { status, message } = await checkQueryCount(user as UserSession, '')
    if (status !== 'ok') {
      return message
    }
    const { payload, plaintext, token } = await getPayload({
      conversationId: chatCacheKey,
      prompt: Content,
      isStream: false,
      userId: user?._id,
      fingerprint: ''
    })
    // 调用接口
    const response = await fetch('https://api.aiworks.club/api/generate', {
      method: "POST",
      headers: {
        "Authorization": `${token}`,
        "x-salai-plaintext": plaintext,
        "Content-Type": "application/json",
        [FINGERPRINT_KEY]: ''
      },
      body: JSON.stringify({
        payload
      }),
    })
    const completion = await response.json()
    console.log('weichat chatGPT response success', completion)
    // 写到缓存，避免微信5s超时无法响应。回复“继续”直接从缓存读取
    redis.set(chatCacheKey, completion, 'EX', CHAT_CACHE_TIME)
    return completion
  }
}

function getEventCacheKey(openid: string, label: string) {
  return `wx_user_${openid}_${label}`
}
