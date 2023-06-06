import { sessionOptions } from "@/lib/session";
import MJMessage, { IMJMessage } from "@/models/MJMessage";
import { FINGERPRINT_KEY } from "@/utils/constants";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

type MJUpdatePayloadType = Partial<IMJMessage>;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { user: { isLoggedIn, _id, fingerprint: sessionFingerprint } = {} } =
    req.session;
  const fingerprint = req.headers[FINGERPRINT_KEY] as string;
  if (!isLoggedIn && !_id && !(sessionFingerprint || fingerprint)) {
    return res
      .status(400)
      .json({ status: "failed", message: "您无法做此操作，请先登录" });
  }
  if (req.method === "PATCH") {
    try {
      await MJMessage.updateOne<IMJMessage>(
        { _id: id },
        req.body as MJUpdatePayloadType
      );
      return res.json({ status: "ok" });
    } catch (e) {
      console.error("update midjourney record failed", e);
      return res.status(500).json({ status: "failed" });
    }
  }
}

export default withIronSessionApiRoute(handler, sessionOptions);
