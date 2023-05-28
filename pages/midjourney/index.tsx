import React, { useEffect, useState } from 'react';
import { Input, Button, List, Image, Typography } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { Imagine, Upscale, Variation } from '@/lib/streamFetch';
import { MJMessage } from 'midjourney';
import MJOptsPanel, { MJArgsType } from '@/components/MJOptsPanel';
import Tags from '@/components/MJOptsPanel/Tags';

const { TextArea } = Input;
const { Text } = Typography;

export interface IMidjourenyMessage {
  text: string;
  img: string;
  msgID?: string;
  msgHash?: string;
  content?: string;
  hasTag: boolean;
  progress?: string;
}

const defaultImg =
  'data:image/png;base64,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';

const Midjourney: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputDisable, setInputDisable] = useState(false);
  const [messages, setMessages] = useState<IMidjourenyMessage[]>([]);
  const [args, setArgs] = useState<MJArgsType[]>([]);

  const handleMessageSend = async () => {
    let newMessage: IMidjourenyMessage = {
      text: inputValue.trim(),
      hasTag: false,
      progress: 'waiting start',
      img: defaultImg,
    };

    if (newMessage.text) {
      newMessage.text = `${newMessage.text} ${args
        .map((item) => `${item.arg} ${Array.isArray(item.value) ? item.value.join(' ') : item.value}`)
        .join(' ')}`;
      const oldMessages = messages;
      setInputDisable(true);
      setMessages([...oldMessages, newMessage]);
      await Imagine(JSON.stringify({ prompt: newMessage.text }), (data: MJMessage) => {
        console.log(data);
        newMessage.img = data.uri;
        if (data.id) {
          newMessage.hasTag = true;
        }
        newMessage.msgHash = data.hash;
        newMessage.msgID = data.id;
        newMessage.progress = data.progress;
        newMessage.content = data.content;
        setMessages([...oldMessages, newMessage]);
      });
      setInputValue('');
      setInputDisable(false);
    }
  };

  const upscale = async (pormpt: string, msgId: string, msgHash: string, index: number) => {
    let newMessage: IMidjourenyMessage = {
      text: `${pormpt} upscale U${index}`,
      hasTag: false,
      progress: 'waiting start',
      img: defaultImg,
    };

    const oldMessages = messages;
    setInputDisable(true);
    setMessages([...oldMessages, newMessage]);
    await Upscale(JSON.stringify({ content: pormpt, index, msgId, msgHash }), (data: MJMessage) => {
      newMessage.img = data.uri;
      newMessage.msgHash = data.hash;
      newMessage.msgID = data.id;
      newMessage.content = data.content;
      newMessage.progress = data.progress;
      setMessages([...oldMessages, newMessage]);
    });
    setInputDisable(false);
  };

  const variation = async (content: string, msgId: string, msgHash: string, index: number) => {
    let newMessage: IMidjourenyMessage = {
      text: `${content} variation V${index}`,
      hasTag: false,
      progress: 'waiting start',
      img: defaultImg,
    };

    const oldMessages = messages;
    setInputDisable(true);
    setMessages([...oldMessages, newMessage]);
    await Variation(JSON.stringify({ content, index, msgId, msgHash }), (data: MJMessage) => {
      newMessage.img = data.uri;
      if (data.uri.endsWith('.png')) {
        newMessage.hasTag = true;
      }
      newMessage.msgHash = data.hash;
      newMessage.msgID = data.id;
      newMessage.content = data.content;
      newMessage.progress = data.progress;
      setMessages([...oldMessages, newMessage]);
    });
    setInputDisable(false);
  };
  const tagClick = (content: string, msgId: string, msgHash: string, tag: string) => {
    switch (tag) {
      case 'V1':
        variation(content, msgId, msgHash, 1);
        break;
      case 'V2':
        variation(content, msgId, msgHash, 2);
        break;
      case 'V3':
        variation(content, msgId, msgHash, 3);
        break;
      case 'V4':
        variation(content, msgId, msgHash, 4);
        break;
      case 'U1':
        upscale(content, msgId, msgHash, 1);
        break;
      case 'U2':
        upscale(content, msgId, msgHash, 2);
        break;
      case 'U3':
        upscale(content, msgId, msgHash, 3);
        break;
      case 'U4':
        upscale(content, msgId, msgHash, 4);
        break;
      default:
        break;
    }
  };

  const renderMessage = ({ text, img, hasTag, msgHash, msgID, progress, content }: IMidjourenyMessage) => {
    if (process.env.NEXT_PUBLIC_IMAGE_PREFIX) {
      img = img.replace('https://cdn.discordapp.com/', process.env.NEXT_PUBLIC_IMAGE_PREFIX);
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
          <strong>{text}</strong> {`(${progress})`}
        </Text>
        <Image className="rounded-lg" width={350} height={350} src={img} />
        {!hasTag && (
          <>
            <Tags data={['U1', 'U2', 'U3', 'U4']} onItemClick={(tag) => tagClick(String(content), String(msgID), String(msgHash), tag)} />
            <Tags data={['V1', 'V2', 'V3', 'V4']} onItemClick={(tag) => tagClick(String(content), String(msgID), String(msgHash), tag)} />
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
    <div className="w-full mx-auto px-4 h-screen overflow-y-hidden pt-[60px] bg-[#303338] dark:text-gray-100 flex justify-center flex-col">
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
};

export default Midjourney;
