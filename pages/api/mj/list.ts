import dbConnect from "@/lib/dbConnect";
import { sessionOptions } from "@/lib/session";
import MJMessage from "@/models/MJMessage";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import OSS from "ali-oss";

const EXPIRES_TIME = 3600;
const client = new OSS({
  endpoint: process.env.OSS_ENDPOINT,
  bucket: process.env.OSS_BUCKET,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.OSS_ACCESS_SECRET!,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { user: { isLoggedIn, _id, fingerprint } = {} } = req.session;
  if (!isLoggedIn || !_id || !fingerprint) {
    return res.json({ status: "ok", data: [] });
  }
  if (req.method === "GET") {
    try {
      await dbConnect();
      let list = await MJMessage.find({ userId: _id || fingerprint }).sort({
        createAt: 1,
      });
      list = await Promise.all(
        list.map(async (item) => {
          if (item.img) {
            item.img = await client.signatureUrl(item.img, {
              expires: EXPIRES_TIME,
            });
          }
          return item;
        })
      );
      return res.json({ status: "ok", data: list });
    } catch (e) {
      console.error("save midjourney record failed!", e);
    }
  }
};

export default withIronSessionApiRoute(handler, sessionOptions);
