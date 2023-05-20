import Settings from '@/models/Settings';
import { WXUserInfo } from '@/models/User';
import { ACCESS_TOKEN_NAME, LOGIN_QR_TIME, MP_WX_API, WX_API } from '@/utils/constants'
import dbConnect from './dbConnect';
import cache from 'memory-cache'

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
}

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
      console.log('createQrCode success', result)
      cache.put(`${result.ticket}_${SCENE_STR}`, 'generated', result.expire_seconds)
      return result
    } else {
      console.error('createQrCode failed', result)
    }
  } catch (error) {
    console.error('createQrCode failed', error)
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
