import { insertOne } from "@/lib/db";
import { WX_EVENT_TYPE } from "@/utils/constants";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.info('notify pay...', req.body, req.headers);
  await insertOne('wxevent', {
    type: WX_EVENT_TYPE.pay_notify,
    value: JSON.stringify({
      body: req.body,
      headers: req.headers,
    }),
    message: {
      body: req.body,
      headers: req.headers,
    },
    body: req.body,
    headers: req.headers,
    createAt: new Date(),
  })
  res.json({
    success: 1,
  })
}
