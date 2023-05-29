import React, { useEffect, useState } from 'react';
import { Input, Button, List, Image, Typography, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import MJOptsPanel, { MJArgsType } from '@/components/MJOptsPanel';
import Tags from '@/components/MJOptsPanel/Tags';
import MJMessageSchema, { IMJMessage } from '@/models/MJMessage';
import { withIronSessionSsr } from 'iron-session/next';
import dbConnect from '@/lib/dbConnect';
import { sessionOptions } from '@/lib/session';
import { InferGetServerSidePropsType } from 'next';
import { FINGERPRINT_KEY } from '@/utils/constants';
import { getFingerprint } from '@/utils/index';
import fetchJson, { CustomResponseType } from '@/lib/fetchJson';
import { BasicModel } from 'types';
import { useRouter } from 'next/router';

const { TextArea } = Input;
const { Text } = Typography;

type MJMessageType = 'imagine' | 'upscale' | 'variation';
type MidjourneyMessage = BasicModel<IMJMessage>;

const defaultImg =
  'data:image/png;base64,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';

function getMatchValue(str: string, key: string) {
  const regex = new RegExp(`"${key}":"(.*?)"`, 'g');
  let match;
  let lastUri = undefined;
  while ((match = regex.exec(str)) !== null) {
    lastUri = match[1];
  }
  return lastUri;
}

function Midjourney({ historyList }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [inputValue, setInputValue] = useState('');
  const [inputDisable, setInputDisable] = useState(false);
  const [messages, setMessages] = useState<Partial<MidjourneyMessage>[]>(historyList);
  const [args, setArgs] = useState<MJArgsType[]>([]);

  const router = useRouter();

  const fetchMJ = async (type: MJMessageType, payload: Record<string, any>, newItem: Partial<MidjourneyMessage>) => {
    const checkRes = await fetch('/api/mj/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [FINGERPRINT_KEY]: await getFingerprint(),
      },
    });
    const checkResult = await checkRes.json();

    if (checkRes.status === 400) {
      router.push({ pathname: 'login', query: Object.assign({}, router.query, { originUrl: router.pathname }) });
      return;
    }
    if (checkResult.status !== 'ok') {
      message.warning(checkResult.message);
      router.push({ pathname: 'pricing', query: Object.assign({}, router.query, { originUrl: router.pathname }) });
      return;
    }
    if (checkResult && checkResult.status === 'ok' && checkResult.data.plaintext) {
      setMessages([...messages, newItem]);
      const token = checkRes.headers.get('Authorization');
      const resp = await fetch(`https://api.aiworks.club/api/mj/${type}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          Authorization: `${token}`,
          'x-salai-plaintext': checkResult.data.plaintext,
          'Content-Type': 'application/json',
          [FINGERPRINT_KEY]: await getFingerprint(),
        },
        body: JSON.stringify(payload),
      });
      const data = resp.body;

      if (!data) return;

      const reader = data.getReader();
      const decoder = new TextDecoder();
      const messageIdx = messages.length;
      // const tempUriArr: string[] = [];

      let done = false;
      let mjMessage: Partial<IMJMessage> = {
        type: newItem.type,
        prompt: newItem.prompt,
        progress: newItem.progress,
        msgId: newItem.msgId,
        msgHash: newItem.msgHash,
      };

      const recordResult = await fetchJson<CustomResponseType>('/api/mj/record', {
        method: 'POST',
        body: JSON.stringify(mjMessage),
      });
      const record = recordResult.data as MidjourneyMessage;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        const chunkValue = decoder.decode(value);
        const mjUri = getMatchValue(chunkValue, 'uri');
        const mjProgress = getMatchValue(chunkValue, 'progress');
        const mjHash = getMatchValue(chunkValue, 'hash');
        const mjId = getMatchValue(chunkValue, 'id');
        const mjContent = getMatchValue(chunkValue, 'content');

        // let tempUri = '';

        /** 更新数据 */
        fetchJson(`/api/mj/update?id=${record._id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            img: mjUri,
            originImg: mjUri,
            content: mjContent,
            msgId: mjId,
            msgHash: mjHash,
            progress: mjProgress,
          }),
        });

        /** 服务代理请求图片返回数据流 */
        // if (uri) {
        //   const imgResp = await fetch(`https://api.aiworks.club/api/mj/?url=${encodeURIComponent(uri)}`, {
        //     method: 'GET',
        //     headers: {
        //       responseType: 'blob',
        //       Authorization: `${token}`,
        //       'x-salai-plaintext': checkResult.data.plaintext,
        //       [FINGERPRINT_KEY]: await getFingerprint(),
        //     },
        //   });
        //   const blob = await imgResp.blob();
        //   tempUri = URL.createObjectURL(blob);
        //   /** 未完成时的临时文件地址记录下来，完成时一并释放资源 */
        //   !doneReading && tempUriArr.push(tempUri);
        // }

        setMessages((state) => {
          const { img, progress, msgHash, prompt, msgId } = state[messageIdx];
          state[messageIdx] = {
            ...state[messageIdx],
            img: mjUri ?? img,
            progress: mjProgress ?? progress,
            msgId: mjId ?? msgId,
            msgHash: mjHash ?? msgHash,
            content: mjContent ?? prompt,
          };
          return [...state];
        });
      }

      /** 临时资源释放 */
      // tempUriArr.forEach((uri) => {
      //   URL.revokeObjectURL(uri);
      // });
    }
  };

  const handleMessageSend = async () => {
    let newMessage: Partial<IMJMessage> = {
      type: 'imagine',
      prompt: inputValue.trim(),
      progress: 'waiting start',
      img: defaultImg,
    };

    if (newMessage.prompt) {
      newMessage.prompt = `${newMessage.prompt} ${args
        .map((item) => `${item.arg} ${Array.isArray(item.value) ? item.value.join(' ') : item.value}`)
        .join(' ')}`;
      try {
        fetchMJ('imagine', { prompt: newMessage.prompt }, newMessage);
      } catch (e) {
        console.error(e);
      } finally {
        setInputValue('');
        setInputDisable(false);
      }
    }
  };

  const upscale = async (content: string, msgId: string, msgHash: string, index: number) => {
    const newMessage: Partial<IMJMessage> = {
      type: 'upscale',
      prompt: `${content} upscale U${index}`,
      progress: 'waiting start',
      img: defaultImg,
    };

    setInputDisable(true);

    try {
      fetchMJ('upscale', { content, index, msgId, msgHash }, newMessage);
    } catch (e) {
      console.error(e);
    } finally {
      setInputDisable(false);
    }
    setInputDisable(false);
  };

  const variation = async (content: string, msgId: string, msgHash: string, index: number) => {
    const newMessage: Partial<IMJMessage> = {
      type: 'variation',
      prompt: `${content} variation V${index}`,
      progress: 'waiting start',
      img: defaultImg,
    };
    setInputDisable(true);
    try {
      fetchMJ('variation', { content, index, msgId, msgHash }, newMessage);
    } catch (e) {
      console.error(e);
    } finally {
      setInputDisable(false);
    }
  };

  const renderMessage = ({ prompt, content, img, msgHash, progress, msgId, type }: Partial<MidjourneyMessage>) => {
    if (process.env.NEXT_PUBLIC_IMAGE_PREFIX) {
      img = img?.replace('https://cdn.discordapp.com/', process.env.NEXT_PUBLIC_IMAGE_PREFIX);
    }
    return (
      <List.Item
        className="flex flex-col text-white"
        style={{
          alignItems: 'start',
          justifyContent: 'start',
        }}
      >
        <Text className="text-white opacity-90 mb-1">
          <strong>{prompt}</strong> {`(${progress})`}
        </Text>
        <Image className="rounded-lg" width={350} height={350} src={img || defaultImg} />
        {progress === 'done' && type !== 'upscale' && (
          <>
            <Tags data={['U1', 'U2', 'U3', 'U4']} onItemClick={(tagNum) => upscale(String(content), String(msgId), String(msgHash), tagNum)} />
            <Tags data={['V1', 'V2', 'V3', 'V4']} onItemClick={(tagNum) => variation(String(content), String(msgId), String(msgHash), tagNum)} />
          </>
        )}
      </List.Item>
    );
  };

  useEffect(() => {
    if (messages.length) {
      const $mjList = document.querySelector<HTMLDivElement>('#mj-list');
      if ($mjList) {
        const { scrollHeight } = $mjList;
        $mjList.scrollTo({
          top: scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [messages.length]);

  return (
    <div className="w-full mx-auto px-4 h-screen overflow-y-hidden bg-[#303338] dark:text-gray-100 flex justify-center flex-col">
      <List id="mj-list" className="mx-auto alii w-3/4 xl:w-3/5 h-full overflow-y-auto" dataSource={messages} renderItem={renderMessage} />
      <div className="relative w-3/4 xl:w-3/5 mx-auto pb-5 pt-3">
        <MJOptsPanel onArgsChange={setArgs} />
        <TextArea
          className="w-full rounded-lg bg-[#373A3F] border-none text-white leading-5 pt-2 pb-2 pr-10 placeholder:text-white placeholder:text-opacity-50"
          disabled={inputDisable}
          value={inputValue}
          onChange={(e: any) => setInputValue(e.target.value)}
          onKeyDown={(e: any) => {
            if (e.key === 'Enter' && e.shiftKey) {
              setInputValue(`${inputValue}\n`);
              e.preventDefault();
            } else if (e.key === 'Enter') {
              handleMessageSend();
              e.preventDefault();
            }
          }}
          placeholder="Start typing your main idea..."
          autoSize={{ minRows: 1, maxRows: 6 }}
          style={{ boxShadow: 'unset' }}
        />
        <Button
          className="w-10 h-9 flex items-center justify-center absolute text-white bottom-5 right-0 opacity-70 text-lg border-none hover:opacity-100 hover:bg-none"
          onClick={handleMessageSend}
          loading={inputDisable}
          icon={<SendOutlined rev={undefined} className="text-white" />}
          title="Send"
        />
      </div>
    </div>
  );
}

export default Midjourney;

export const getServerSideProps = withIronSessionSsr(async ({ req }) => {
  try {
    await dbConnect();
    const historyList = await MJMessageSchema.find({ userId: req.session.user?._id }).sort({ createAt: 1 }).lean();
    return {
      props: {
        historyList: JSON.parse(JSON.stringify(historyList)) as IMJMessage[],
      },
    };
  } catch (e) {
    console.error('getServerSideProps error', e);
    return {
      props: {
        historyList: [],
      },
    };
  }
}, sessionOptions);
