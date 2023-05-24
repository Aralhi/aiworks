import { getIronSession } from 'iron-session/edge';
import { OpenAIStream, OpenAIStreamPayload } from "../../../utils/OpenAIStream2";
import { sessionOptions } from "@/lib/session";
import { FINGERPRINT_KEY, MAX_CONVERSATION_COUNT, MAX_TOKEN } from '@/utils/constants';
import { checkQueryCount } from '@/lib/completion';
import { UserSession } from '../user/user';
import { countDocuments, insertOne } from '@/lib/db';

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

const handler = async (req: Request, res: Response) => {
  console.log('...get in get2')
  const session = await getIronSession(req, res, sessionOptions)

  const { prompt, conversationId, conversationName, isStream = true } = (await req.json()) as {
    prompt?: string;
    conversationId?: string;
    conversationName?: string;
    isStream?: boolean;
  };

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }
  const user = session.user as UserSession
  const { _id: userId } = user
  const fingerprint = req.headers.get(FINGERPRINT_KEY) || ''
  // 校验queryCount
  const { status, message } = await checkQueryCount(user, fingerprint)
  if (status !== 'ok') {
    return new Response(JSON.stringify({ status, message }), {
      status: 200,
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      }
    });
  }
  // 没conversationId先创建一条conversation，后续的completion都关联到这个conversation
  let newConversationId;
  // // 登录了才创建会话
  if (userId && !conversationId && conversationName) {
    // 查询历史会话格式
    const count = await countDocuments('conversation', { userId }) || 0
    if (count < MAX_CONVERSATION_COUNT) {
      const newDoc = await insertOne('conversation', {
        userId,
        name: conversationName,
      })
      newConversationId = newDoc?.insertedId.toString()
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
  const startTime = Date.now();
  // //TODO WX调用需要传用户信息
  // const stream = await OpenAIStream({ payload, request: req, conversationId: conversationId || newConversationId, user: session.user });
  const stream = await OpenAIStream({
    payload,
    conversationId: conversationId || newConversationId || '',
    fingerprint,
    user: session.user
  });
  if (isStream) {
    return new Response(stream);
  }
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';
  let { done, value } = await reader.read();
  result += value;
  while (!done) {
    const temp = await reader.read();
    done = temp.done;
    value = decoder.decode(temp.value);
    result += value;
  }
  return new Response(result, {
    status: 200,
    headers: {
      'content-type': 'application/json'
    }
  })

};

export default handler;
