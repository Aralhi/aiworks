import { USERNAME_LENGTH } from '@/utils/constants'
import { Schema, model, models } from 'mongoose'

export interface IUser {
  name: string;
  userCode: string;
  registerType: string; // 注册类型，通过微信还是手机号注册
  phone?: string;
  createAt?: string;
  avatarUrl?: string;
  pricings?: Array<UserPricing>;
}

// https://developers.weixin.qq.com/doc/offiaccount/User_Management/Get_users_basic_information_UnionID.html#UinonId
export type WXUserInfo = {
  subscribe: number; // 0未关注，1关注 
  openid: string;
  nickname: string;
  sex: number; // 0男性
  subscribe_time: number;
  subscribe_scene: string; // 返回用户关注的渠道来源，ADD_SCENE_SEARCH 公众号搜索，ADD_SCENE_ACCOUNT_MIGRATION 公众号迁移，ADD_SCENE_PROFILE_CARD 名片分享，ADD_SCENE_QR_CODE 扫描二维码，ADD_SCENE_PROFILE_LINK 图文页内名称点击，ADD_SCENE_PROFILE_ITEM 图文页右上角菜单，ADD_SCENE_PAID 支付后关注，ADD_SCENE_WECHAT_ADVERTISEMENT 微信广告，ADD_SCENE_REPRINT 他人转载 ,ADD_SCENE_LIVESTREAM 视频号直播，ADD_SCENE_CHANNELS 视频号 , ADD_SCENE_OTHERS 其他
  qr_scene: number; // 二维码扫码场景
  qr_scene_str: string; // 二维码扫码场景描述
  language?: 'zh_CN',
  city?: string;
  province?: string;
  country?: string;
  headimgurl?: string;
  remark?: string
  groupid?: 0,
  tagid_list?: any,
  errcode?: number,
}

// 用户的套餐信息
export type UserPricing = {
  type: string; // 套餐类型，chatGPT、midjourney
  name: string; // 套餐名
  queryCount: number; // 查询次数
  status: string; // 套餐状态，active、expired
  startAt: number; // 开始时间戳，ms
  endAt: number; // 结束时间戳，ms
}

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
    maxlength: [USERNAME_LENGTH, `Name cannot be more than ${USERNAME_LENGTH} characters`],
  },
  userCode: {
    type: String,
    required: [true, 'Please provide a user code.']
  },
  registerType: {
    type: String,
  },
  openid: {
    type: String,
    unique: true,
    sparse: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true
  },
  pricings: {
    type: Array<UserPricing>,
  },
  avatarUrl: {
    type: String,
  },
  inviteCode: {
    type: String
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  }
})

export default models.User ||  model('User', UserSchema, 'user')
