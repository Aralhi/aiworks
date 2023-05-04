import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Footer from "../components/Footer";
import LoadingDots from "../components/LoadingDots";
import Link from "next/link";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [completion, setCompletion] = useState<String>("");
  const [chatText, setChatText] = useState<String>("免费试用");
  const [mjText, setMjText] = useState<String>("免费试用");

  const bioRef = useRef<null | HTMLDivElement>(null);

  const scrollToBios = () => {
    if (bioRef.current !== null) {
      bioRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const generateBio = async (e: any) => {
    e.preventDefault();
    setCompletion("");
    setLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

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
    }
    scrollToBios();
    setLoading(false);
  };

  return (
    <main className="w-fulL">
      <div id="website-desc" className="bg-[url('/bg.jpg')] text-white bg-cover md:pl-6 lg:pl-2" style={{ height: '400px' }}>
        <h1 className="text-4xl w-full font-bold mb-4 pt-[150px]">AI works，让AI触手可及</h1>
        <h2 className="text-2xl mb-4">
          AI生产力工具伴随您的日常工作与生活
        </h2>
      </div>
      <div id="chatgpt" className="md:flex items-start items-center" style={{
        margin: '20px',
        backgroundColor: 'hsla(210, 8.33%, 95.29%, 1)'
      }}>
        <div className="bg-[url('/chatgpt-desc.png')] bg-container md:w-2/3 bg-size: 100% 100%" style={{ height: '300px', backgroundSize: '100% 100%' }}></div>
        <div className="flex justify-center items-center flex-col gap-4 p-4 md:w-1/3">
          <h1 className="text-4xl w-full font-bold mb-4 text-center" style={{ color: 'rgb(52, 0, 104)' }}>chatGPT</h1>
          <p style={{ color: 'rgb(52, 0, 104)' }}>全球最强大的人工智能，在创作、文案编辑、编码、美食配方等方面可以给你惊人的灵感和效率，更可以作为AIGC工具强大的prompt生成器。</p>
          <Link className="text-green-400 underline" href={'/chat'}>{mjText}</Link>
        </div>
      </div>
      <div id="mj-desc" className="text-gray-700 flex justify-center items-center flex-col gap-4" style={{ height: '400px', position: 'relative'}}>
        <div className="bg-[url('/mj-desc.png')] bg-cover hover:opacity-30 z-0 w-full h-full" style={{ position: 'absolute' }}></div>
        <p className="text-gray-200 text-3xl z-10 text-center">全球最强文生图模型，一分钟帮你实现创意。<br></br><Link className="text-green-400 text-3xl underline" href={'/midjourney'}>{mjText}MidJourney</Link></p>
      </div>
      <div id="feature" className="mt-6 mb-6 pl-6 pr-6">
        <h1 className="text-4xl text-center mb-6">Feature</h1>
        <div className="grid grid-cols-3 gap-8 mb-10">
          <div className="flex flex-col justify-center items-center">
            <img
              src="/f3.png"
              className="mb-4"
            />
            <p className="text-gray-600 mb-4">
              用chatGPT帮你写代码，一分钟搞定技术难点，再也不用各种github、stack overflow乱搜啦！
            </p>
            <Link className="underline text-center" href={'/chat'}>了解更多</Link>
          </div>
          <div className="flex flex-col justify-center items-center">
            <img
              src="/f2.png"
              className="mb-4"
            />
            <p className="text-gray-600 mb-4">
              用Midjourney，一分钟创建属于自己的角色
            </p>
            <Link className="underline text-center" href={'/midjourney'}>了解更多</Link>
          </div>
          <div className="flex flex-col justify-center items-center">
            <img
              src="/f1.png"
              className="mb-4"
            />
            <p className="text-gray-600 mb-4">用Midjourney，一分钟设计机具创意的LOGO</p>
            <Link className="underline text-center" href={'/midjourney'}>了解更多</Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Home;
