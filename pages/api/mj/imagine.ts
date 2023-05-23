import { Midjourney } from "midjourney";
import { ResponseError } from "@/models/MJMessage";
import { NextApiRequest, NextApiResponse } from "next";

const client = new Midjourney({
  ServerId: <string>process.env.SERVER_ID,
  ChannelId: <string>process.env.CHANNEL_ID,
  SalaiToken: <string>process.env.SALAI_TOKEN,
  Debug: true,
  MaxWait: 600,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { prompt } = await req.body || {};
  console.log("imagine.handler", prompt);
  res.setHeader('Content-Type', 'text/plain')
  res.setHeader('Transfer-Encoding', 'chunked')
  const encoder = new TextEncoder();
  new ReadableStream({
    start(controller) {
      console.log("imagine.start", prompt);
      client
        .Imagine(prompt, (uri: string, progress: string) => {
          console.log("imagine.loading", uri);
          res.write(JSON.stringify({ uri, progress }))
          controller.enqueue(encoder.encode(JSON.stringify({ uri, progress })));
        })
        .then((msg) => {
          console.log("imagine.done", msg);
          res.write(JSON.stringify(msg))
          controller.enqueue(encoder.encode(JSON.stringify(msg)));
          controller.close();
        })
        .catch((err: ResponseError) => {
          console.log("imagine.error", err);
          controller.close();
        });
    },
  });
  // return new Response(readable, {});
};
export default handler;
