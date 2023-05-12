import cache from 'memory-cache'

export function checkCode(phone: string, code: string) {
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  return cache.get(getCodeKey(phone)) === code
}

export function getCodeKey(phone: string) {
  return `sms_code_${phone}`
}