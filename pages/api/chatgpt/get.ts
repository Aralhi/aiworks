import { withIronSessionApiRoute } from 'iron-session/next';
import { OpenAIStream, OpenAIStreamPayload } from "../../../utils/OpenAIStream";
import { sessionOptions } from "@/lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import { FINGERPRINT_KEY, MAX_CONVERSATION_COUNT, MAX_TOKEN } from '@/utils/constants';
import { checkQueryCount } from '@/lib/completion';
import { UserSession } from '../user/user';
import { countDocuments, insertOne } from '@/lib/db';

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { prompt, conversationId, conversationName, isStream = true } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: "No prompt in the request" });
  }
  const user = req.session.user as UserSession
  const { _id: userId } = user
  // 校验queryCount
  const { status, message } = await checkQueryCount(user, req.headers[FINGERPRINT_KEY] as string)
  if (status !== 'ok') {
    return res.status(200).json({ status, message })
  }
  // 没conversationId先创建一条conversation，后续的completion都关联到这个conversation
  let newConversationId
  // 登录了才创建会话
  if (userId && !conversationId && conversationName) {
    // 查询历史会话格式
    const count = await countDocuments('conversation', { userId }) || 0
    if (count < MAX_CONVERSATION_COUNT) {
      try {
        const newDoc = await insertOne('conversation', {
          userId,
          name: conversationName,
        })
        console.log('insert conversation success:', newDoc)
        newConversationId = newDoc?.insertedId
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
  if (isStream) {
    // set response headers
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader("Transfer-Encoding", "chunked");
  }
  //TODO WX调用需要传用户信息
  const stream = await OpenAIStream({
    payload, request: req, response: res, conversationId: conversationId || newConversationId, user: req.session.user
  });

  return stream

};

export default withIronSessionApiRoute(handler, sessionOptions);
