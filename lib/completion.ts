import Completion, { ICompletion } from "@/models/Completion";
import { getIronSession } from 'iron-session/edge';
import { sessionOptions } from "@/lib/session";
import { getTodayTime } from "../utils";
import dbConnect from "./dbConnect";
import cache from 'memory-cache'
import User, { UserPricing } from "@/models/User";
import { FINGERPRINT_KEY, LOGIN_MAX_QUERY_COUNT, UNLOGIN_MAX_QUERY_COUNT } from "@/utils/constants";
import { NextApiRequest } from "next";
import { SessionOperation } from "mongoose";

const COMPLETION_COUNT_CACHE_TIME = 1000 * 60 * 60 * 24 // 1小时

export async function queryTodayCompletionCount(userId: string = '', fingerprint: string = '') {
  try {
    await dbConnect()
    const [todayStartCST, todayEndCST] = getTodayTime()
    const result = await Completion.aggregate([
      {
        $match: {
          $or: [
            { userId },
            { fingerprint }
          ],
          createAt: {
            $gte: new Date(todayStartCST),
            $lte: new Date(todayEndCST),
          },
        },
      },
      {
        $count: 'count',
      },
    ]);
    return result[0]?.count || 0
  } catch (error) {
    console.error('get completion today count error', error)
    return 0
  }
}

export async function queryPricingCompletionCount(userId: string) {
  // 数据库插入的地方也要更新缓存
  const cacheCount = cache.get(getCompletionCountCacheKey(userId))
  if (cacheCount || cacheCount === 0) {
    return cacheCount
  }
  try {
    await dbConnect()
    const user = await User.findOne({ _id: userId })
    const pricings = user?.pricings || []
    const pricing: UserPricing = pricings?.find((item: UserPricing) => item.name === 'chatGPT' && item.endAt > Date.now())
    if (pricing) {
      const result = await Completion.aggregate([
        {
          $match: {
            $or: [
              { userId },
            ],
            createAt: {
              $gte: new Date(pricing.startAt).toUTCString(),
              $lte: new Date(pricing.endAt).toUTCString(),
            },
          },
        },
        {
          $count: 'count',
        },
      ]);
      const count = result[0]?.count || 0
      cache.put(getCompletionCountCacheKey(userId), count, COMPLETION_COUNT_CACHE_TIME)
      return count
    }
  } catch (error) {
    console.error('get completion pricing count error', error)
    return 0
  }
}

export function getCompletionCountCacheKey(userId: string) {
  return `completion_count_${userId}`
}

export async function saveCompletion(completion: ICompletion) {
  try {
    // 未登录的不计数
    const key = getCompletionCountCacheKey(completion.userId)
    const cacheCount = cache.get(key)
    cache.put(key, (cacheCount || 0) + 1, )
    // 插入问答记录到数据库
    const insertRes = await new Completion(completion).save()
  } catch (error) {
  }
}

export async function checkQueryCount(req: any, res: any) {
  const session = await getIronSession(req, res, sessionOptions)
  const user: SessionOperation = session.user || {}
  const fingerprint = req.headers.get(FINGERPRINT_KEY);
  // TODO兼容微信调用，用openid
  if (!user && !fingerprint) {
    return { status: 'ok' }
  }
  const { isLoggedIn, pricings, _id: userId } = user || {}
  const pricing: UserPricing | undefined = pricings?.find((item: UserPricing) => item.name === 'chatGPT' && item.endAt > Date.now())
  const count = await queryTodayCompletionCount(userId, fingerprint)
  console.log('get completion count', count, fingerprint)
  // 未登录用户最大查询三次
  if (!isLoggedIn && count >= UNLOGIN_MAX_QUERY_COUNT) {
    return { status: 'failed', message: "未登录用户最大查询三次" }
  } else if (isLoggedIn && !pricing && count >= LOGIN_MAX_QUERY_COUNT) {
    // 登录未购买chatGPT用户最大查询100次
    return { status: 'failed', message: "您的免费次数已用完" }
  } else if (isLoggedIn && pricing && userId) {
    //TODO 付费用户查询额度
    const count = await queryPricingCompletionCount(userId)
    if (count >= pricing.queryCount) {
      // 超出购买用户最大查询额度
      return { status: 'failed', message: "您的套餐内查询次数已用完" }
    }
  }
  return { status: 'ok'}
}