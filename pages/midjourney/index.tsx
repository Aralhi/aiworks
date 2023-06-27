import React, { useEffect, useState } from 'react';
import { Input, Button, List, Image, Typography, message, Row } from 'antd';
import { EyeOutlined, SendOutlined } from '@ant-design/icons';
import MJOptsPanel, { MJArgsType } from '@/components/MJOptsPanel';
import Tags from '@/components/MJOptsPanel/Tags';
import { IMJMessage } from '@/models/MJMessage';
import { FINGERPRINT_KEY } from '@/utils/constants';
import { getFingerprint } from '@/utils/index';
import fetchJson, { CustomResponseType } from '@/lib/fetchJson';
import { BasicModel } from 'types';
import { useRouter } from 'next/router';
import MJExplain from '@/components/MJOptsPanel/MJExplain';

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

function Midjourney() {
  const [inputValue, setInputValue] = useState('');
  const [inputDisable, setInputDisable] = useState(false);
  const [canShowEmpty, setShowEmpty] = useState(false);
  const [messages, setMessages] = useState<Partial<MidjourneyMessage>[]>([]);
  const [previewImg, setPreviewImg] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [args, setArgs] = useState<MJArgsType[]>([]);

  const router = useRouter();

  useEffect(() => {
    getHistoryList();
  }, []);

  const getHistoryList = async () => {
    const res = await fetchJson<CustomResponseType>('/api/mj/list', {
      method: 'GET',
    });
    setMessages((state) => [...res.data, ...state]);
    setShowEmpty(true);
  };

  const fetchMJ = async (type: MJMessageType, payload: Record<string, any>, newItem: Partial<MidjourneyMessage>) => {
    const checkRes = await fetch('/api/mj/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [FINGERPRINT_KEY]: await getFingerprint(),
      },
    });
    const checkResult = await checkRes.json();
    console.log(checkResult);

    /** 未登录跳转登陆页面 */
    if (checkRes.status === 400 || checkResult.status === 'UNLOGIN_NO_QUERY_TIMES') {
      message.warning(checkResult.message);
      router.push({ pathname: 'login', query: Object.assign({}, router.query, { originUrl: router.pathname }) });
      return;
    }
    /** 没有次数跳转套餐页面 */
    if (checkResult.status !== 'ok') {
      message.warning(checkResult.message);
      router.push({ pathname: 'pricing', query: Object.assign({}, router.query, { originUrl: router.pathname }) });
      return;
    }
    if (checkResult && checkResult.status === 'ok' && checkResult.data.plaintext) {
      /** 用于MJ通讯服务完成时的更新对应数据的标识 */
      const unionId = checkResult.data.plaintext + Date.now();
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
        body: JSON.stringify({ ...payload, unionId }),
      });
      const data = resp.body;

      console.log(resp);
      if (!data || !resp || resp.status >= 400) {
        message.error('请求失败，请稍后重试');
        return;
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      const messageIdx = messages.length;

      let done = false;
      let mjMessage: Partial<IMJMessage> = {
        type: newItem.type,
        prompt: newItem.prompt,
        progress: newItem.progress,
        msgId: newItem.msgId,
        msgHash: newItem.msgHash,
        flags: newItem.flags,
        unionId,
      };

      /** 请求发起入库 */
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
        const mjFlags = getMatchValue(chunkValue, 'flags');

        let ossUrl: string | undefined;
        let imgPath: string | undefined;

        /** 服务代理请求图片返回数据流 */
        if (mjUri) {
          try {
            const imgResp = await fetch(`https://api.aiworks.club/api/mj/image`, {
              method: 'POST',
              mode: 'cors',
              headers: {
                Authorization: `${token}`,
                'x-salai-plaintext': checkResult.data.plaintext,
                'Content-Type': 'application/json',
                [FINGERPRINT_KEY]: await getFingerprint(),
              },
              body: JSON.stringify({ url: mjUri }),
            });
            const response = await imgResp.json();
            const { url, originUrl } = response.data;
            ossUrl = url;
            imgPath = originUrl;
          } catch (e) {
            console.log('图片转存失败', e);
          }
          setMessages((state) => {
            const { progress, msgHash, prompt, msgId, img, flags } = state[messageIdx];
            state[messageIdx] = {
              ...state[messageIdx],
              img: ossUrl ?? img,
              progress: mjProgress ?? progress,
              msgId: mjId ?? msgId,
              msgHash: mjHash ?? msgHash,
              content: mjContent ?? prompt,
              flags: mjFlags !== undefined ? Number(mjFlags) : flags,
            };
            return [...state];
          });
        }
        /** 更新数据 */
        await fetchJson(`/api/mj/update?id=${record._id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            img: ossUrl,
            imgPath,
            originImg: mjUri,
            content: mjContent,
            msgId: mjId,
            msgHash: mjHash,
            progress: mjProgress,
            flags: mjFlags,
          }),
        });
      }
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
        {img && (
          <Row
            className="relative w-full sm:w-full md:w-3/5 lg:w-1/2 xl:w-2/5 rounded-lg overflow-hidden"
            onClick={() => {
              setPreviewImg(img);
              setShowPreview(true);
            }}
          >
            <img
              className="w-full"
              src={`${img}?x-oss-process=image/resize,w_550/format,webp`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = defaultImg;
              }}
            />
            <div className="absolute flex flex-col items-center justify-center top-0 left-0 w-full h-full cursor-pointer opacity-0 hover:opacity-100 bg-black bg-opacity-40 transition-opacity text-white">
              <EyeOutlined rev="" className="text-white" style={{ fontSize: '3rem' }} />
              <span className="text-sm mt-2">预览图片</span>
            </div>
          </Row>
        )}
        {/* <Image className="rounded-lg" width={350} height={350} src={img} fallback={defaultImg} /> */}
        {progress === 'done' && type !== 'upscale' && (
          <>
            <Tags data={['U1', 'U2', 'U3', 'U4']} onItemClick={(tagNum) => upscale(String(content), String(msgId), String(msgHash), tagNum)} />
            {/* <Tags data={['V1', 'V2', 'V3', 'V4']} onItemClick={(tagNum) => variation(String(content), String(msgId), String(msgHash), tagNum)} /> */}
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
    <div
      className="w-full mx-auto px-4 overflow-y-hidden bg-[#303338] dark:text-gray-100 flex justify-center flex-col pb-28"
      style={{
        height: 'calc(100vh - 60px)',
      }}
    >
      <Image
        style={{ display: 'none' }}
        preview={{
          visible: showPreview,
          src: previewImg,
          scaleStep: 0.5,
          onVisibleChange: (value) => {
            setShowPreview(value);
          },
        }}
      />
      <List
        id="mj-list"
        className="mx-auto w-full md:w-3/4 lg:w-4/5 xl:w-3/5 h-full overflow-y-auto"
        dataSource={messages}
        renderItem={renderMessage}
        locale={{
          emptyText: canShowEmpty ? <MJExplain /> : <></>,
        }}
      />
      <div className="fixed bottom-0 bg-[#303338] left-1/2 -translate-x-1/2 px-4 w-full">
        <div className="relative mx-auto w-full md:w-3/4 lg:w-4/5 xl:w-3/5 pb-5 pt-3">
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
    </div>
  );
}

export default Midjourney;
