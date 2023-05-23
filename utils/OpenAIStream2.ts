import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import { UserSession } from 'pages/api/user/user';
import { FINGERPRINT_KEY } from "./constants";
import cache from 'memory-cache'
import { saveCompletion } from "@/lib/completion";

const MAX_STRING_LENGTH = 2 * 1024 // 2K
const CHAT_CONTEXT_PRE = 'chat_context_'
const CHAT_CONTEXT_CACHE_TIME = 5 * 60 * 1000 // 1小时

export type ChatGPTAgent = "user" | "system" | "assistant";

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

interface chatContext {
  question: string,
  answer: string
}

export async function OpenAIStream(payload: OpenAIStreamPayload, request: any, user: any, conversationId: string) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
   console.log('09090909', request.headers.get(FINGERPRINT_KEY))
  let counter = 0;

  // 获取上下文记忆
  const messages = getContext(conversationId, request.headers.get(FINGERPRINT_KEY));

console.log(messages, '0000000')

  payload.messages = messages.concat(payload.messages);
console.log(payload);
  function getResponseByProd() {
    return fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
      },
      body: JSON.stringify(payload),
    });
  }

  function getResponseByDev() {
    return fetch('https://www.ai-works.cn/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: payload.messages[payload.messages.length - 1].content,
        isStream: payload.stream
      })
    })
  }

  const res = process.env.NODE_ENV === 'development' ? await getResponseByDev() : await getResponseByProd()
console.log(res);
  let contents: Array<string> = []
  let chatId: string = ''

  const stream = new ReadableStream({
    async start(controller) {
      // callback
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === "[DONE]") {
            controller.close();
            completionCallback({ payload, request, content: contents.join(''), user, chatId, conversationId })
            return;
          }
          try {
            const json = JSON.parse(data);
            chatId = json.id
            const text = json.choices[0].delta?.content || "";
            // if (counter < 2 && (text.match(/\n/) || []).length) {
            //   // this is a prefix character (i.e., "\n\n"), do nothing
            //   return;
            // }
            contents.push(text);
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            // counter++;
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

function getContext(conversationId: string, fingerprint: string) {
  let messages: ChatGPTMessage[] = []
  if (!conversationId && !fingerprint) {
    return []
  }
  // 未登录用户用哦fingerPrint做为key，让用户享受到上下文功能
  const key = `${CHAT_CONTEXT_PRE}${conversationId || fingerprint}`
  const chatContextArr: chatContext[] =  cache.get(key) || [];
  // 取最近两个问题做为上下文记忆, 如果考虑节省token，可以取最近一个问题做为上下文记忆
  if (chatContextArr.length < 1) {
    return []
  }
  const lastTwoQuestions: chatContext[] = chatContextArr.slice(-2);
  lastTwoQuestions.forEach((ele: chatContext) => {
    messages.push({
      role: 'user',
      content: ele.question
    }, {
      role: 'assistant',
      content: ele.answer
    });
  });
  return messages
}

function setContext(conversationId: string, fingerprint: string, question: string, answer: string) {
  if (!conversationId && !fingerprint) {
    return []
  }
  const key = `${CHAT_CONTEXT_PRE}${conversationId || fingerprint}`
  const chatContextArr: chatContext[] =  cache.get(key) || [];
  chatContextArr.push({
    question,
    answer
  });
  //TODO: 考虑文本内容可能超大，设置较短缓存过期时间，过期从数据库中读取。
  cache.put(key, chatContextArr, CHAT_CONTEXT_CACHE_TIME)
  console.log('set cache success', key)
}

async function completionCallback({ payload, request, content, user, chatId, conversationId, usage }: {
  payload: OpenAIStreamPayload,
  request: any
  content: string,
  user?: UserSession,
  chatId: string,
  conversationId: string,
  usage?: any
}) {
  try {
    console.log('completionCallback', payload)
    // 内容全部返回完成, 将本次返回内容记录到缓存
    const fingerprint = user?._id ? '' : request.headers.get(FINGERPRINT_KEY);
    setContext(conversationId, fingerprint, payload.messages[payload.messages.length - 1].content, content)
    // 未登录用户记录用户的fingerPrint
    await saveCompletion({
      userId: user?._id || '',
      prompt: payload.messages[payload.messages.length - 1].content,
      role: payload.messages[0].role,
      stream: payload.stream,
      chatId,
      model: payload.model,
      conversationId,
      content,
      usage,
      fingerprint
    })
  } catch (e) {
    console.error('insert completion failed', e)
  }
}