import { sessionOptions } from "@/lib/session";
import { createQrCode } from "@/lib/weichat";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const result = await createQrCode()
    return res.json({ status: 'ok', data: result })
  } catch (error) {
    console.error('genLoginQR failed', error)
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)