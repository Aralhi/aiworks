import dbConnect from "@/lib/dbConnect";
import { sessionOptions } from "@/lib/session";
import MJMessage, { IMJMessage } from "@/models/MJMessage";
import { FINGERPRINT_KEY } from "@/utils/constants";
import { withIronSessionApiRoute } from "iron-session/next";
import { FilterQuery } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { user: { isLoggedIn, _id } = {} } = req.session;
  const fingerprint = req.headers[FINGERPRINT_KEY] as string;
  if (!isLoggedIn && !_id && !fingerprint) {
    return res.json({ status: "ok", data: [] });
  }
  if (req.method === "GET") {
    try {
      await dbConnect();
      const filter: FilterQuery<IMJMessage> = {
        $or: [],
      };
      if (_id) {
        filter.$or?.push({ userId: _id });
      }
      if (fingerprint) {
        filter.$or?.push({ fingerprint });
      }
      let list = await MJMessage.find<IMJMessage>(filter).sort({
        createAt: 1,
      });
      return res.json({
        status: "ok",
        data: list.map((item) => {
          if (item.img) {
            if (item.img.includes("?")) {
              item.img = item.img.split("?")[0];
            }
            if (!/^http/.test(item.img)) {
              item.img = `https://${process.env.OSS_BUCKET}.${
                process.env.OSS_ENDPOINT
              }${item.img.startsWith("/") ? item.img : `/${item.img}`}`;
            }
          }
          return item;
        }),
      });
    } catch (e) {
      console.error("get midjourney record failed!", e);
      return res.status(500).json({ status: "failed" });
    }
  }
};

export default withIronSessionApiRoute(handler, sessionOptions);
