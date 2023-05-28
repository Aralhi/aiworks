import { withIronSessionApiRoute } from 'iron-session/next';
import { sessionOptions } from "@/lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import Conversation from '@/models/Conversation';
import { FINGERPRINT_KEY, MAX_CONVERSATION_COUNT, MAX_TOKEN } from '@/utils/constants';
import { checkQueryCount } from '@/lib/completion';
import { UserSession } from '../user/user';
import dbConnect from '@/lib/dbConnect';
import cache from 'memory-cache'
import Settings from '@/models/Settings';
import { decrypt, encrypt } from '@/lib/crypto';

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}
export const CHAT_CONTEXT_PRE = 'chat_context_'
type ChatGPTAgent = "user" | "system" | "assistant";

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

export interface chatContext {
  question: string,
  answer: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { prompt, conversationId, conversationName, isStream = true } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: "No prompt in the request" });
  }
  const user = req.session.user as UserSession || {}
  const { _id: userId } = user
  const fingerprint = req.headers[FINGERPRINT_KEY] as string
  // 校验queryCount
  const { status, message } = await checkQueryCount(user, fingerprint)
  if (status !== 'ok') {
    return res.status(200).json({ status, message })
  }
  // 没conversationId先创建一条conversation，后续的completion都关联到这个conversation
  let newConversationId
  // 登录了才创建会话
  if (userId && !conversationId && conversationName) {
    // 查询历史会话格式
    const count = await Conversation.countDocuments({ userId })
    if (count < MAX_CONVERSATION_COUNT) {
      try {
        const newDoc = await Conversation.create({
          userId,
          name: conversationName,
        })
        console.log('insert conversation success:', newDoc)
        newConversationId = newDoc._id
      } catch (error) {
        console.log('insert conversation error:', error)
      }
    }
  }
  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
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
  const auth = encrypt(plaintext)
  //TODO WX调用需要传用户信息
  res.setHeader('Authorization', `Bearer ${auth}`)
  return res.json({
    status: 'ok',
    data: {
      payload,
      conversationId: newConversationId,
      plaintext
    }
  })
};

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

export default withIronSessionApiRoute(handler, sessionOptions);
