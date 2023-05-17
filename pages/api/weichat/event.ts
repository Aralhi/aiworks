import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('weichat event', req.method, req.query, req.body)
  return res.status(200).json({ status: 'ok', message: 'ok' })
}