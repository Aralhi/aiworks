import { Menu, MenuProps } from "antd"
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { isPC } from "../utils";

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

const items: MenuProps['items'] = [
  getItem(<Link href='/tutorial'>开始</Link>, 'start', null),
  getItem(<Link href='/tutorial/weichat'>微信里用AI</Link>, 'weichat'),
  { type: 'divider' },
  // getItem('chatGPT', 'chatgpt', null, [
  //   getItem(<Link href='/tutorial/chat-intro'>chatGPT使用教程</Link>, 'chat-intro'),
  // ]),
  // getItem('Mid Journey', 'mj', null, [
  //   getItem(<Link href='/tutorial/mj-intro'>Mid Journey使用教程</Link>, 'mj-intro'),
  // ]),
];
export default function TutorialLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  let defaultPath = router.pathname.replace('/tutorial/', '').replace('/tutorial', '')
  defaultPath = defaultPath === '' ? 'start' : defaultPath
  const [mode, setMode] = useState<'horizontal' | 'vertical' | 'inline'>('vertical')
  useEffect(() => {
    setMode(isPC() ? 'vertical' : 'horizontal')
  })

  return (
    <>
      <Menu className='md:flex w-[284px] md:shrink-0 sticky md:h-[calc(100vh-121px)] md:flex-col md:justify-start'
        defaultSelectedKeys={[defaultPath]}
        defaultOpenKeys={['chatgpt', 'mj']}
        mode={mode}
        items={items}
      />
      <main className='w-full flex justify-start py-4'>
        <div className='w-full prose prose-vercel max-w-none'>
          <section>{children}</section>
        </div>
      </main>
    </>
  )
}
