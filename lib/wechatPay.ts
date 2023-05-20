import { IPricing } from '@/models/Pricing';
import { KJUR, hextob64 } from 'jsrsasign';
import { Url } from 'next/dist/shared/lib/router/router';
import { URL } from 'url';
import { PrePayRequestParams } from './wechatPay.types';
const SIGN_ALG = 'SHA256withRSA'
const SCHEMA = 'WECHATPAY2-SHA256-RSA2048';
const APP_ID = process.env.SERVICE_APP_ID;
const WEXIN_PAY_MERCHANTID = process.env.WEXIN_PAY_MERCHANTID;
const WEXIN_PAY_CERT_SERIAL_NO = process.env.WEXIN_PAY_CERT_SERIAL_NO;
const PRE_PAY_API_URL = 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi';
const PRIVATE_KEY = process.env.WECHAT_PAY_PEM_PRIVATE_KEY || '';
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

function getAuthToken(url: URL, method: string, body: string) {
  const nonceStr = `${Math.round(Math.random() * 1000)}`;
  const timestamp = Math.round(new Date().getTime()/1000);
  console.info(2123);
  const sign = new SignBuilder([
    method,
    url.pathname,
    `${timestamp}`,
    nonceStr,
    body,
  ]).build();
  const authToken = `mchid="${WEXIN_PAY_MERCHANTID}",serial_no="${WEXIN_PAY_CERT_SERIAL_NO}",nonce_str="${nonceStr}",timestamp="${timestamp}",signature="${sign}"`;
  return authToken;
}

function getPaySign(appid: string, body: string) {
  const nonceStr = `${Math.round(Math.random() * 1000)}`;
  const timestamp = Math.round(new Date().getTime()/1000);
  console.info(2123);
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



export async function prePay(userOpenId: string, plan: IPricing) {
  const payURL = new URL(PRE_PAY_API_URL);
  if (!APP_ID || !WEXIN_PAY_MERCHANTID) {
    return 'server error';
  }
  const method = 'POST';
  const prePayParams: PrePayRequestParams = {
    appid: APP_ID,
    mchid: WEXIN_PAY_MERCHANTID,
    description: plan.name,
    // TODO: gen trade no
    out_trade_no: `${new Date().getTime()}-${Math.round(Math.random()*1000)}`,
    // TODO: update expire time
    time_expire: '2023-05-22T20:34:56+08:00',
    notify_url: 'https://www.aiworks.club/api/weichat/pay_notify',
    amount: {
      total: plan.price,
    },
    payer: {
      openid: userOpenId
    }
  };
  const prePayParamsStr = JSON.stringify(prePayParams);
  const authToken = getAuthToken(payURL, method, prePayParamsStr);
  console.info('gen getAuthToken', authToken);
  console.info('request with body', prePayParams);
  const prepayRes = await fetch(PRE_PAY_API_URL, {
    headers: {
      'Authorization': `${SCHEMA} ${authToken}`,
      'Content-Type': 'application/json',
    },
    method,
    body: prePayParamsStr,
  });
  const prepayResJson = await prepayRes.json();
  console.info(prepayResJson)
  const prepayId = (prepayResJson).prepay_id;
  if (!prepayId) {
    throw prepayResJson
  }
  return {
    prepayId,
    ...getPaySign(APP_ID, `prepay_id=${prepayId}`),
  };
}