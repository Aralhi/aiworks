import { model } from 'mongoose';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import Completion, { ICompletion } from '@/models/Completion';
import { UserSession } from 'pages/api/user/user';

const MAX_STRING_LENGTH = 2 * 1024 // 2K

export type ChatGPTAgent = "user" | "system";

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

export async function OpenAIStream(payload: OpenAIStreamPayload, user?: UserSession) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });
  let contents: Array<string> = []
  let id: string = ''
  let created: number = 0
  let model: string = ''
  const stream = new ReadableStream({
    async start(controller) {
      // callback
      async function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === "[DONE]") {
            controller.close();
            // // 插入数据库
            // const completion = {
            //   userId: user?._id,
            //   prompt: payload.messages[0].content,
            //   id,
            //   model,
            //   created,
            //   content: contents.join('')
            // }
            // try {
            //   const insertRes = await new Completion(completion).save()
            //   console.log('insert completion success', insertRes)
            // } catch (e) {
            //   console.error('insert completion failed', e)
            // }
            return;
          }
          try {
            const json = JSON.parse(data);
            id = json.id
            created = json.created
            model = json.model
            const text = json.choices[0].delta?.content || "";
            if (counter < 2 && (text.match(/\n/) || []).length) {
              // this is a prefix character (i.e., "\n\n"), do nothing
              return;
            }
            contents.push(text)
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            // maybe parse error
            controller.error(e);
          }
        }
      }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser = createParser(onParse);
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });
  return stream
}
