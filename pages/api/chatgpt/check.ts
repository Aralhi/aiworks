import { withIronSessionApiRoute } from 'iron-session/next';
import { sessionOptions } from "@/lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import { FINGERPRINT_KEY } from '@/utils/constants';
import { checkQueryCount, createConversation, getPayload } from '@/lib/completion';
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
  const { status, message, label } = await checkQueryCount(user, fingerprint)
  if (status !== 'ok') {
    return res.status(200).json({ status, message, label })
  }
  // 没conversationId先创建一条conversation，后续的completion都关联到这个conversation
  const newConversationId = await createConversation(userId, conversationId, conversationName)
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
