import TutorialLayout from "@/components/TutorialLayout";
import { GetStaticProps } from "next";
import { useEffect } from "react";

export default function mjIntro() {
  useEffect(() => {
    document.title = 'MJ使用教程'
  })

  return (
    <div className='relative max-w-screen-xl px-4 py-10 mx-auto md:flex md:py-10 gap-x-6 md:flex-row' style={{ minHeight: 'calc(100vh - 60px)' }}>
      <TutorialLayout>
        <p>MJ</p>
      </TutorialLayout>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: { },
  };
}
