import { withIronSessionApiRoute } from 'iron-session/next';
import { OpenAIStream, OpenAIStreamPayload } from "../../../utils/OpenAIStream";
import { sessionOptions } from "@/lib/session";
import { NextApiRequest, NextApiResponse } from "next";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<Response> => {
  const { prompt, isStream = true } = req.body || {};

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
    max_tokens: 1000,
    stream: true,
    n: 1,
  };
  //TODO WX调用需要传用户信息
  const stream = await OpenAIStream(payload, req.session.user);
  if (isStream) {
    // set response headers
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Transfer-Encoding", "chunked");
    // send the stream as response body
    res.status(200).write(stream);
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

export default withIronSessionApiRoute(handler, sessionOptions);
