import { Midjourney } from "midjourney";
import { ResponseError } from "@/models/MJMessage";
import { NextApiRequest, NextApiResponse } from "next";
export const config = {
  runtime: "edge",
};
const client = new Midjourney({
  ServerId: <string>process.env.SERVER_ID,
  ChannelId: <string>process.env.CHANNEL_ID,
  SalaiToken: <string>process.env.SALAI_TOKEN,
  Debug: true,
  MaxWait: 600,
});
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { content, index, msgId, msgHash } = await req.body || {};
  console.log("variation.handler", content);
  res.setHeader('Content-Type', 'text/plain')
  res.setHeader('Transfer-Encoding', 'chunked')
  const encoder = new TextEncoder();
  new ReadableStream({
    start(controller) {
      console.log("variation.start", content);
      client
        .Variation(
          content,
          index,
          msgId,
          msgHash,
          (uri: string, progress: string) => {
            console.log("variation.loading", uri);
            res.write(JSON.stringify({ uri, progress }))
            controller.enqueue(
              encoder.encode(JSON.stringify({ uri, progress }))
            );
          }
        )
        .then((msg) => {
          console.log("variation.done", msg);
          res.write(JSON.stringify(msg))
          controller.enqueue(encoder.encode(JSON.stringify(msg)));
          controller.close();
          res.end()
        })
        .catch((err: ResponseError) => {
          console.log("variation.error", err);
          controller.close();
          res.end()
        });
    },
  });
  // return new Response(readable, {});
}
