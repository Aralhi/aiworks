import { ICompletion } from "@/models/Completion";
import { getTodayTime } from "../utils";
import clientPromise from "./dbConnect";
import cache from 'memory-cache'
import { UserPricing } from "@/models/User";
import { LOGIN_MAX_QUERY_COUNT, MAX_COMPLETION_QUERY_COUNT, UNLOGIN_MAX_QUERY_COUNT } from "@/utils/constants";
import { UserSession } from "pages/api/user/user";
import { ObjectId } from "mongodb";

const COMPLETION_COUNT_CACHE_TIME = 1000 * 60 * 60 * 24 // 1小时

export async function queryTodayCompletionCount(userId: string, fingerprint: string) {
  try {
    const client = await clientPromise
    const Completion = await client.db().collection('completion')
    const [todayStartCST, todayEndCST] = getTodayTime()
    const count = await Completion.countDocuments({
      $or: [
        { userId },
        { fingerprint }
      ],
      createAt: {
        $gte: new Date(todayStartCST),
        $lte: new Date(todayEndCST),
      },
    })
    return count
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
    const client = await clientPromise
    const User = await client.db().collection('user')
    const Completion = await client.db().collection('completion')
    const user = await User.findOne({ _id: new ObjectId(userId) })
    const pricings = user?.pricings || []
    const pricing: UserPricing = pricings?.find((item: UserPricing) => item.name === 'chatGPT' && item.endAt > Date.now())
    if (pricing) {
      const cursor = await Completion.aggregate([
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
      const result = await cursor.toArray()
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
    const client = await clientPromise
    const Completion = await client.db().collection('completion')
    const insertRes = await Completion.insertOne(completion)
    if (insertRes.acknowledged) {
      console.log('save completion success', insertRes)
      return insertRes
    } else {
      console.log('save completion failed', insertRes)
    }
  } catch (error) {
    console.log('save completion error', error)
  }
}

export async function checkQueryCount(user: UserSession, fingerprint: string) {
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

export async function queryCompletion(filter: any) {
  try {
    const client = await clientPromise
    const Completion = await client.db().collection('completion')
    const result = await Completion.find(filter).sort({ createAt: -1}).limit(MAX_COMPLETION_QUERY_COUNT).toArray()
    return result
  } catch (error) {
    console.error('get completion error', error)
    return []
  }
}