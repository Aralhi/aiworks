import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Footer from "../components/Footer";
import LoadingDots from "../components/LoadingDots";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [completion, setCompletion] = useState<String>("");

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
    <div className="">
      <main>
        <div className="container mx-auto py-10">
          <h1 className="text-4xl font-bold mb-4">欢迎来到AI平台</h1>
          <p className="text-gray-600 mb-4">
            我们提供最先进的人工智能技术，帮助你实现业务的数字化转型。
          </p>
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div className="card">
              <h2 className="font-bold mb-2">特色功能1</h2>
              <p className="text-gray-600 mb-4">
                我们提供最先进的人工智能技术，帮助你实现业务的数字化转型。
              </p>
              <a href="#" className="btn">
                了解更多
              </a>
            </div>
            <div className="card">
              <h2 className="font-bold mb-2">特色功能2</h2>
              <p className="text-gray-600 mb-4">
                我们提供最先进的人工智能技术，帮助你实现业务的数字化转型。
              </p>
              <a href="#" className="btn">
                了解更多
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 mb-10">
            <div className="reference">
              <img
                src="https://via.placeholder.com/500x300"
                alt="Reference 1"
                className="mb-4"
              />
              <h3 className="font-bold mb-2">参考案例1</h3>
              <p className="text-gray-600 mb-4">
                我们帮助客户实现了业务数字化转型，取得了巨大的成功。
              </p>
              <a href="#" className="btn">
                了解更多
              </a>
            </div>
            <div className="reference">
              <img
                src="https://via.placeholder.com/500x300"
                alt="Reference 2"
                className="mb-4"
              />
              <h3 className="font-bold mb-2">参考案例2</h3>
              <p className="text-gray-600 mb-4">
                我们帮助客户实现了业务数字化转型，取得了巨大的成功。
              </p>
              <a href="#" className="btn">
                了解更多
              </a>
            </div>
            <div className="reference">
              <img
                src="https://via.placeholder.com/500x300"
                alt="Reference 3"
                className="mb-4"
              />
              <h3 className="font-bold mb-2">参考案例3</h3>
              <p className="text-gray-600 mb-4">
                我们帮助客户实现了业务数字化转型，取得了巨大的成功。
              </p>
              <a href="#" className="btn">
                了解更多
              </a>
            </div>
          </div>

          <div className="testimonials mb-10">
            <h2 className="font-bold mb-4">客户评价</h2>
            <div className="testimonial">
              <blockquote className="mb-4">
                “我们使用AI平台，取得了惊人的效果。它是我们数字化转型的关键。”
              </blockquote>
              <p className="text-gray-600 font-bold mb-2">
                John Doe, CEO of ABC Company
              </p>
              <p className="text-gray-500">San Francisco, CA</p>
            </div>
            <div className="testimonial">
              <blockquote className="mb-4">
                “我们使用AI平台，取得了惊人的效果。它是我们数字化转型的关键。”
              </blockquote>
              <p className="text-gray-600 font-bold mb-2">
                John Doe, CEO of ABC Company
              </p>
              <p className="text-gray-500">San Francisco, CA</p>
            </div>
            <div className="testimonial">
              <blockquote className="mb-4">
                “我们使用AI平台，取得了惊人的效果。它是我们数字化转型的关键。”
              </blockquote>
              <p className="text-gray-600 font-bold mb-2">
                John Doe, CEO of ABC Company
              </p>
              <p className="text-gray-500">San Francisco, CA</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
