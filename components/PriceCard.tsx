import { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { PRICING_PLAN } from "@/utils/constants";
import { FaCheckCircle } from "react-icons/fa";
import Image from "next/image";
import { Modal, message } from 'antd';

export default function PriceCard() {
  const [payInfo, setPayInfo] = useState({
    payUrl: null,
    tradeNo: null,
  });
  const orderPolling = useRef<number|undefined>();
  async function buy (plan: number) {
    console.log(plan);
    const res = await fetch(`/api/weichat/pay?plan=${plan}`);
    const payInfo = (await res.json());
    setPayInfo(payInfo);
    orderPolling.current = window.setInterval(async () => {
      const res = await fetch(`/api/weichat/queryOrder?tradeNo=${payInfo.tradeNo}`);
      if ((await res.json()).status === 'COMPLETE') {
        setPayInfo({
          payUrl: null,
          tradeNo: null,
        });
        message.success('支付成功');
      }
    }, 1000);
  }

  function onCancelPay () {
    setPayInfo({
      payUrl: null,
      tradeNo: null,
    });
  }

  return (
    <div
      className="text-black w-full min-h-[300px] rounded-3xl flex justify-center items-center py-6 gap-5 flex-wrap"
      style={{ backgroundColor: "rgba(56,114,224,.04)" }}
    >
      <Modal
        title="请支付"
        width="fit-content"
        open={!!payInfo.payUrl}
        onCancel={onCancelPay}
        footer={null}
      >
        {payInfo?.payUrl && <QRCodeCanvas value={payInfo?.payUrl} size={300} />}
      </Modal>
      <div className="bg-white rounded-3xl md:min-w-[250px] md:min-h-[350px] flex flex-col items-center justify-center p-4 gap-3">
        <h1 className="text-base" style={{ color: "#637381" }}>
          {PRICING_PLAN["1"].name}
        </h1>
        <p className="flex items-center">
          <span className="font-bold text-2xl">
            ￥{PRICING_PLAN["1"].price}
          </span>
          <span className="text-base"> /一周</span>
        </p>
        <button
          className="w-full bg-gradient-to-br from-blue-500 to-blue-900 shadow-md hover:shadow-lg text-white font-medium py-2 px-4 rounded"
          onClick={() => {
            buy(1);
          }}
        >
          订阅
        </button>
        <div className="px-4 flex flex-col items-start justify-center gap-1">
          <p className="flex items-center">
            <FaCheckCircle className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>边缘计算，极速访问</span>
          </p>
          <p className="flex items-center">
            <FaCheckCircle className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>支持上下文关联查询</span>
          </p>
          <p className="flex items-center">
            <FaCheckCircle className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>会话管理个性化调教</span>
          </p>
          <p className="flex items-center">
            <FaCheckCircle className="w-4 h-4 float-left mr-2 text-green-500" />
            <span className="font-bold mr-1">
              {PRICING_PLAN["1"].queryCount}
            </span>
            <span style={{ color: "#000000a6" }}>次查询</span>
          </p>
          <p className="flex items-center">
            <FaCheckCircle className="w-4 h-4 float-left mr-2 text-green-200" />
            <span style={{ color: "#000000a6" }}>聊天记录一键导出</span>
          </p>
          <p className="flex items-center">
            <FaCheckCircle className="w-4 h-4 float-left mr-2 text-green-200" />
            <span style={{ color: "#000000a6" }}>一周时效性</span>
          </p>
        </div>
      </div>
      <div className="bg-white rounded-3xl md:min-w-[250px] md:min-h-[350px] flex flex-col items-center justify-center p-4 gap-3">
        <h1 className="text-lg text-indigo-700">{PRICING_PLAN["2"].name}</h1>
        <p className="flex items-center">
          <span className="font-bold text-2xl">
            ￥{PRICING_PLAN["2"].price}
          </span>
          <span className="text-base"> /{PRICING_PLAN["2"].label}</span>
        </p>
        <button
          className="w-full bg-gradient-to-br from-blue-500 to-blue-900 shadow-md hover:shadow-lg text-white font-medium py-2 px-4 rounded"
          onClick={() => {
            buy(2);
          }}
        >
          订阅
        </button>
        <div className="px-4 flex flex-col items-start justify-center gap-1">
          <p className="flex items-center">
            <FaCheckCircle className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>边缘计算，极速访问</span>
          </p>
          <p className="flex items-center">
            <FaCheckCircle className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>支持上下文关联查询</span>
          </p>
          <p className="flex items-center">
            <FaCheckCircle className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>会话管理个性化调教</span>
          </p>
          <p className="flex items-center">
            <FaCheckCircle className="w-4 h-4 float-left mr-2 text-green-500" />
            <span className="font-bold mr-1">
              {PRICING_PLAN["2"].queryCount}
            </span>
            <span style={{ color: "#000000a6" }}>次查询</span>
          </p>
          <p className="flex items-center">
            <FaCheckCircle className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>聊天记录一键导出</span>
          </p>
          <p className="flex items-center">
            <FaCheckCircle className="w-4 h-4 float-left mr-2 text-green-500" />
            <span className="font-bold mr-1">一个月</span><span style={{ color: "#000000a6" }}>深度体验</span>
          </p>
        </div>
      </div>
      <div className="relative bg-white rounded-3xl md:min-w-[250px] md:min-h-[350px] flex flex-col items-center justify-center p-4 gap-3">
        <Image className="absolute top-0 left-0" src="/pro.svg" width={64} height={64} alt="logo" />
        <h1 className="text-lg text-violet-700">{PRICING_PLAN["3"].name}</h1>
        <p className="flex items-center">
          <span className="font-bold text-2xl">
            ￥{PRICING_PLAN["3"].price}
          </span>
          <span className="text-base"> /{PRICING_PLAN["3"].label}</span>
        </p>
        <button
          className="w-full bg-gradient-to-br from-blue-500 to-blue-900 shadow-md hover:shadow-lg text-white font-medium py-2 px-4 rounded"
          onClick={() => {
            buy(3);
          }}
        >
          订阅
        </button>
        <div className="px-4 flex flex-col items-start justify-center gap-1">
          <p className="flex items-center">
            <FaCheckCircle className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>边缘计算，极速访问</span>
          </p>
          <p className="flex items-center">
            <FaCheckCircle className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>支持上下文关联查询</span>
          </p>
          <p className="flex items-center">
            <FaCheckCircle className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>会话管理个性化调教</span>
          </p>
          <p className="flex items-center">
            <FaCheckCircle className="w-4 h-4 float-left mr-2 text-green-500" />
            <span className="font-bold mr-1">9999</span>
            <span style={{ color: "#000000a6" }}>次查询</span>
          </p>
          <p className="flex items-center">
            <FaCheckCircle className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>聊天记录一键导出</span>
          </p>
          <p className="flex items-center">
            <FaCheckCircle className="w-4 h-4 float-left mr-2 text-green-500" />
            <span className="font-bold mr-1">三个月</span><span style={{ color: "#000000a6" }}>无限畅玩</span>
          </p>
          <div className="flex items-start justify-center flex-col">
            <p className="flex items-center" style={{ color: "#000000a6" }}><FaCheckCircle className="w-4 h-4 float-left mr-2 text-green-500" />专业玩家，支持设置</p>
            <p className="text-sm" style={{ color: "#000000a6" }}>role、max_token、temperature等</p>
          </div>
        </div>
      </div>
    </div>
  );
}
