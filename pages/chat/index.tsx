import { ChangeEvent, useEffect, useState, useRef } from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import vscDarkPlus from "react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus";
import { getFingerprint, isPC } from '../../utils';
import { ChatDesc } from '../../components/ChatDesc';
import { AnewSvg, ChatGPTLogo, ChatSvg, Checked, Copy, Delete, Edit, PlusSvg, Praise, SendSvg, Trample } from '@/components/SVG';
import useUser from '@/lib/userUser';
import { useRouter } from 'next/router';
import Conversation, { IConversation } from '@/models/Conversation';
import { MAX_CONVERSATION_COUNT, MAX_CONVERSATION_NAME_LEN } from '@/utils/constants';
import { withIronSessionSsr } from 'iron-session/next';
import { sessionOptions } from '@/lib/session';
import dbConnect from '@/lib/dbConnect';
import { InferGetServerSidePropsType } from 'next';
import { toast } from 'react-hot-toast';

interface HistoryChat {
  name: string
}

interface Chat {
  prompt: string;
  completion: string;
}

const COPY_CODE = 'Copy code'
const COPIED = 'Copied'

function chat({ conversationList }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { user } = useUser()
  const router = useRouter()
  const { cid } = router.query
  const [conversationId, setConversationId] = useState(cid)
  const [init, setInit] = useState(true)
  const [isOpen, setIsOpen] = useState(false);
  // 最多显示20条历史记录
  const [conversations, setConversations] = useState<Array<IConversation>>(conversationList || [])
  const [showRegenerateBtn, setShowRegenerateBtn] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [completion, setCompletion] = useState('')
  const [chatList, setChatList] = useState<Array<Chat>>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editingId, setEditingId] = useState('')

  useEffect(() => {
    setIsOpen(isPC() ? true : false)
    if (conversations && conversations.length > MAX_CONVERSATION_COUNT && !localStorage.getItem('aiworks_conversation_count_message')) {
      toast.error(`最多只能创建${MAX_CONVERSATION_COUNT}个会话，您已经达到上限。`)
      localStorage.setItem('aiworks_conversation_count_message', 'true')
    }
  }, [])

  function selectExample(item: string) {
    setPrompt(item)
  }

  function newChat() {

  }
  
  function handleContentChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setPrompt(e.target.value || '')
    calculateHeight(e.target.value)
  }

  function calculateHeight(value?: string) {
    if ((!value || value === '') && textareaRef.current) {
      textareaRef.current.style.height = '24px';
      return
    }
    const lines = (value || prompt).split('\n');
    const newHeight = Math.max(lines.length * 24, 24);
    if (textareaRef.current && newHeight <= 200) {
      textareaRef.current.style.height = newHeight + 'px';
    }
  }

  function handleKeyDown(e: any) {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      setPrompt(prompt + '\n');
      calculateHeight(prompt + '\n');
      handleFocus()
    }
    if (e.keyCode === 13) {
      e.preventDefault();
      sendConversation()
    }
  }

  function handleFocus() {
    if (textareaRef.current) {
      textareaRef.current.selectionStart = prompt.length;
      textareaRef.current.selectionEnd = prompt.length;
    }
  };


  async function sendConversation(regenerate?: boolean) {
    if (!regenerate && !prompt) {
      return
    }
    // 没有conversationId，说明是新的会话，需要先创建会话，传递name给后台创建
    const conversationName = !conversationId ? prompt.slice(0, MAX_CONVERSATION_NAME_LEN) : ''
    setInit(false)
    setShowRegenerateBtn(false)
    setChatList((pre) => [...pre, 
      { prompt: regenerate ? chatList[chatList.length - 1].prompt : prompt, completion: ''}
    ])
    setPrompt('') // 清空输入框
    try {
      const response = await fetch('/api/chatgpt/get', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'x-fingerprint': await getFingerprint()
        },
        body: JSON.stringify({
          prompt: !regenerate ? prompt : chatList[chatList.length - 1].prompt,
          conversationId,
          conversationName
        }),
      })
      if (!response.ok) {
        throw new Error(response.statusText);
      }
  
      // This data is a ReadableStream
      const data = response.body;
      if (!data) {
        return;
      }
      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
  
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        setCompletion((prev) => prev + chunkValue);
        setChatList((pre) => {
          // 最后一个元素是completion，可以直接更新
          let tmp = pre.pop() as Chat
          return [...pre, { prompt: tmp.prompt, completion: tmp.completion + chunkValue }]
        })
      }
      setShowRegenerateBtn(true)
    } catch (e) {
      console.error('fetch failed', e)
    }
  }

  function copyCode(id: string, e: any) {
    const codeElement = document.getElementById(id)?.childNodes[0] as HTMLElement
    const range = document.createRange ? document.createRange() : new Range();
    range.selectNodeContents(codeElement);
    const selection = window.getSelection();
    selection && selection.removeAllRanges();
    selection && selection.addRange(range);
    try {
      document.execCommand('copy');
      selection && selection.removeAllRanges();
      const tagName = e.target.tagName.toLowerCase()
      if (tagName === 'span') {
        e.target.innerText = COPIED
      } else if (tagName === 'svg') {
        e.target.nextSibling.innerText = COPIED
      }
      setTimeout(() => {
        if (tagName === 'span') {
          e.target.innerText = COPY_CODE
        } else if (tagName === 'svg') {
          e.target.nextSibling.innerText = COPY_CODE
        }
      }, 2000)
    } catch (e) {
      console.error('copy failed', e)
    }
  }

  function editConversation(id: string) {
    setEditingId(id)
  }
  function delConversation(id: string) {

  }

  return (
    <div className="h-screen flex overflow-hidden dark:bg-gray-800">
      {/* 左侧菜单栏 */}
      <div
        className={`${
          isOpen ? "md:w-[400px] pt-[60px]" : "w-0 overflow-hidden p-2"
        } transition-all duration-300 ease-in-out bg-black text-white`}
      >
        <a
          className="w-full flex py-3 px-3 items-center gap-3 transition-colors duration-200 text-white cursor-pointer text-sm rounded-md border border-white/20 hover:bg-gray-500/10 mb-1 flex-shrink-0"
          onClick={newChat}
        >
          <PlusSvg />
          New chat
        </a>
        <ol className="w-full">
          {conversations.map((item: IConversation, index: number) => (
            <li
              key={`history_chat_${index}`}
              className="relative z-[15]"
              style={{ opacity: 1, height: "auto" }}
            >
              <a className={`flex py-3 px-3 items-center gap-3 relative rounded-md cursor-pointer break-all )} pr-14 )} ${ cid === item?._id ? 'bg-gray-800' : ''} hover:bg-gray-800 group`}>
                <ChatSvg />
                <div className="flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative">
                  {editingId !== item?._id && item.name}
                  {editingId === item?._id && (
                    <input
                      type="text"
                      className="w-full bg-transparent border-0 focus:ring-0 focus-visible:ring-0 dark:bg-transparent p-0 text-sm"
                      value={item.name}
                      autoFocus
                      />)
                  }
                  <div className="absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-gray-800"></div>
                </div>
                <div className="absolute flex right-1 z-10 text-gray-300 visible">
                  <button className="p-1 hover:text-white" onClick={() => { editConversation(item?._id) }}>
                    <Edit />
                  </button>
                  <button className="p-1 hover:text-white" onClick={() => { delConversation(item?._id) }}>
                    <Delete />
                  </button>
                </div>
              </a>
            </li>
          ))}
        </ol>
      </div>
      <main className="h-full w-full pt-[60px]">
        <div className="relative text-gray-800 w-full h-full md:flex md:flex-col dark:text-gray-100">
          {init && <ChatDesc onExampleClick={selectExample} />}
          {!init && chatList && chatList.length && (
            <ScrollToBottom className="overflow-hidden dark:dark-theme">
              {chatList.map((item: Chat, index: number) => (
                <div key={`chat_${index}`}>
                  <div
                    id="prompt-area"
                    className="group w-full p-4 text-gray-800 dark:text-gray-100 border-b border-black/10 dark:border-gray-900/50 dark:bg-gray-800"
                  >
                    <div className="flex w-full justify-start gap-4 text-base md:gap-6 md:max-w-2xl lg:max-w-3xl lg:px-0 m-auto">
                      <div className="w-full flex gap-4 text-base md:gap-6 lg:px-0 m-auto ">
                        <div
                          id="user-avatar"
                          className='class="flex-shrink-0 flex flex-col relative items-end"'
                        >
                          <img className="w-[30px]" src={user?.avatarUrl} />
                        </div>
                        <div
                          id="prompt=text"
                          className="relative flex flex-col gap-1 md:gap-3"
                        >
                          {item.prompt}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    id="completion-area"
                    className="w-full p-4 flex gap-4 text-base md:gap-6 m-auto text-gray-800 dark:text-gray-100 border-b border-black/10 dark:border-gray-900/50 bg-gray-50 dark:bg-[#444654]"
                  >
                    <div className="flex w-full justify-start gap-4 text-base md:gap-6 md:max-w-2xl lg:max-w-3xl lg:px-0 m-auto">
                      <div
                        id="chatgpt-logo"
                        className="flex-shrink-0 w-[30px] flex flex-col relative items-end"
                      >
                        <div
                          className="relative h-[30px] w-[30px] p-1 rounded-sm text-white flex items-center justify-center"
                          style={{ backgroundColor: "rgb(16, 163, 127)" }}
                        >
                          <ChatGPTLogo />
                        </div>
                      </div>
                      <div
                        id="completion-answer"
                        className="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]"
                      >
                        <div className="flex flex-grow flex-col gap-3">
                          <div className="min-h-[20px] flex flex-col items-start gap-4 break-words">
                            <div className="markdown prose w-full break-words dark:prose-invert light">
                              <ReactMarkdown
                                children={item.completion}
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  code({
                                    node,
                                    inline,
                                    className,
                                    children,
                                    ...props
                                  }) {
                                    const match = /language-(\w+)/.exec(
                                      className || ""
                                    );
                                    return !inline && match ? (
                                      <>
                                        <div className="flex items-center relative text-gray-200 bg-gray-800 px-4 py-2 text-xs font-sans justify-between rounded-t-md">
                                          <span>
                                            {className?.replace(
                                              "language-",
                                              ""
                                            )}
                                          </span>
                                          <button
                                            className="flex ml-auto gap-2"
                                            onClick={(e) => {
                                              copyCode(
                                                `code_block_${index}`,
                                                e
                                              );
                                            }}
                                          >
                                            <Copy />
                                            <span>{COPY_CODE}</span>
                                          </button>
                                        </div>
                                        <SyntaxHighlighter
                                          id={`code_block_${index}`}
                                          {...props}
                                          customStyle={{ marginTop: 0 }}
                                          children={String(children).replace(
                                            /\n$/,
                                            ""
                                          )}
                                          style={vscDarkPlus}
                                          language={match[1]}
                                          PreTag="div"
                                        />
                                      </>
                                    ) : (
                                      <code {...props} className={className}>
                                        {children}
                                      </code>
                                    );
                                  },
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="w-full h-32 md:h-48 flex-shrink-0"></div>
            </ScrollToBottom>
          )}
          <div className="w-full absolute bottom-0 left-0 border-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent md:bg-vert-light-gradient bg-white dark:bg-gray-800 md:!bg-transparent md:bg-vert-light-gradient md:dark:bg-vert-dark-gradient pt-2">
            <form className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
              <div className="relative flex h-full flex-1 items-stretch md:flex-col">
                <div className="">
                  <div className="h-full flex ml-1 md:w-full md:m-auto md:mb-2 gap-0 md:gap-2 justify-center"></div>
                </div>
                {showRegenerateBtn && (
                  <div
                    className="h-full flex ml-1 md:w-full md:m-auto md:mb-2 gap-0 md:gap-2 justify-center cursor-pointer"
                    onClick={() => {
                      sendConversation(true);
                    }}
                  >
                    <div className="btn relative btn-neutral  dark:btn-neutral-dark border-0 md:border">
                      <div className="flex w-full items-center justify-center gap-2">
                        <AnewSvg />
                        重新生成
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
                  <textarea
                    ref={textareaRef}
                    tabIndex={0}
                    data-id="root"
                    style={{
                      minHeight: "24px",
                      height: "auto",
                      overflowY: "hidden",
                    }}
                    rows={1}
                    value={prompt}
                    onChange={handleContentChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    placeholder="Send a message."
                    className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0"
                    data-listener-added_516abbe0="true"
                  ></textarea>

                  <div
                    className="absolute p-1 rounded-md text-gray-500 bottom-1.5 md:bottom-2.5 hover:bg-gray-100 enabled:dark:hover:text-gray-400 dark:hover:bg-gray-900 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent right-1 md:right-2 disabled:opacity-40"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      sendConversation();
                    }}
                  >
                    <SendSvg />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default chat;

export const getServerSideProps = withIronSessionSsr(async ({ req, res }) => {
  await dbConnect()
  const conversationList = await Conversation.find({ userId: req.session.user?._id }).lean()
  return {
    props: { conversationList: JSON.parse(JSON.stringify(conversationList)) },
  };
}, sessionOptions)
