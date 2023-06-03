import redis from "@/lib/redis";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const setRes = redis.set('name', 'katakuri', 'EX', 60)
  console.log('setRes', setRes)
  const getRes = await redis.get('name')
  console.log('getRes', getRes)
  return res.status(200).json({ name: 'John Doe' })
}