import CryptoJS from 'crypto-js';

if (!process.env.API_SECRETKEY) {
  throw new Error('API_SECRETKEY is not set');
}

// 加密函数
export function encrypt(plaintext: string): string {
  const ciphertext = CryptoJS.AES.encrypt(plaintext, process.env.API_SECRETKEY || '').toString();
  return ciphertext;
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.API_SECRETKEY || '');
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
}