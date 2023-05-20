import { sessionOptions } from "@/lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import cache from 'memory-cache'
import { getQrCacheKey } from "@/lib/weichat";
import User from "@/models/User";
import { FINGERPRINT_KEY, LOGIN_QR_STATUS, WX_EVENT_TYPE } from "@/utils/constants";
import { UserSession } from "../user/user";
import { generateUserInfo } from "@/lib/api/user";
import WxEvent from "@/models/WxEvent";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ticket, inviteCode } = req.query || {}
  if (!ticket) {
    return res.status(400).json({ status: 'failed', message: '缺少ticket参数' })
  }
  // 二维码几种状态：generate：新生成，未扫码，scan：已扫码。不存在：已过期
  const cacheKey = getQrCacheKey(ticket as string)
  const result = await WxEvent.findOne({
    type: WX_EVENT_TYPE.login_qr,
    key: cacheKey
  })
  const qrStatus = result?.value
  if (!qrStatus || result?.expireAt < Date.now()) {
    // 缓存没记录表示处理中
    return res.status(200).json({ status: 'expired', message: '已过期' })
  } else if (qrStatus === LOGIN_QR_STATUS.generated) {
    return res.status(200).json({ status: 'pending', message: '处理中' })
  } else if (qrStatus && qrStatus.includes(LOGIN_QR_STATUS.scan)) {
    // 已扫码，处理登录逻辑
    const openid = qrStatus.split('_')[0]
    // 新用户插入DB
    const defaultInfo = generateUserInfo()
    const newUser = await new User(Object.assign({}, defaultInfo, {
      registerType: 'wx',
      openid,
    })).save()
    console.log('new wx user insert db success', newUser)
    req.session.user = {
      _id: newUser._id.toString(),
      isLoggedIn: true,
      phone: '',
      name: defaultInfo.name,
      userCode: defaultInfo.userCode,
      inviteCode,
      fingerprint: req.headers[FINGERPRINT_KEY]
    } as UserSession
    await req.session.save()
    console.log('wx user login success:', newUser)
    return res.status(200).json({ status: 'ok', message: "登录成功" });
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)