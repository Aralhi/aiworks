import Script from "next/script";
import { useEffect } from "react";

const APP_ID = process.env.SERVICE_APP_ID || 'wx195a32469a3da3cf';

export default function Pay() {
  useEffect(() => {
    // if (window.location.search.indexOf('code') === -1) {
    //   console.info(window.location);
    //   window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${APP_ID}&redirect_uri=${encodeURIComponent('https://www.aiworks.club/')}&response_type=code&scope=snsapi_base&state=1#wechat_redirect`
    // } else {
    // }
    getPayParams().then(payParams => {
      WeixinJSBridge.invoke('getBrandWCPayRequest', payParams, (res) => {
        console.info(res)
      });
    })
  }, []);
  async function getPayParams() {
    const payRes = await fetch('/api/weichat/pay');
    const {
      prepayId,
      paySign,
    } = await payRes.json();
    if (prepayId) {

    } else {
      console.error('no prepayid')
    }
  }
  return <>
    <Script src="http://res.wx.qq.com/open/js/jweixin-1.6.0.js" strategy="beforeInteractive"></Script>
    <div>
      paying....
    </div>
  </>
}
