import { checkCode } from "@/lib/sms";
import { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import { generateUserInfo } from "@/lib/api/user";
import { UserSession } from "./user";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import { FINGERPRINT_KEY } from "@/utils/constants";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { phone, code, inviteCode } = req.body || {};
  if (!checkCode(phone, code)) {
    res.status(400).json({ status: "failed", message: "验证码错误" });
  }
  try {
    await dbConnect();
    // 查询数据库用户是否存在
    let user = await User.findOne({ phone });
    if (user) {
      // 登录过直接返回
      req.session.user = {
        _id: user._id.toString(),
        isLoggedIn: true,
        phone: user.phone,
        name: user.name,
        userCode: user.userCode,
        createAt: user.createAt,
        fingerprint: req.headers[FINGERPRINT_KEY],
      } as UserSession;
      await req.session.save();
      console.log("old user login success:", user);
      res.status(200).json({ status: "ok", message: "登录成功" });
      return;
    }
    let userInfo = generateUserInfo();
    // 新建用户记录
    const newDoc = await new User(
      Object.assign({}, userInfo, {
        registerType: "phone",
        phone,
        inviteCode,
      })
    ).save();
    console.log("new phone user login success:", newDoc);
    const newSession: UserSession = {
      _id: newDoc._id,
      isLoggedIn: true,
      phone,
      name: userInfo.name,
      userCode: userInfo.userCode,
      createAt: userInfo.createAt,
      fingerprint: req.headers[FINGERPRINT_KEY] as string,
    };
    req.session.user = newSession;
    await req.session.save();
    res.status(200).json({
      status: "ok",
      message: "登录成功",
    });
  } catch (e) {
    console.error("login error:", e);
    res.status(500).json({ status: "failed", message: "登录失败" });
  }
}

export default withIronSessionApiRoute(handler, sessionOptions);
