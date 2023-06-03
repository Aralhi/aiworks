import { GetStaticProps } from "next";
import { useEffect } from "react";
import TutorialLayout from "@/components/TutorialLayout";

export default function Wechat() {

  useEffect(() => {
    document.title = '微信里用AI'
  })

  return (
    <div className='relative max-w-screen-xl px-4 py-10 mx-auto md:flex md:py-10 gap-x-6 md:flex-row' style={{ minHeight: 'calc(100vh - 60px)' }}>
      <TutorialLayout>
        <>
          <h1 className="text-ellipsis overflow-hidden">介绍</h1>
          <p>为了更便捷的使用AI，AI works支持在微信内使用AI。可以按照如下步骤操作</p>
          <h2>准备</h2>
          <p></p>
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
