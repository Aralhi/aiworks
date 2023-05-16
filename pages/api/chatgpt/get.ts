import { withIronSessionApiRoute } from 'iron-session/next';
import { OpenAIStream, OpenAIStreamPayload } from "../../../utils/OpenAIStream";
import { sessionOptions } from "@/lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import Conversation from '@/models/Conversation';
import { LOGIN_MAX_QUERY_COUNT, MAX_CONVERSATION_COUNT, MAX_TOKEN, UNLOGIN_MAX_QUERY_COUNT } from '@/utils/constants';
import dbConnect from '@/lib/dbConnect';
import Completion from '@/models/Completion';
import { getTodayTime } from '@/utils/index';
import { queryCompletionCount } from '@/lib/completion';

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { prompt, conversationId, conversationName, isStream = true } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: "No prompt in the request" });
  }
  // 限制未登录和未购买的请求次数
  const { isLoggedIn, pricing } = req.session.user || {}
  if ((!isLoggedIn || !pricing) && process.env.NODE_ENV === 'production') {
    try {
      const { _id: userId, fingerprint } = req.session.user || {}
      const count = await queryCompletionCount(userId, fingerprint)
      if (isLoggedIn && count >= LOGIN_MAX_QUERY_COUNT){
        res.setHeader('Content-type', 'application/json')
        return res.json({ status: 'failed', message: "您的免费次数已用完" });
      } else if (!isLoggedIn && count >= UNLOGIN_MAX_QUERY_COUNT) {
        res.setHeader('Content-type', 'application/json')
        return res.json({ status: 'failed', message: "未登录用户最大查询三次" });
      }
    } catch (error) {
      console.error('get completion count error', error)
    }
  }

  const { _id: userId } = req.session.user || {}
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
    max_tokens: MAX_TOKEN,
    stream: !!isStream,
    n: 1,
  };
  if (isStream) {
    // set response headers
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Transfer-Encoding", "chunked");
  }
  //TODO WX调用需要传用户信息
  const stream = await OpenAIStream({
    payload, request: req, response: res, conversationId: conversationId || newConversationId, user: req.session.user
  });
  return stream
};

export default withIronSessionApiRoute(handler, sessionOptions);
