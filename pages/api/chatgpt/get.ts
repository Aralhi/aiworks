import { withIronSessionApiRoute } from 'iron-session/next';
import { OpenAIStream, OpenAIStreamPayload } from "../../../utils/OpenAIStream";
import { sessionOptions } from "@/lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import Conversation from '@/models/Conversation';
import { MAX_CONVERSATION_COUNT, MAX_TOKEN } from '@/utils/constants';

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { prompt, conversationId, conversationName, isStream = true } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: "No prompt in the request" });
  }
  // 没conversationId先创建一条conversation，后续的completion都关联到这个conversation
  let newConversationId
  if (!conversationId && conversationName) {
    const { _id: userId } = req.session.user || {}
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
  await OpenAIStream(payload, res, conversationId || newConversationId, req.session.user);
};

export default withIronSessionApiRoute(handler, sessionOptions);
