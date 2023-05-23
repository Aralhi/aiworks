import { sessionOptions } from "@/lib/session";
import { createQrCode, getQrCacheKey } from "@/lib/weichat";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import cache from 'memory-cache'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const { key } = req.query || {}
    const result = await cache.get(key)
    return res.json({ status: 'ok', result })
  } else if (req.method === 'POST') {
    const { key, value, expire } = req.body || {}
    const result = cache.put(key, value, expire)
    return res.json({ status: 'ok', result })
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)