import type { NextPage } from "next";
import Footer from "../components/Footer";
import Link from "next/link";
import { ChatDesc } from "../components/ChatDesc";
import { useEffect } from "react";

const Home: NextPage = () => {

  useEffect(() => {
    document.title = 'AI works，让AI触手可及'
  })

  return (
    <main className="w-fulL">
      <div id="website-desc" className="bg-[url('/bg.jpg')] text-white bg-cover md:pl-6 lg:pl-2 md:h-[400px] lg:h-[600px] min-h-[200px]">
        <h1 className="md:text-4xl sm:text-2xl w-full font-bold mb-4 pt-[60px] md:pt-[150px] lg:pt-[250px] md:pl-[100px] lg:pl-[200px]">AI works，让AI触手可及</h1>
        <h2 className="md:text-2xl sm:text-lg mb-4 md:pl-[100px] lg:pl-[200px]">
          AI生产力工具伴随您的日常工作与生活
        </h2>
      </div>
      <div id="chatgpt" className="md:flex items-center md:h-[400px]" style={{
        margin: '20px',
        backgroundColor: 'hsla(210, 8.33%, 95.29%, 1)'
      }}>
        <div className="md:w-2/3 p-6"><ChatDesc isHome={true} /></div>
        <div className="flex h-full justify-center items-center flex-col gap-4 p-4 md:w-1/3 bg-white">
          <h1 className="text-4xl w-full font-bold mb-4 text-center" style={{ color: 'rgb(52, 0, 104)' }}>chatGPT</h1>
          <p style={{ color: 'rgb(52, 0, 104)' }}>全球最强大的人工智能，在创作、文案编辑、编码、美食配方等方面可以给你惊人的灵感和效率，更可以作为AIGC工具强大的prompt生成器。</p>
          <Link className="text-green-400 underline" href={'/chat'}>免费试用</Link>
        </div>
      </div>
      <div id="mj-desc" className="text-gray-700 flex justify-center items-center flex-col gap-4 min-h-[300px] md:h-[400px] lg:h-[700px]"
        style={{ position: 'relative'}}>
        <div className="bg-[url('/mj-desc.JPG')] bg-cover z-0 w-full h-full" style={{ position: 'absolute' }}></div>
        <p className="text-gray-200 text-lg md:text-3xl z-10 text-center bg-gray-400 bg-opacity-80">全球最强文生图模型，一分钟帮你实现创意。<br></br>
          <Link className="text-green-400 text-lg md:text-3xl underline" href={'/midjourney'}>免费试用MidJourney</Link>
        </p>
      </div>
      <div id="feature" className="mt-6 mb-6 pl-6 pr-6">
        <h1 className="text-4xl text-center mb-6">Feature</h1>
        <div className="grid grid-cols-3 gap-8 mb-10">
          <div className="flex flex-col items-center">
            <img
              src="/f3.png"
              className="mb-4"
            />
            <p className="text-gray-600 mb-4">
              用chatAI帮你写代码，一分钟搞定技术难点
            </p>
            <Link className="underline text-center" href={'/chat'}>了解更多</Link>
          </div>
          <div className="flex flex-col items-center">
            <img
              src="/f2.png"
              className="mb-4"
            />
            <p className="text-gray-600 mb-4">
              Midjourney，一分钟创建属于自己的角色
            </p>
            <Link className="underline text-center" href={'/midjourney'}>了解更多</Link>
          </div>
          <div className="flex flex-col items-center">
            <img
              src="/f1.png"
              className="mb-4"
            />
            <p className="text-gray-600 mb-4">Midjourney，一分钟设计机具创意的LOGO</p>
            <Link className="underline text-center" href={'/midjourney'}>了解更多</Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Home;
