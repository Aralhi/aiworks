import { getWXAccessToken, createQrCode } from "@/lib/weichat"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const result = await createQrCode()
  return new Response()
}