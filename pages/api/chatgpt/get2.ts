import { OpenAIStream, OpenAIStreamPayload } from "../../../utils/OpenAIStream2";
import { getIronSession } from 'iron-session/edge';
import { sessionOptions } from "@/lib/session";
import { NextApiRequest, NextApiResponse } from "next";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

const handler = async (req:any, res:any) => {
  const session = await getIronSession(req, res, sessionOptions)
console.log(session.user);
  const { prompt, conversationId, conversationName, isStream = true } = (await req.json()) as {
    prompt?: string;
    conversationId?: string;
    conversationName?: string;
    isStream?: boolean;
  };

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
    stream: true,
    n: 1,
  };
  const startTime = Date.now();
  const stream = await OpenAIStream(payload);
  console.log('stream...', stream);
  if (isStream) {
    console.log('chatgpt response:', isStream, Date.now() - startTime)
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
