import MJMessage, { IMJMessage } from "@/models/MJMessage";
import dbConnect from "./dbConnect";
import { getTodayTime } from "../utils";
import Completion from "@/models/Completion";
import User, { UserPricing } from "@/models/User";
import cache from "memory-cache";
import { UserSession } from "pages/api/user/user";

const COMPLETION_COUNT_CACHE_TIME = 1000 * 60 * 60 * 24; // 1小时

export async function insertMessage(message: IMJMessage) {
  try {
    await dbConnect();
    const result = await new MJMessage(message).save();
    return { status: "ok", data: result };
  } catch (e) {
    console.error("insert midjourney message failed!", e);
    return { status: "failed" };
  }
}

export async function checkQueryCount(user: UserSession, fingerprint: string) {
  // TODO: 兼容微信调用，用openid
  if (!user && !fingerprint) {
    return { status: "ok" };
  }
  const { isLoggedIn, pricings, _id: userId } = user || {};
  const pricing: UserPricing | undefined = pricings?.find(
    (item: UserPricing) => item.name === "midjourney" && item.endAt > Date.now()
  );
  if (isLoggedIn && pricing && userId) {
    const count = await queryPricingCompletionCount(userId);
    if (count >= pricing.queryCount) {
      return { status: "failed", message: "您的套餐内查询次数已用完" };
    }
  }
  return { status: "ok" };
}

export async function queryTodayCompletionCount(
  userId: string = "",
  fingerprint: string = ""
) {
  try {
    await dbConnect();
    const [todayStartCST, todayEndCST] = getTodayTime();
    const result = await Completion.aggregate([
      {
        $match: {
          $or: [{ userId }, { fingerprint }],
          createAt: {
            $gte: new Date(todayStartCST),
            $lte: new Date(todayEndCST),
          },
        },
      },
      {
        $count: "count",
      },
    ]);
    return result[0]?.count || 0;
  } catch (error) {
    console.error("get completion today count error", error);
    return 0;
  }
}

export function getCompletionCountCacheKey(userId: string) {
  return `completion_mj_count_${userId}`;
}

export async function queryPricingCompletionCount(userId: string) {
  // 数据库插入的地方也要更新缓存
  const cacheCount = cache.get(getCompletionCountCacheKey(userId));
  if (cacheCount || cacheCount === 0) {
    return cacheCount;
  }
  try {
    await dbConnect();
    const user = await User.findOne({ _id: userId });
    const pricings = user?.pricings || [];
    const pricing: UserPricing = pricings?.find(
      (item: UserPricing) =>
        item.name === "midjourney" && item.endAt > Date.now()
    );
    if (pricing) {
      const result = await Completion.aggregate([
        {
          $match: {
            $or: [{ userId }],
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
      const count = result[0]?.count || 0;
      cache.put(
        getCompletionCountCacheKey(userId),
        count,
        COMPLETION_COUNT_CACHE_TIME
      );
      return count;
    }
  } catch (error) {
    console.error("get completion pricing count error", error);
    return 0;
  }
}
