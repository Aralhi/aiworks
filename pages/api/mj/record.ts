import dbConnect from "@/lib/dbConnect";
import { sessionOptions } from "@/lib/session";
import MJMessage, { IMJMessage } from "@/models/MJMessage";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body as Pick<
    IMJMessage,
    "msgHash" | "msgId" | "type" | "prompt" | "index"
  >;
  const { user: { isLoggedIn, _id, fingerprint } = {} } = req.session;
  if (!isLoggedIn || !_id || !fingerprint) {
    return res
      .status(400)
      .json({ status: "failed", message: "您无法做此操作，请先登录" });
  }
  if (req.method === "POST") {
    try {
      await dbConnect();
      await MJMessage.create({
        userId: _id,
        fingerprint,
        prompt: body.prompt,
        index: body.index,
        type: body.type,
        msgId: body.msgId,
        msgHash: body.msgHash,
      });
      return res.json({ status: "ok" });
    } catch (e) {
      console.error("save midjourney record failed!", e);
    }
  }
};

export default withIronSessionApiRoute(handler, sessionOptions);
