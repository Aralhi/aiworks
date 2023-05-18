import { createQrCode } from "@/lib/weichat"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const result = await createQrCode()
    res.status(200).json({ status: 'ok', result })
  } catch (e) {
    console.error('create qr failed', e)
  }
}