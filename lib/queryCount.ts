import User, { IUser, UserPricing } from "@/models/User";
import { UserSession } from "pages/api/user/user";
import cache from "memory-cache";
import Completion from "@/models/Completion";
import MJMessage from "@/models/MJMessage";
import dbConnect from "./dbConnect";

const COMPLETION_COUNT_CACHE_TIME = 1000 * 60 * 60 * 24; // 1小时

async function getQueryCount(
  user: UserSession,
  type: "chatGPT" | "midjourney",
  model: typeof Completion | typeof MJMessage
) {
  const { pricings, _id } = user;
  const cacheKey = getCompletionCountCacheKey(_id, type);
  const cacheCount = cache.get(cacheKey);

  let pricing: UserPricing | undefined;

  /** 先从缓存中读取次数 */
  if (cacheCount || cacheCount === 0) {
    return cacheCount as number;
  }

  const getPricing = (pricings: UserPricing[] = []) => {
    return pricings.find(
      (item) => item.type === type && item.endAt > Date.now()
    );
  };

  if (pricings && pricings.length) {
    /** 从session中查看套餐信息 */
    pricing = getPricing(pricings);
  } else {
    /** session中查不到套餐信息，查库 */
    await dbConnect();
    const user = await User.findOne<IUser>({ _id });
    pricing = getPricing(user?.pricings);
  }
  if (pricing) {
    const result = await model.aggregate([
      {
        $match: {
          $or: [{ userId: _id }],
          createAt: {
            $gte: new Date(pricing.startAt).toUTCString(),
            $lte: new Date(pricing.endAt).toUTCString(),
          },
        },
      },
      {
        $count: "count",
      },
    ]);
    const count = !result.length
      ? pricing.queryCount
      : (result[0]?.count as number) || 0;
    cache.put(
      getCompletionCountCacheKey(_id, type),
      count,
      COMPLETION_COUNT_CACHE_TIME
    );
    return count;
  } else {
    return 0;
  }
}

export function getCompletionCountCacheKey(
  userId: string,
  type: "chatGPT" | "midjourney"
) {
  return `completion_${type}_count_${userId}`;
}

export default getQueryCount;
