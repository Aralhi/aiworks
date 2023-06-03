import { withIronSessionApiRoute } from 'iron-session/next';
import { sessionOptions } from "@/lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import Conversation from '@/models/Conversation';
import { FINGERPRINT_KEY, MAX_CONVERSATION_COUNT } from '@/utils/constants';
import { checkQueryCount, getPayload } from '@/lib/completion';
import { UserSession } from '../user/user';

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
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
  const { payload, plaintext, token } = await getPayload({
    prompt,
    conversationId: conversationId || newConversationId,
    fingerprint,
    isStream,
    userId,
  })
  res.setHeader('Authorization', `Bearer ${token}`)
  return res.json({
    status: 'ok',
    data: {
      payload,
      conversationId: newConversationId,
      plaintext
    }
  })
};

export default withIronSessionApiRoute(handler, sessionOptions);
