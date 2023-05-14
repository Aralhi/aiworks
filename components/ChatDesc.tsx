import { useRouter } from "next/router";
import { Flash, Sun, Warn } from "./SVG";

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
      {!isHome && <h1 className="text-4xl font-semibold flex items-center justify-center py-6 md:py-12 lg:my-20">
        ChatGPT
      </h1>}
      <div className="md:flex items-start text-center gap-3.5 md:my-10 px-6 lg:px-10">
        <div
          id="examples"
          className="flex flex-col mb-8 md:mb-auto gap-3.5 flex-1"
        >
          <h2 className="flex gap-3 items-center m-auto text-lg font-normal md:flex-col md:gap-2">
            <Sun />举例
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
            <Flash />性能
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
            <Warn />限制
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