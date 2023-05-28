import { KJUR, hextob64 } from 'jsrsasign';
import dayjs from 'dayjs';
import { URL } from 'url';
import {  NativePrePayRequestParams } from './wechatPay.types';
import { PricingPlan } from '@/utils/constants';
const SIGN_ALG = 'SHA256withRSA'
const SCHEMA = 'WECHATPAY2-SHA256-RSA2048';
const APP_ID = process.env.SERVICE_APP_ID;
const WEXIN_PAY_MERCHANTID = process.env.WEXIN_PAY_MERCHANTID;
const WEXIN_PAY_CERT_SERIAL_NO = process.env.WEXIN_PAY_CERT_SERIAL_NO;
const H5_PRE_PAY_API_URL = 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi';
const NATIVE_PRE_PAY_API_URL = 'https://api.mch.weixin.qq.com/v3/pay/transactions/native';
const QUERY_TRANSACATIONS_BY_TRADE_NO_URL = 'https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/';
const PRIVATE_KEY = process.env.WECHAT_PAY_PEM_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC1cqD8tUc6j8wA
Eon5pHp/JlNnjIGvzheUxMejuzl9WYB5dkgQDk1j7S/DMkS3HthMR3VSK122kpoW
mpm2yZG7FB9NUTfXncO9ReHAhKxbeaD0YQGPOacxasXkZC1atZjxSuhmJ1snOtHJ
5PzIXQQwYa9fKcXwZCrsj7Jponl5ekMaMNAWbCD0X+BkmV8zPnjnM+RD7AUtcLeB
DMr6BPTGdRNmN/kzQzmzQv7MXflSK7uJMPAxGNUyBtoRfPzMbYNCUkwR7+KVRvWs
IhBzp6GNnTfsQ742CZA6ddE0oGi/v4aRdgExmbe1S4nyp0gyjFQ6g7LzrE2c4vvV
uXRe805/AgMBAAECggEAcIJEeo35PcG+T+ku7sHjRwY/vzxridRz4MZnuAm2qxgd
RrNmGbaUnDqNXC7GVvnkSuAgSjQjprqemxd/6sxv9Z2Tj0CmLKdhoPI8+kAKE6qG
eCHScrngBw9a57SKPu3NiQjWs8kBh4C8ZsD7UU4D8/AOayae2uFxkD/F9CRPyFdR
DfGTHpxZXK7ZA3MR5po3wWM56silAwbELPVKz2g6U2LHC/uk8N0zusoo2WvwkfLr
qgDh8aN72ZBFApHBqXb31lp1ZUpmcVURHleawzFHQxD7l+DQnUEjtM49FdTR7/jC
EAkbtIQyJrWRYTed5odnphL5VGYacZby6WpINqjskQKBgQDYbdqoCt7roiWhYMat
rjjGuSNgWuCR2Xmjy1EzfaDTUGDwg/UMiVMHQgoOZuqLDsby2VLCwiwVtSJ7Q6tf
0FmIaeL8yqbvhIQDcMjkT5NIREKF/oncZ9gTDwOImsX8V4/eEddax6jAMqK2A95Y
BdnWbdiw8IwfRpUJofBsdNW9OQKBgQDWn3GFln6MklAVLuZSLq82N6V89jOC7ZWM
56LI+mJrO5+QdkFhq7uXSzrRkXyqhTdHCkPKpqybn515+B3GXamR8o7FmCLlEbwY
exvuvtzAUmfGeqJ8/cOEBivsVeFaxOm85FGpz80nv2PgmLGL9vchrr2YfYG+vx9R
q+53R9QhdwKBgQDVaSV2FBoSgbXXdmUSt7u2gLKYfaP5TVe7om10d4lRNW4RXB0T
eonLm1vtLaBS9IRKzO7lqq/ry8uvfl+LQBg5AihYGsAXaDUAa4M8Vhcl6GEsXXy1
QBR5XpGebveRRwpO8IrJMh19P7DgB9qEM2jFH1XPy7Jv2Jp3gB5h46crSQKBgQC+
lQ9lpOHzSem7Jc54o+QKrRdTA/1yAi+O1BKFjXHf7y4eRiSA6tLF4pP0jNC7S1hu
yPqx9ZfJCc/5Aw7Nm1Z8t3t4k0RJTZpN0uRW+T1lusdURIoNm/oGPsS6NPjMdZdp
mQW7WT/AUAAM7QqcU03YpybNRoX0MBtLlvVHDo2cuQKBgQDN0HDoOKJcSKoQVNKl
v1yvFQbs/cUQaM5XlmcCLRwf2G44N9+5jKjqANbD9O7GYrdyp1lITWj72k26do5q
5AHummJR89HXu+Ygc3dRAYpcX5w11xzI6SpTnJEEFDf7cUfvOEsQyJp6SebNdPFL
lwOEQ/5zABkyRhfQN6xaZpr1SQ==
-----END PRIVATE KEY-----`;
class SignBuilder {
  params: string[];
  signature: jsrsasign.KJUR.crypto.Signature;
  constructor(params: string[]) {
    this.params = params;
    this.signature = new KJUR.crypto.Signature({
      alg: SIGN_ALG,
    })
    this.signature.init(PRIVATE_KEY);
  }

  _getSignString() {
    return this.params.join('\n') + '\n';
  }

  build() {
    const signStr = this._getSignString();
    console.info('signString\n' + signStr);
    const res = this.signature.signString(signStr);
    return hextob64(res);
  }

}

function getAuthToken(url: URL, method: string, body?: string) {
  const nonceStr = `${Math.round(Math.random() * 1000)}`;
  const timestamp = Math.round(new Date().getTime()/1000);
  const sign = new SignBuilder([
    method,
    `${url.pathname}${url.search}`,
    `${timestamp}`,
    nonceStr,
    body || '',
  ]).build();
  const authToken = `mchid="${WEXIN_PAY_MERCHANTID}",serial_no="${WEXIN_PAY_CERT_SERIAL_NO}",nonce_str="${nonceStr}",timestamp="${timestamp}",signature="${sign}"`;
  return authToken;
}

function getPaySign(appid: string, body: string) {
  const nonceStr = `${Math.round(Math.random() * 1000)}`;
  const timestamp = Math.round(new Date().getTime()/1000);
  const paySign = new SignBuilder([
    appid,
    nonceStr,
    `${timestamp}`,
    body,
  ]).build();
  return {
    appid,
    timestamp,
    nonceStr,
    package: body,
    paySign,
    signType: 'RSA',
  };
}

async function post(url: URL, params: any) {
  const method = 'POST';
  const paramsStr = JSON.stringify(params);
  const authToken = getAuthToken(url, method, paramsStr);
  // console.info('gen getAuthToken', authToken);
  // console.info('request with body', prePayParams);
  const prepayRes = await fetch(url.toString(), {
    headers: {
      'Authorization': `${SCHEMA} ${authToken}`,
      'Content-Type': 'application/json',
      'Accept-Language': 'zh-CN'
    },
    method,
    body: paramsStr,
  });
  const prepayResJson = await prepayRes.json();
  // console.info(prepayResJson)
  return prepayResJson;
}

async function get(url: URL) {
  const method = 'GET';
  const authToken = getAuthToken(url, method);
  // console.info('request with body', prePayParams);
  console.info('request url:', url.toString());
  const prepayRes = await fetch(url.toString(), {
    headers: {
      'Authorization': `${SCHEMA} ${authToken}`,
      'Content-Type': 'application/json',
      'Accept-Language': 'zh-CN'
    },
    method,
  });
  const prepayResJson = await prepayRes.json();
  // console.info(prepayResJson)
  return prepayResJson;
}

export async function getPayUrl(tradeNo: string, name: string, price: number) {
  if (!APP_ID || !WEXIN_PAY_MERCHANTID) {
    return 'server error';
  }
  const prePayParams: NativePrePayRequestParams = {
    appid: APP_ID,
    mchid: WEXIN_PAY_MERCHANTID,
    description: name,
    // TODO: gen trade no
    out_trade_no: tradeNo,
    // TODO: update expire time
    time_expire: dayjs().add(2, 'hours').format('YYYY-MM-DDTHH:mm:ssZ'),
    notify_url: 'https://www.aiworks.club/api/weichat/payNotify',
    // TODO 查询优惠数据并更新价格
    amount: {
      total: price * 100,
    }
  };
  const prepayRes = await post(new URL(NATIVE_PRE_PAY_API_URL), prePayParams);
  console.info('create prepay res', prepayRes);
  return prepayRes;
}


export async function queryByTradeNo(tradeNo: string) {
  const url = new URL(`${QUERY_TRANSACATIONS_BY_TRADE_NO_URL}${tradeNo}`);
  url.search = `mchid=${WEXIN_PAY_MERCHANTID}`
  const res = await get(url);
  console.info(res);
  return res;
}