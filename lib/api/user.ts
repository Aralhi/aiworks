import { IUser } from '@/models/User';
import { AVATARS } from '@/utils/constants';
import cryptoRandomString from 'crypto-random-string';

const dbName = process.env.NODE_ENV === 'development' ? 'test' : 'aiworks'

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