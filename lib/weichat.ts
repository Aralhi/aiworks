import cache from 'memory-cache'

const WX_API = 'https://api.weixin.qq.com'

export async function getWXAccessToken() {
  const accessToken = cache.get('wx_access_token')
  if (accessToken) {
    console.log('get cached wx access_token', accessToken)
    return accessToken
  }
  const appId = process.env.SUB_APP_ID
  const appSecret = process.env.SUB_APP_SECRET
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
  const result = await res.json()
  cache.put('wx_access_token', result.access_token, result.expires_in * 1000)
  console.log('fetch wx access_token success and cached', result)
  return result.access_token
}

export async function createQrCode() {
  const accessToken = await getWXAccessToken()
  const url = `${WX_API}/cgi-bin/qrcode/create?access_token=${accessToken}`
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      expire_seconds: 10 * 60,
      action_name: "QR_SCENE",
      action_info: { scene: { scene_id: 'login' } },
    }),
  });
  if (!res.ok) {
    throw new Error(`createQrCode failed, status: ${res.status}`)
  }
  const result = await res.json()
  console.log('createQrCode success', result)
}