import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('weichat event', process.env.WX_PUBLIC_TOKEN, req.method, req.query, req.body)
  return res.json({ status: 'success' })
}