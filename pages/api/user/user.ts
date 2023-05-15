import { getUpdateBody } from "@/lib/api/user";
import dbConnect from "@/lib/dbConnect";
import { sessionOptions } from "@/lib/session";
import User from "@/models/User";
import { USERNAME_LENGTH } from "@/utils/constants";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

// session中User的类型
export type UserSession = {
  _id: string;
  isLoggedIn: boolean;
  userCode: string;
  phone?: string;
  name?: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await getUserFromSession(req, res)
  } else if (req.method === 'PUT') {
    // 更新用户信息
    await update(req, res)
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)

async function getUserFromSession(req: NextApiRequest, res: NextApiResponse) {
  if (req.session.user) {
    const { phone = '' } = req.session.user as UserSession
    await dbConnect()
    const user = await User.findOne({ phone })
    if (user) {
      return res.status(200).json(Object.assign({}, user.toJSON(), { isLoggedIn: true }));
    } else {
      console.log('user not found by session', req.session.user)
      res.status(200).json({ isLoggedIn: false })
    }
  } else {
    const mock = {"_id":"6460aa3265a205c60f55022c","name":"用户RvGqIzFDBm","userCode":"RvGqIzFDBm","phone":"18312050615","avatarUrl":"/male_avatar.jpg","createAt":"2023-05-14T09:30:26.474Z","updateAt":"2023-05-14T09:31:31.802Z","__v":0,"isLoggedIn":true};
    res.json(mock);
    // res.json({
    //   isLoggedIn: false,
    // });
  }
}

async function update(req: NextApiRequest, res: NextApiResponse) {
  const { user } = req.session
  if (!user?._id || !user.isLoggedIn) {
    return res.status(401).json({ status: 'failed', message: '请先登录' })
  }
  const { name, avatarUrl } = req.body || {};
  if (name && name.length > USERNAME_LENGTH) {
    return res.status(400).json({ status: 'failed', message: `用户名不能超过${USERNAME_LENGTH}` })
  }
  const { _id } = user
  try {
    // 目前只更新name、avatarUrl
    await dbConnect()
    const updateRes = await User.updateOne({ _id }, {
      updateAt: Date.now(),
      ...getUpdateBody(name, avatarUrl)
    })
    console.log('update user success:', updateRes)
    return res.json({ status: 'ok', message: '更新成功'})
  } catch (e) {
    console.error('update user failed:', e)
  }
}
