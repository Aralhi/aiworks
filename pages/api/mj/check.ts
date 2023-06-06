import { encrypt } from "@/lib/crypto";
import getQueryCount from "@/lib/queryCount";
import { sessionOptions } from "@/lib/session";
import { FINGERPRINT_KEY } from "@/utils/constants";
import MJMessage from "@/models/MJMessage";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

export const enum MJ_CHECK_ERR_CODE_EMUM {
  /** 未登录且无查询次数 */
  UNLOGIN_NO_QUERY_TIMES = "UNLOGIN_NO_QUERY_TIMES",
  /** 已登陆且无查询次数 */
  LOGIN_NO_QUERY_TIMES = "LOGIN_NO_QUERY_TIMES",
  /** 套餐无查询次数 */
  PRICING_NO_QUERY_TIMES = "PRICING_NO_QUERY_TIMES",
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = req.session.user;
  const fingerprint = req.headers[FINGERPRINT_KEY] as string;

  if (!user && !fingerprint) {
    return res
      .status(400)
      .json({ status: "failed", message: "您的免费查询次数已用完,请前往登录" });
  }

  const count = await getQueryCount({
    user,
    fingerprint,
    type: "midjourney",
    model: MJMessage,
  });

  console.log("剩余次数", count);

  if (!count) {
    if (!user?.isLoggedIn) {
      return res.json({
        status: MJ_CHECK_ERR_CODE_EMUM.UNLOGIN_NO_QUERY_TIMES,
        message: "您的免费查询次数已用完,请前往登录",
      });
    }
    const hasMJPricing =
      user.pricings &&
      user.pricings.length &&
      user.pricings.find((item) => item.type === "midjourney");
    if (!!hasMJPricing) {
      return res.json({
        status: MJ_CHECK_ERR_CODE_EMUM.PRICING_NO_QUERY_TIMES,
        message: "您的套餐内查询次数已用完",
      });
    } else {
      return res.json({
        status: MJ_CHECK_ERR_CODE_EMUM.PRICING_NO_QUERY_TIMES,
        message: "您的免费查询次数已用完",
      });
    }
  }

  const plaintext = user?._id || fingerprint;
  const auth = encrypt(plaintext);

  res.setHeader("Authorization", `Bearer ${auth}`);

  return res.json({
    status: "ok",
    data: { plaintext },
  });
};

export default withIronSessionApiRoute(handler, sessionOptions);
