import { message } from 'antd';
import { saveCompletion } from "@/lib/completion";
import { sessionOptions } from "@/lib/session";
import { FINGERPRINT_KEY } from "@/utils/constants";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import cache from 'memory-cache'
import { CHAT_CONTEXT_PRE, chatContext } from "./check";
import dbConnect from "@/lib/dbConnect";
import Settings from "@/models/Settings";
const CHAT_CONTEXT_CACHE_TIME = 5 * 60 * 1000 // 1小时

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // chatGPT请求完的回调，写入数据库及更新上下文缓存
  const { conversationId, payload, chatId = '', content, usage } = req.body || {}
  const { user } = req.session
  try {
    // 内容全部返回完成, 将本次返回内容记录到缓存
    const fingerprint = user?._id ? '' : req.headers[FINGERPRINT_KEY] as string
    setContext(conversationId, fingerprint, payload.messages[payload.messages.length - 1].content, content)
    // 未登录用户记录用户的fingerPrint
    await saveCompletion({
      userId: user?._id || '',
      prompt: payload.messages[payload.messages.length - 1].content,
      role: payload.messages[0].role,
      stream: payload.stream,
      chatId,
      model: payload.model,
      conversationId,
      content,
      usage,
      fingerprint
    })
    return res.json({ status: 'ok' })
  } catch (e) {
    console.error('insert completion failed', e)
    return res.status(500).json({ status: 'error', message: '更新问答失败' })
  }
}

async function setContext(conversationId: string, fingerprint: string, question: string, answer: string) {
  if (!conversationId && !fingerprint) {
    return []
  }
  const key = `${CHAT_CONTEXT_PRE}${conversationId || fingerprint}`
  const chatContextArr: chatContext[] =  cache.get(key) || [];
  chatContextArr.push({
    question,
    answer
  });
  //TODO: 考虑文本内容可能超大，设置较短缓存过期时间，过期从数据库中读取。
  cache.put(key, chatContextArr, CHAT_CONTEXT_CACHE_TIME)
  await dbConnect()
  Settings.findOneAndUpdate({
    key
  }, {
    key,
    value: JSON.stringify(chatContextArr),
  }, {
    upsert: true
  })
}

export default withIronSessionApiRoute(handler, sessionOptions)