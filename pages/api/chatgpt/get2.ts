// import { withIronSessionApiRoute } from 'iron-session/next';
import { getIronSession } from 'iron-session/edge';
import { OpenAIStream, OpenAIStreamPayload } from "../../../utils/OpenAIStream2";
import { sessionOptions } from "@/lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import Conversation from '@/models/Conversation';
import { FINGERPRINT_KEY, MAX_CONVERSATION_COUNT, MAX_TOKEN } from '@/utils/constants';
import { checkQueryCount } from '@/lib/completion';

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

const handler = async (req:any, res:any) => {
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

  const { _id: userId } = session.user || {}
  // 校验queryCount
  // const { status, message } = await checkQueryCount(req, res)
  // if (status !== 'ok') {
  //   return res.status(200).json({ status, message })
  // }
  // 没conversationId先创建一条conversation，后续的completion都关联到这个conversation
  // let newConversationId;
  // // // 登录了才创建会话
  // if (userId && !conversationId && conversationName) {
  //   // 查询历史会话格式
  //   const count = await Conversation.countDocuments({ userId })
  //   if (count < MAX_CONVERSATION_COUNT) {
  //     try {
  //       const newDoc = await Conversation.create({
  //         userId,
  //         name: conversationName,
  //       })
  //       console.log('insert conversation success:', newDoc)
  //       newConversationId = newDoc._id
  //     } catch (error) {
  //       console.log('insert conversation error:', error)
  //     }
  //   }
  // }
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
  const stream = await OpenAIStream(payload, req, session.user);
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
  console.log('chatgpt response:', isStream, Date.now() - startTime, result)
  return new Response(result, {
    status: 200,
    headers: {
      'content-type': 'application/json'
    }
  })

};

export default handler;
