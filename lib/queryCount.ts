/** TODO: redis代替memory-cache */
/** TODO: 购买套餐之后需要刷新剩余查询次数 */

import User, { IUser, UserPricing } from "@/models/User";
import { UserSession } from "pages/api/user/user";
import cache from "memory-cache";
import Completion from "@/models/Completion";
import MJMessage from "@/models/MJMessage";
import dbConnect from "./dbConnect";
import { getTodayTime } from "../utils";
import {
  LOGIN_MAX_QUERY_COUNT,
  LOGIN_MJ_MAX_QUERY_COUNT,
  UNLOGIN_MAX_QUERY_COUNT,
  UNLOGIN_MJ_MAX_QUERY_COUNT,
} from "@/utils/constants";

type ModelType = "chatGPT" | "midjourney";
type SchemaModel = typeof Completion | typeof MJMessage;
type QueryParams = {
  userId: string;
  fingerprint: string;
  startAt: string | number | Date;
  endAt: string | number | Date;
  model: SchemaModel;
};

const COMPLETION_COUNT_CACHE_TIME = 1000 * 60 * 60 * 24; // 1天

export function getCompletionCountCacheKey(userId: string, type: ModelType) {
  return `completion_${type}_count_${userId}`;
}

async function getQueryCount(
  user: UserSession,
  type: ModelType,
  model: SchemaModel
) {
  const { pricings, _id: userId, fingerprint, isLoggedIn } = user;
  const cacheKey = getCompletionCountCacheKey(userId, type);
  const cacheCount = cache.get(cacheKey);

  let pricing: UserPricing | undefined;
  let userInfo: IUser | null = null;

  /** 先从缓存中读取次数 */
  if (cacheCount || cacheCount === 0) {
    return cacheCount as number;
  }

  const getPricing = (pricings: UserPricing[] = []) => {
    return pricings.find(
      (item) => item.type === type && item.endAt > Date.now()
    );
  };

  /** 获取套餐信息 */
  if (pricings && pricings.length) {
    /** 从session中查看套餐信息 */
    pricing = getPricing(pricings);
  } else {
    /** session中查不到套餐信息，查库 */
    await dbConnect();
    const user = await User.findOne<IUser>({ userId });
    userInfo = user;
    pricing = getPricing(user?.pricings);
  }

  /**
   * ***********************************************
   * ***************** 免费次数逻辑 ******************
   * ***********************************************
   */
  let freeCount = 0;

  if (type === 'chatGPT') {
    const todayQueryCount = await queryTodayQueryCount(
      userId,
      fingerprint,
      Completion
    );
    if (isLoggedIn) {
      /** 已登陆用户每日可免费查询次数 */
      freeCount = LOGIN_MAX_QUERY_COUNT - todayQueryCount;
    } else {
      /** 未登陆用户每日可免费查询次数 */
      freeCount = UNLOGIN_MAX_QUERY_COUNT - todayQueryCount;
    }
  } else {
    const result = await model.aggregate([
      {
        $match: {
          $or: [{ userId }, { fingerprint }]
        },
      },
      {
        $count: "count",
      },
    ]);
    const mjQueryCount = (result?.[0]?.count as number) ?? 0;
    if (!userId) {
      freeCount = UNLOGIN_MJ_MAX_QUERY_COUNT - mjQueryCount;
    } else {
      freeCount = LOGIN_MJ_MAX_QUERY_COUNT - mjQueryCount;
    }
  }
  /**
   * ***********************************************
   * ***************** 免费次数逻辑 ******************
   * ***********************************************
   */

  /** 套餐剩余次数 */
  if (pricing) {
    const count = await queryPricingCount({
      userId,
      fingerprint,
      model,
      pricing,
    });
    cache.put(cacheKey, count, COMPLETION_COUNT_CACHE_TIME);
    return count + freeCount;
  }
  return freeCount;
}

/** 获取套餐剩剩余查询次数 */
const queryPricingCount = async ({
  userId,
  fingerprint,
  pricing,
  model,
}: Omit<QueryParams, "startAt" | "endAt"> & { pricing: UserPricing }) => {
  const queryCount = await getQueryRecordCount({
    userId,
    fingerprint,
    startAt: new Date(pricing.startAt),
    endAt: new Date(pricing.endAt),
    model,
  });
  const count = pricing.queryCount - queryCount;
  return count;
};

/** 查询入库记录次数 */
const getQueryRecordCount = async ({
  userId,
  fingerprint,
  model,
  startAt,
  endAt,
}: QueryParams) => {
  const result = await model.aggregate([
    {
      $match: {
        $or: [{ userId }, { fingerprint }],
        createAt: {
          $gte: startAt,
          $lte: endAt,
        },
      },
    },
    {
      $count: "count",
    },
  ]);
  return (result?.[0]?.count as number) ?? 0;
};

/** 查询今日已使用服务次数 */
const queryTodayQueryCount = async (
  userId: string,
  fingerprint: string,
  model: SchemaModel
) => {
  try {
    const [todayStartCST, todayEndCST] = getTodayTime();
    const count = await getQueryRecordCount({
      userId,
      fingerprint,
      startAt: new Date(todayStartCST),
      endAt: new Date(todayEndCST),
      model,
    });
    return count;
  } catch (e) {
    return 0;
  }
};

/** 减少次数，刷新缓存 */
export function minusCount(id: string, type: ModelType) {
  const cacheKey = getCompletionCountCacheKey(id, type);
  const cacheCount = cache.get(cacheKey);
  cache.put(cacheKey, cacheCount - 1, COMPLETION_COUNT_CACHE_TIME);
}

/** 刷新缓存 */
export function updateCount() {}

export default getQueryCount;
