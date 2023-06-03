import Completion, { ICompletion } from "@/models/Completion";
import { getTodayTime } from "../utils";
import dbConnect from "./dbConnect";
import cache from 'memory-cache'
import User, { UserPricing } from "@/models/User";
import { LOGIN_MAX_QUERY_COUNT, MAX_TOKEN, UNLOGIN_MAX_QUERY_COUNT } from "@/utils/constants";
import { UserSession } from "pages/api/user/user";
import Settings from "@/models/Settings";
import { encrypt } from "./crypto";

const COMPLETION_COUNT_CACHE_TIME = 1000 * 60 * 60 * 24 // 1小时

type ChatGPTAgent = "user" | "system" | "assistant";
export const CHAT_CONTEXT_PRE = 'chat_context_'

export interface chatContext {
  question: string,
  answer: string
}

export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}
export interface OpenAIStreamPayload {
  model: string;
  messages: ChatGPTMessage[];
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
}

async function getContext(conversationId: string, fingerprint: string) {
  let messages: ChatGPTMessage[] = []
  if (!conversationId && !fingerprint) {
    return []
  }
  // 未登录用户用哦fingerPrint做为key，让用户享受到上下文功能
  const key = `${CHAT_CONTEXT_PRE}${conversationId || fingerprint}`
  const chatContextArr: chatContext[] =  cache.get(key) || [];
  // 取最近两个问题做为上下文记忆, 如果考虑节省token，可以取最近一个问题做为上下文记忆
  if (!chatContextArr.length) {
    await dbConnect()
    const settings = await Settings.findOne({
      key
    })
    if (settings?.value) {
      chatContextArr.push(...JSON.parse(settings.value))
    }
  }
  const lastTwoQuestions: chatContext[] = chatContextArr.slice(-2);
  lastTwoQuestions.forEach((ele: chatContext) => {
    messages.push({
      role: 'user',
      content: ele.question
    }, {
      role: 'assistant',
      content: ele.answer
    });
  });
  return messages
}

export async function getPayload({
  prompt,
  isStream,
  conversationId,
  fingerprint,
  userId
}: {
  prompt: string;
  isStream: boolean;
  conversationId: string;
  fingerprint: string;
  userId: string;
}) {
  console.log('getPayload', prompt, isStream, conversationId, fingerprint, userId)
  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: !isStream ? MAX_TOKEN / 2 : MAX_TOKEN, // 非流式请求最大token数为流式请求的一半，防止一次请求返回太多数据，场景主要是微信调用
    stream: !!isStream,
    n: 1,
  };
  // 获取上下文记忆
  const messages = await getContext(conversationId, fingerprint);
  payload.messages = messages.concat(payload.messages);
  const plaintext = userId || fingerprint
  const token = encrypt(plaintext)
  return {
    payload,
    plaintext,
    token
  }
}

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
    console.log('insert completion success', insertRes._id)
  } catch (error) {
    console.error('insert completion error', error)
  }
}

export async function checkQueryCount(user: UserSession, fingerprint: string = '') {
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