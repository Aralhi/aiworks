import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { TIME_ZONE } from './constants';

export function isPC() {
  const userAgentInfo = navigator.userAgent;
  const Agents = [
    "Android",
    "iPhone",
    "SymbianOS",
    "Windows Phone",
    "iPad",
    "iPod",
  ];
  let flag = true;
  for (let i = 0; i < Agents.length; i++) {
    if (userAgentInfo.indexOf(Agents[i]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}

export async function getFingerprint() {
  const fingerprint = localStorage.getItem('aiworks_fingerprint')
  if (fingerprint) {
    return fingerprint
  }
  const fp = await FingerprintJS.load()
  const result = await fp.get()
  localStorage.setItem('aiworks_fingerprint', result.visitorId)
  return result.visitorId
}

export function getTodayTime() {
  const todayStart = new Date().setHours(0, 0, 0, 0); // 获取今天的开始时间戳
  const todayEnd = new Date().setHours(23, 59, 59, 999); // 获取今天的结束时间戳
  const todayStartUTC = new Date(todayStart).toISOString(); // 转换为 UTC 时间开始时间
  const todayEndUTC = new Date(todayEnd).toISOString(); // 转换为 UTC 时间结束时间
  return [todayStartUTC, todayEndUTC]
}