import dbConnect from "@/lib/dbConnect";
import { insertMessage } from "@/lib/mjMessage";
import { sessionOptions } from "@/lib/session";
import { IMJMessage } from "@/models/MJMessage";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

export type MJRecordPayloadType = Pick<
  IMJMessage,
  "msgHash" | "msgId" | "type" | "prompt" | "index" | "img"
>;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = (req.body as MJRecordPayloadType) ?? {};
  const { user: { isLoggedIn, _id, fingerprint } = {} } = req.session;
  // if (!isLoggedIn || !_id || !fingerprint) {
  //   return res
  //     .status(400)
  //     .json({ status: "failed", message: "您无法做此操作，请先登录" });
  // }
  if (req.method === "POST") {
    try {
      const message: IMJMessage = {
        img: body.img,
        userId: _id ?? "xxx",
        fingerprint,
        prompt: body.prompt,
        index: body.index,
        type: body.type,
        msgId: body.msgId,
        msgHash: body.msgHash,
      };
      await dbConnect();
      const result = await insertMessage(message);
      console.log(result);
      return res.status(result.status === "ok" ? 200 : 500).json(result);
    } catch (e) {
      console.error("save midjourney record failed!", e);
    }
  }
};

export default withIronSessionApiRoute(handler, sessionOptions);
