import User, { IUser } from '@/models/User';
import { AVATARS, PRICING_VOUCHER_UNIT } from '@/utils/constants';
import cryptoRandomString from 'crypto-random-string';
import dbConnect from '../dbConnect';

export function generateUserCode() {
  return cryptoRandomString({length: 10, type: 'alphanumeric'})
}

export function generateUserInfo(iswx: boolean = false) {
  const userCode = generateUserCode()
  return {
    name: `${iswx ? '微信' : ''}用户` + userCode,
    userCode,
    avatarUrl: AVATARS[0] // 默认头像
  } as IUser
}

export function getUpdateBody(name:string, avatarUrl: string) {
  const body: any = {}
  if (name) {
    body['name'] = name
  }
  if (avatarUrl) {
    body['avatarUrl'] = avatarUrl
  }
  return body
}

export async function queryUserVoucher(userCode: string | undefined, price?: number) {
  if (!userCode) {
    return [price]
  }
  // 查询用户优惠金额，邀请并付费的人数
  try {
    await dbConnect()
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    const count = await User.countDocuments({
      inviteCode: userCode,
      'pricings.startAt': { $gte: startDate },
      'pricings.endAt': { $gte: new Date() }
    })
    if (!price) {
      return [PRICING_VOUCHER_UNIT * count, count];
    } else {
      // 计算优惠后价格
      if (count > 0) {
        const discount = PRICING_VOUCHER_UNIT * count;
        price = Math.max(0.01, price - discount);
      }
      return [price, count]
    }
  } catch (error) {
    console.error('queryUserVoucher error', error)
    return [price, 0]
  }
}