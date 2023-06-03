import dbConnect from "@/lib/dbConnect";
import { sessionOptions } from "@/lib/session";
import MJMessage from "@/models/MJMessage";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { user: { isLoggedIn, _id, fingerprint } = {} } = req.session;
  console.log(fingerprint);
  if (!isLoggedIn || !_id || !fingerprint) {
    return res.json({ status: "ok", data: [] });
  }
  if (req.method === "GET") {
    try {
      await dbConnect();
      const list = await MJMessage.find({ userId: _id || fingerprint }).sort({
        createAt: -1,
      });
      return res.json({ status: "ok", data: list });
    } catch (e) {
      console.error("save midjourney record failed!", e);
    }
  }
};

export default withIronSessionApiRoute(handler, sessionOptions);
