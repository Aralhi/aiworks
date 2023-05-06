import { NextApiRequest, NextApiResponse } from "next";

const handler =async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('....get in', req.body)
  return res.json({test: 'test'})
}

export default handler