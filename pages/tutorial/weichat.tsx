import { GetStaticProps } from "next";
import { useEffect } from "react";
import TutorialLayout from "@/components/TutorialLayout";
import Link from "next/link";

export default function Wechat() {

  useEffect(() => {
    document.title = '微信里用AI'
  })

  return (
    <div className='tutorial relative max-w-screen-xl px-4 py-10 mx-auto md:flex md:py-10 gap-x-6 md:flex-row' style={{ minHeight: 'calc(100vh - 60px)' }}>
      <TutorialLayout>
        <>
          <h1 className="text-ellipsis overflow-hidden">介绍</h1>
          <p>为了更便捷的使用AI，AI works支持在微信内使用AI。可以按照如下步骤操作</p>
          <h2>准备</h2>
          <p>1. 手机号注册的用户需要先在<Link className="mx-2 text-blue-500" href='/user?t=2'>用户信息</Link>绑定微信号。微信扫码注册的用户请忽略</p>
          <p>2. 扫码关注公众号</p>
          <img src="/ai_studios.jpg" alt="公众号二维码" className="w-64" />
          <h2>使用</h2>
          <h3>chatGPT</h3>
          <p>1. 在公众号内回复<code>/chat</code>，即可进入聊天模式</p>
          <p>2. 输入<code>/chat</code>，即可退出聊天模式。或者五分钟不发送消息自动退出聊天模式</p>
          <p>3. 在聊天模式下，输入任意文本，即可得到AI的回复</p>
          <p>4. 如果5s内未得到回复，输入<code>继续</code>得到完整答案</p>
          <h3>特殊说明</h3>
          <p>由于微信API有5s响应限制，所以超大文本可能会导致无法直接响应。不过没关系，输入`继续`即可得到答案。</p>
          <h3>Mid Journey</h3>
          <p>1. 在公众号内回复<code>/mj + prompts</code>，注意<code>/mj</code>后面要有空格</p>
        </>
      </TutorialLayout>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: { },
  };
}
