import dbConnect from "@/lib/dbConnect";
import { sessionOptions } from "@/lib/session";
import MJMessage, { IMJMessage } from "@/models/MJMessage";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { user: { isLoggedIn, _id, fingerprint } = {} } = req.session;
  if (!isLoggedIn || !_id || !fingerprint) {
    return res.json({ status: "ok", data: [] });
  }
  if (req.method === "GET") {
    try {
      await dbConnect();
      let list = await MJMessage.find<IMJMessage>({ userId: _id || fingerprint }).sort({
        createAt: 1,
      });
      return res.json({ status: "ok", data: list.map(item => {
        if (item.img) {
          if (item.img.includes('?')) {
            item.img = item.img.split('?')[0];
          }
          if (/^http/.test(item.img)) {
            item.img = `https://${process.env.OSS_BUCKET}.${process.env.OSS_ENDPOINT}/${item.img}`;
          }
        }
        return item;
      }) });
    } catch (e) {
      console.error("save midjourney record failed!", e);
    }
  }
};

export default withIronSessionApiRoute(handler, sessionOptions);
