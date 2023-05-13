import FingerprintJS from '@fingerprintjs/fingerprintjs'

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
