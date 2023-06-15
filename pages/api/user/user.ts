import { getUpdateBody } from "@/lib/api/user";
import dbConnect from "@/lib/dbConnect";
import { sessionOptions } from "@/lib/session";
import User, { UserPricing } from "@/models/User";
import { USERNAME_LENGTH } from "@/utils/constants";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

// session中User的类型
export type UserSession = {
  _id: string;
  isLoggedIn: boolean;
  userCode: string;
  fingerprint: string;
  phone?: string;
  name?: string;
  openid?: string;
  createAt?: string;
  pricings?: Array<UserPricing>;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return await getUserFromSession(req, res);
  } else if (req.method === "PUT") {
    // 更新用户信息
    await update(req, res);
  }
}

export default withIronSessionApiRoute(handler, sessionOptions);

async function getUserFromSession(req: NextApiRequest, res: NextApiResponse) {
  if (req.session.user) {
    const { _id = "" } = req.session.user || {};
    await dbConnect();
    const user = await User.findOne({ _id });
    if (user) {
      return res
        .status(200)
        .json(Object.assign({}, user, { isLoggedIn: true }));
    } else {
      console.log("user not found by session", req.session.user);
      req.session.destroy();
      res.status(200).json({ isLoggedIn: false });
    }
  } else {
    res.json({
      isLoggedIn: false,
    });
  }
}

async function update(req: NextApiRequest, res: NextApiResponse) {
  const { user } = req.session;
  if (!user?._id || !user.isLoggedIn) {
    return res.status(401).json({ status: "failed", message: "请先登录" });
  }
  const { name, avatarUrl } = req.body || {};
  if (name && name.length > USERNAME_LENGTH) {
    return res
      .status(400)
      .json({ status: "failed", message: `用户名不能超过${USERNAME_LENGTH}` });
  }
  const { _id } = user;
  try {
    // 目前只更新name、avatarUrl
    await dbConnect();
    const updateRes = await User.updateOne(
      { _id },
      {
        updateAt: Date.now(),
        ...getUpdateBody(name, avatarUrl),
      }
    );
    console.log("update user success:", updateRes);
    return res.json({ status: "ok", message: "更新成功" });
  } catch (e) {
    console.error("update user failed:", e);
  }
}
