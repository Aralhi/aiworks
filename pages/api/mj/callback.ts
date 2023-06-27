import dbConnect from "@/lib/dbConnect";
import MJMessage, { IMJMessage } from "@/models/MJMessage";
import { NextApiRequest, NextApiResponse } from "next";
import { BasicModel } from "types";

interface MJCallbackPayload {
  unionId: string;
  progress: string;
  uri: string;
  msgId: string;
  id: string;
  hash: string;
  flags: number;
  content: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unionId, progress, uri, msgId, id, hash, content, flags } =
    req.body as MJCallbackPayload;
  try {
    await dbConnect();
    const record = await MJMessage.findOne<BasicModel<IMJMessage>>({ unionId });
    if (record && record.progress !== "done") {
      const headers = req.headers;
      const ossRes = await fetch("https://api.aiworks.club/api/mj/image", {
        headers: {
          ...(headers as { [key: string]: string }),
        },
        method: "POST",
        body: JSON.stringify({ url: uri }),
      });
      const data = await ossRes.json();
      await MJMessage.updateOne(
        { _id: record._id },
        {
          id,
          progress,
          content,
          msgId,
          flags,
          msgHash: hash,
          img: data.url,
          originImg: uri,
          imgPath: data.originUrl,
        }
      );
    }
    return res.send({ status: "ok", message: "回调成功" });
  } catch (e) {
    console.error("midjourney callback failed", e);
    return res.status(500).send({ status: "failed" });
  }
}

export default handler;
