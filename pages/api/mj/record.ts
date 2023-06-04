import dbConnect from "@/lib/dbConnect";
import { insertMessage } from "@/lib/mjMessage";
import { minusCount } from "@/lib/queryCount";
import { sessionOptions } from "@/lib/session";
import { IMJMessage } from "@/models/MJMessage";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = (req.body as Omit<IMJMessage, "userId" | "fingerprint">) ?? {};
  const { user: { isLoggedIn, _id, fingerprint } = {} } = req.session;
  if (!isLoggedIn || !_id || !fingerprint) {
    return res
      .status(400)
      .json({ status: "failed", message: "您无法做此操作，请先登录" });
  }
  if (req.method === "POST") {
    try {
      const message: IMJMessage = {
        userId: _id,
        fingerprint,
        ...body,
      };
      await dbConnect();
      const result = await insertMessage(message);
      minusCount(_id, "midjourney");
      console.log(result);
      return res.status(result.status === "ok" ? 200 : 500).json(result);
    } catch (e) {
      console.error("save midjourney record failed!", e);
    }
  }
};

export default withIronSessionApiRoute(handler, sessionOptions);
