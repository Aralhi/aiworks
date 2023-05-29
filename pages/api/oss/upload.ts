import { sessionOptions } from "@/lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import OSS from "ali-oss";

const client = new OSS({
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.OSS_ACCESS_KEY_KEY_SECRET!,
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const payload = req.body as FormData | { filename?: string; data: string };
    let fileName: string;
    let data;
    if (payload instanceof FormData) {
      fileName = payload.get("filename") as string;
      data = payload.get("file");
    } else {
      fileName = payload.filename || "";
      data = payload.data;
    }
    const { name, url } = await client.put(fileName, data);
    return res.json({ status: "ok", data: { url, name } });
  } catch (e) {
    return res.status(500).json({ staus: "failed" });
  }
}

export default withIronSessionApiRoute(handler, sessionOptions);
