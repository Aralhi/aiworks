import { ChangeEvent, useEffect, useState, useRef, useCallback } from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import vscDarkPlus from "react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus";
import { getFingerprint, isPC } from '../../utils';
import { ChatDesc } from '../../components/ChatDesc';
import { AnewSvg, ChatGPTLogo, ChatSvg, Close, Copy, Delete, Edit, PlusSvg, SendSvg } from '@/components/SVG';
import useUser from '@/lib/userUser';
import { useRouter } from 'next/router';
import { IConversation } from '@/models/Conversation';
import { FINGERPRINT_KEY, MAX_CONVERSATION_COUNT, MAX_CONVERSATION_NAME_LEN } from '@/utils/constants';
import fetchJson, { CustomResponseType } from '@/lib/fetchJson';
import { ICompletion } from '@/models/Completion';
import Link from 'next/link';
import { Modal, message } from 'antd';
import * as XLSX from 'xlsx'
import { CheckOutlined, CloseOutlined, DownloadOutlined } from '@ant-design/icons';
import MobileChatHeader from '@/components/MobileChatHeader';

interface Chat {
  prompt: string;
  completion: string;
}

const COPY_CODE = 'Copy code'
const COPIED = 'Copied'

function Chat() {
  const { user } = useUser()
  const router = useRouter()
  const { cid } = router.query
  const [conversationId, setConversationId] = useState(cid)
  const [conversationName, setConversationName] = useState("");
  const [init, setInit] = useState(!(cid && user?.isLoggedIn))
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(true)
  // 最多显示20条历史记录
  const [conversations, setConversations] = useState<Array<IConversation>>([])
  const [showRegenerateBtn, setShowRegenerateBtn] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [chatList, setChatList] = useState<Array<Chat>>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editingId, setEditingId] = useState('')
  const [editingName, setEditingName] = useState('')
  const [showDelDialog, setShowDelDialog] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  useEffect(() => {
    getConversationList()
    document.title = `${conversationName || 'ChatAI'} - AI works`
    setIsOpen(isPC() ? true : false)
    setIsMobile(isPC() ? false : true)
    if (conversations && conversations.length > MAX_CONVERSATION_COUNT && !localStorage.getItem('aiworks_conversation_count_message')) {
      message.error(`最多只能创建${MAX_CONVERSATION_COUNT}个会话，您已经达到上限。`)
      localStorage.setItem('aiworks_conversation_count_message', 'true')
    }
  }, [])

  useEffect(() => {
    // 根据cid查询会话列表
    getCompletionList(cid as string)
  }, [cid, user?.isLoggedIn])

  function selectExample(item: string) {
    setPrompt(item)
  }

  function newChat() {
    setConversationId('')
    setChatList([])
    setInit(true)
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
      return
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
    const currentPrompt = !regenerate ? prompt : chatList[chatList.length - 1].prompt
    const checkRes = await fetch('/api/chatgpt/check', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [FINGERPRINT_KEY]: await getFingerprint()
      },
      body: JSON.stringify({
        prompt: currentPrompt,
        conversationId,
        conversationName
      }),
    })
    const checkResult = await checkRes.json()
    if (checkResult && checkResult.status === 'ok' && checkResult.data.payload) {
      const { payload, conversationId, plaintext } = checkResult.data
      const token = checkRes.headers.get('Authorization')
      try {
        const response = await fetch('https://api.aiworks.club/api/generate', {
          method: "POST",
          mode: 'cors',
          headers: {
            "Authorization": `${token}`,
            "x-salai-plaintext": plaintext,
            "Content-Type": "application/json",
            [FINGERPRINT_KEY]: await getFingerprint()
          },
          body: JSON.stringify({
            payload
          }),
        })
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        if (!conversationId) {
          // 默认没有conversationId会在调chatgpt时创建，此处获取更新会话列表
          getConversationList()
        }
        // This data is a ReadableStream
        const data = response.body;
        if (!data) {
          return;
        }
        const reader = data.getReader();
        const decoder = new TextDecoder();
        let done = false;
        const arr = []
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunkValue = decoder.decode(value);
          arr.push(chunkValue)
          setChatList((pre) => {
            let tmp = pre.pop() as Chat
            return [...pre, { prompt: tmp.prompt, completion: tmp.completion + chunkValue }]
          })
        }
        setShowRegenerateBtn(true)
        // 会话完成写入DB
        fetchJson('/api/chatgpt/callback', {
          method: "POST",
          body: JSON.stringify({
            conversationId,
            payload,
            content: arr.join(''),
          }),
        })
      } catch (e) {
        console.error('fetch failed', e)
      }
    } else {
      const { label, message } = checkResult
      if (label === 'login') {
        Modal.confirm({
          title: '次数已用完',
          content: <p>{message}</p>,
          okText: '注册',
          cancelText: '取消',
          onOk: () => {
            router.push({
              pathname: '/login',
              query: router.query
            })
          }
        })
      } else if (label === 'pricing') {
        Modal.confirm({
          title: '免费次数已用完',
          content: <p>{message}</p>,
          okText: '购买',
          cancelText: '取消',
          onOk: () => {
            router.push({
              pathname: '/pricing',
              query: router.query
            })
          }
        })
      }
    }
  }

  function copyCode(id: string, e: any) {
    const codeElement = document.getElementById(id)?.childNodes[0] as HTMLElement
    if (!codeElement) return
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

  function handleEdit(item: IConversation) {
    setEditingId(item?._id)
    setEditingName(item.name)
  }
  function handleDelete(item: IConversation) {
    setDeleteId(item?._id)
    setEditingName(item.name)
    setShowDelDialog(true)
  }

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    setEditingName(e.target.value);
  }

  function handleNameKeyDown(e: any) {
    if (e.keyCode === 13) {
      e.preventDefault()
      saveConversation()
    }
  }

  function cancelEdit() {
    setEditingId('')
    setEditingName('')
  }

  function cancelDelete() {
    setDeleteId('')
    setEditingName('')
    setShowDelDialog(false)
  }

  async function saveConversation() {
    const res: CustomResponseType = await fetchJson('/api/conversation', {
      method: 'PUT',
      body: JSON.stringify({
        _id: editingId,
        name: editingName
      })
    })
    if (res && res.status === 'ok') {
      setEditingId('')
      setEditingName('')
      setConversations((pre) => {
        const index = pre.findIndex((item) => item._id === editingId)
        pre[index].name = editingName
        return [...pre]
      })
      message.success(res.message)
    } else {
      res.message && message.error(res.message)
    }
  }

  async function delConversation() {
    const res: CustomResponseType = await fetchJson(`/api/conversation?_id=${deleteId}`, {
      method: 'DELETE',
      body: JSON.stringify({ _id: deleteId})
    })
    if (res && res.status === 'ok') {
      setConversations((pre) => {
        return pre.filter((item) => item._id !== deleteId)
      })
      setDeleteId('')
      setEditingName('')
      setShowDelDialog(false)
      message.success(res.message)
    } else {
      res.message && message.error(res.message)
    }
  }

  async function getConversationList() {
    const res: CustomResponseType = await fetchJson('/api/conversation')
    if (res && res.status === 'ok') {
      setConversations(res?.data || [])
      if (!conversationId && res?.data?.[0]?._id) {
        setConversationId(res?.data?.[0]?._id)
      }
    } else {
      res.message && message.error(res.message)
    }
  }

  function selectConversation(item: IConversation) {
    setConversationId(item._id)
    setConversationName(item.name);
    getCompletionList(item._id)
    router.push({ pathname: 'chat', query: { cid: item._id }})
  }

  async function getCompletionList(id: string) {
    if(!id || !user?.isLoggedIn) {
      return
    }
    const res: CustomResponseType = await fetchJson(`/api/completion?conversationId=${id || conversationId}`)
    if (res && res.status === 'ok') {
      setInit(false)
      setChatList((res?.data || []).map((item: ICompletion) => {
        return {
          prompt: item.prompt,
          completion: item.content
        }
      }) )
    }
  }

  function exportConversation() {
    const list = [['prompt', 'answer'], ...chatList.map((item) => [item.prompt, item.completion])];
    let WorkSheet = XLSX.utils.aoa_to_sheet(list)
    // eslint-disable-next-line camelcase
    let new_workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(new_workbook, WorkSheet)
    XLSX.writeFile(new_workbook, `${conversationName} -会话数据.xlsx`)
  }

  function toggle() {
    setIsOpen(true)
  }

  return (
    <div className="flex overflow-hidden dark:bg-gray-800 relative" style={{ height: 'calc(100vh - 60px)'}}>
      {/* 左侧菜单栏 */}
      <div
        className={`${
          isOpen ? "min-w-[300px] md:w-[400px] " : "hidden overflow-hidden p-2"
        } ${isMobile && "absolute z-50"} h-full transition-all duration-300 ease-in-out bg-black text-white`}
      >
        {isMobile && isOpen && <Close className="absolute top-4" onClick={() => {setIsOpen(false)}} />}
        <a
          className="w-full flex py-3 px-3 items-center gap-3 transition-colors duration-200 text-white cursor-pointer text-sm rounded-md border border-white/20 hover:bg-gray-500/10 mb-1 flex-shrink-0"
          onClick={newChat}
        >
          <PlusSvg />
          New chat
        </a>
        <Modal
          open={showDelDialog}
          title='删除会话'
          onCancel={cancelDelete}
          onOk={delConversation}
        >
          <p className='flex justify-center my-4'>您确认要删除<strong className='px-1'>{editingName}</strong>会话吗</p>
        </Modal>
        <Modal
          open={showLoginDialog}
          title={!user?.isLoggedIn ? '会话次数已用完' : '购买后可继续使用'}
          onCancel={() => { setShowLoginDialog(false) }}>
            {!user?.isLoggedIn && <p className='flex justify-center items-center mt-2'>登录后获得更多查询次数，
              <Link className='font-bold text-violet-500' href={{ pathname: 'login', query: router.query }}>登录</Link>
            </p>}
            {user?.isLoggedIn && !user?.pricings && <p className='flex justify-center items-center mt-2'>
              <Link className='font-bold text-violet-500' href={{ pathname: 'pricing', query: router.query }}>感觉不够用?</Link>
            </p>}
        </Modal>
        <ol className="w-full">
          {conversations.map((item: IConversation, index: number) => (
            <li
              key={`history_chat_${index}`}
              className="relative z-[15]"
              style={{ opacity: 1, height: "auto" }}
              onClick={() => {selectConversation(item)}}
            >
              <a className={`flex py-3 px-3 items-center gap-3 relative rounded-md cursor-pointer break-all )} pr-14 )} ${ conversationId === item?._id ? 'bg-gray-800' : ''} hover:bg-gray-800 group`}>
                <ChatSvg />
                <div className="flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative">
                  {editingId !== item?._id && item.name}
                  {editingId === item?._id && (
                    <input
                      type="text"
                      className="w-full bg-transparent border-0 focus:ring-0 focus-visible:ring-0 dark:bg-transparent p-0 text-sm"
                      value={editingName}
                      autoFocus
                      onChange={(e) => { handleNameChange(e) }}
                      onKeyDown={(e) => { handleNameKeyDown(e)}}
                    />)
                  }
                  <div className="absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-gray-800" style={{ display: 'none' }}></div>
                </div>
                <div className="absolute flex right-1 z-10 text-gray-300 visible">
                  {conversationId === item?._id && editingId !== item?._id && <button className="p-1 hover:text-white" onClick={() => { handleEdit(item) }}><Edit /></button>}
                  {conversationId === item?._id && editingId !== item?._id && <button className="p-1 hover:text-white" onClick={() => { handleDelete(item) }}><Delete /></button>}
                  {editingId === item?._id && <button className="p-1 hover:text-white" onClick={saveConversation}><CheckOutlined rev='' /></button>}
                  {editingId === item?._id && <button className="p-1 hover:text-white" onClick={cancelEdit}><CloseOutlined rev='' /></button>}
                </div>
              </a>
            </li>
          ))}
        </ol>
      </div>
      <main className={`w-full relative ${ isMobile && isOpen && 'bg-gray-500 bg-opacity-50' }`}>
        {isMobile && <MobileChatHeader className={`${ isOpen && 'bg-gray-500 bg-opacity-50' }`} toggle={toggle} newChat={newChat}/>}
        <div className="relative text-gray-800 w-full h-full md:flex md:flex-col dark:text-gray-100 overflow-y-scroll pb-24">
          {init && <ChatDesc onExampleClick={selectExample} />}
          {!init && chatList && chatList.length > 0 && (
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
                          className='flex-shrink-0 flex flex-col relative items-end'
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
                          <div className="min-h-[20px] flex flex-col items-start gap-4 break-words overflow-auto">
                            <div className="markdown prose w-full break-words dark:prose-invert light">
                              <ReactMarkdown
                                children={item.completion}
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeKatex]}
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
                                    const codeId = `code_block_${index}_${Math.floor(Math.random() * 100)}`
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
                                                codeId,  e
                                              );
                                            }}
                                          >
                                            <Copy />
                                            <span>{COPY_CODE}</span>
                                          </button>
                                        </div>
                                        <SyntaxHighlighter
                                          id={codeId}
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
              <div className="w-full h-24 flex-shrink-0 flex justify-end items-center pr-2 md:pr-6">
                {
                conversationId && <div className={`bg-gray-400 dark:bg-gray-900 w-8 h-8 rounded-full z-10 cursor-pointer flex items-center justify-center`}
                  onClick={() => exportConversation()}>
                  <DownloadOutlined rev='' className='w-4 h-4' />
                </div>
              }
              </div>
            </ScrollToBottom>
          )}
          <div className={`w-full ${isMobile ? "fixed" : "absolute"} bottom-0 left-0 border-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent md:bg-vert-light-gradient bg-white dark:bg-gray-800 md:!bg-transparent md:bg-vert-light-gradient md:dark:bg-vert-dark-gradient pt-2`}>
            <form className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
              <div className="relative flex h-full flex-1 items-stretch flex-col">
                <div className="">
                  <div className="h-full flex ml-1 md:w-full md:m-auto md:mb-2 gap-0 md:gap-2 justify-center"></div>
                </div>
                {showRegenerateBtn && (
                  <div
                    className="h-full flex ml-1 md:w-full md:m-auto md:mb-2 gap-0 md:gap-2 justify-center cursor-pointer mb-1"
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
                    placeholder="输入您的问题（Shift + Enter换行）"
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

export default Chat;
