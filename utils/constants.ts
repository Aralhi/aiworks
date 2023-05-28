export const PRICING_PLAN = [
  {
    id: '1',
    type: 'chatGPT',
    name: '尝鲜版',
    queryCount: 300,
    price: 10,
    days: 7,
    label: '周'
  },
  {
    id: '2',
    type: 'chatGPT',
    name: '尊享版',
    queryCount: 2000,
    price: 39,
    days: 30,
    label: '月'
  },
  {
    id: '3',
    type: 'chatGPT',
    name: '荣耀季卡',
    queryCount: 9999,
    price: 99,
    days: 90,
    label: '季度'
  }
]

export interface PricingPlan {
  id: string
  type: string
  name: string
  queryCount: number
  price: number
  days: number
  label: string
}

export const USERNAME_LENGTH = 12
export const API_TIMEOUT = 10000
export const USER_CACHE_TIME = 60 * 60 * 1000 // 1小时
export const LOGIN_QR_TIME = 2 * 60 * 1000 // 2分钟
export const AVATARS = [
  '/default_avatar.jpg',
  '/male_avatar.jpg',
  '/female_avatar.jpg'
]
export const MAX_CONVERSATION_NAME_LEN = 20
export const MAX_CONVERSATION_COUNT = 20
export const MAX_COMPLETION_QUERY_COUNT = 10

export const MAX_TOKEN = 2000

export const TIME_ZONE = 'Asia/Shanghai'
export const FINGERPRINT_KEY = 'x-fingerprint'

export const UNLOGIN_MAX_QUERY_COUNT = 3
export const LOGIN_MAX_QUERY_COUNT = 10

export const WX_API = 'https://api.weixin.qq.com'
export const MP_WX_API = 'https://mp.weixin.qq.com'
export const ACCESS_TOKEN_NAME = 'wechat.service.access_token'
export const LOGIN_QR_STATUS = {
  generated: 'generated',
  scan: 'scan'
}
export const WX_EVENT_TYPE = {
  login_qr: 'login_qr',
  pay_notify: 'pay_notify'
}
export const PRICING_VOUCHER_UNIT = 0.5