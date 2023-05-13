import { useRouter } from "next/router";

const EXAMPLES = [
  '用简单的术语解释量子计算',
  '10岁生日有什么创意吗？',
  '如何用JavaScript发送一个HTTP请求？'
]

export function ChatDesc(props: any) {
  const { isHome = false, onExampleClick } = props;
  const router = useRouter();

  function handleClick(item: string) {
    if (isHome) {
      router.push('/chat')
      return
    }
    onExampleClick(item)
  }

  return (
    <>
      {!isHome && <h1 className="text-4xl font-semibold text-center mt-6 sm:mt-[20vh] ml-auto mr-auto mb-10 sm:mb-16 flex gap-2 items-center justify-center">
        ChatGPT
      </h1>}
      <div className="md:flex items-start text-center gap-3.5 md:my-10">
        <div
          id="examples"
          className="flex flex-col mb-8 md:mb-auto gap-3.5 flex-1"
        >
          <h2 className="flex gap-3 items-center m-auto text-lg font-normal md:flex-col md:gap-2">
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            举例
          </h2>
          <ul className="flex flex-col gap-3.5 w-full sm:max-w-md m-auto">
            <button className={`w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md ${isHome ? '' : 'hover:bg-gray-200 dark:hover:bg-gray-900'}`}
              onClick={() => handleClick(EXAMPLES[0])}>
              "{EXAMPLES[0]}" →
            </button>
            <button className={`w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md ${isHome ? '' : 'hover:bg-gray-200 dark:hover:bg-gray-900'}`}
              onClick={() => handleClick(EXAMPLES[1])}>
              "{EXAMPLES[1]}" →
            </button>
            <button className={`w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md ${isHome ? '' : 'hover:bg-gray-200 dark:hover:bg-gray-900'}`}
              onClick={() => handleClick(EXAMPLES[2])}>
              "{EXAMPLES[2]}" →
            </button>
          </ul>
        </div>
        <div
          id="capabilities"
          className="flex flex-col mb-8 md:mb-auto gap-3.5 flex-1"
        >
          <h2 className="flex gap-3 items-center m-auto text-lg font-normal md:flex-col md:gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              ></path>
            </svg>
            性能
          </h2>
          <ul className="flex flex-col gap-3.5 w-full sm:max-w-md m-auto">
            <li className="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md">
              记住用户之前在对话中说过的话
            </li>
            <li className="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md">
              允许用户提供后续更正
            </li>
            <li className="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md">
              学会拒绝不恰当的请求
            </li>
          </ul>
        </div>
        <div
          id="limitations"
          className="flex flex-col mb-8 md:mb-auto gap-3.5 flex-1 hidden md:block"
        >
          <h2 className="flex gap-3 items-center m-auto text-lg font-normal md:flex-col md:gap-2">
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            限制
          </h2>
          <ul className="flex flex-col gap-3.5 w-full sm:max-w-md m-auto">
            <li className="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md">
              可能偶尔会产生不正确的信息
            </li>
            <li className="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md">
              可能偶尔会产生有害的指示或偏见内容
            </li>
            <li className="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-md">
              对2021年后的世界和事件了解有限
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}