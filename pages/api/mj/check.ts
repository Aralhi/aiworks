import { encrypt } from "@/lib/crypto";
import getQueryCount from "@/lib/queryCount";
import { sessionOptions } from "@/lib/session";
import { FINGERPRINT_KEY } from "@/utils/constants";
import MJMessage from "@/models/MJMessage";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = req.session.user;
  const fingerprint = req.headers[FINGERPRINT_KEY] as string;

  if (!user || !fingerprint) {
    return res.status(400).json({ status: "NO_LOGIN" });
  }

  // const count = await getQueryCount(user, "midjourney", MJMessage);

  // if (!count) {
  //   return res
  //     .status(200)
  //     .json({ status: "failed", message: "您的套餐内查询次数已用完" });
  // }

  const plaintext = user?._id || fingerprint;
  const auth = encrypt(plaintext);

  res.setHeader("Authorization", `Bearer ${auth}`);

  return res.json({
    status: "ok",
    data: { plaintext },
  });
};

export default withIronSessionApiRoute(handler, sessionOptions);
