import { WXUserInfo } from '@/models/User';
import { LOGIN_QR_TIME, WX_API } from '@/utils/constants'
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

// 获取订阅号或服务号的Access Token
export async function getWXAccessToken(type: string = 'service') {
  const accessToken = cache.get('wx_access_token')
  if (accessToken) {
    console.log('get cached wx access_token', accessToken)
    return accessToken
  }
  // 服务号
  const appId = process.env[type === 'service' ? 'SERVICE_APP_ID' : 'SUB_APP_ID']
  const appSecret = process.env[type === 'service' ? 'SERVICE_APP_SECRET' : 'SUB_APP_SECRET']
  let url = `${WX_API}/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
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
      return result
    }
  } catch (error) {
    console.log('createQrCode failed', error)
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
    if (!res.ok) {
      throw new Error(`get user info failed, status: ${res.status}`)
    }
    const result: WXUserInfo = await res.json()
    if (!result?.errcode) {
      console.log('get user info success', result)
      return result
    }
  } catch (e) {
    console.log('get user info failed', e)
  }
}
