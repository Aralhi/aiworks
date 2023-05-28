import { useEffect, useRef, useState } from 'react';
import { PRICING_PLAN } from "@/utils/constants";
import Image from "next/image";
import { Modal, Popover, QRCode, Radio, message } from 'antd';
import { AlipayCircleOutlined, CheckCircleFilled, GiftOutlined, WechatOutlined } from '@ant-design/icons';
import useUser from '@/lib/userUser';
import fetchJson, { CustomResponseType } from '@/lib/fetchJson';

export default function PriceCard(payCallback: any) {
  const { user } = useUser()
  const [payInfo, setPayInfo] = useState({
    payUrl: null,
    tradeNo: null,
    orderPrice: 0,
  });
  const orderPolling = useRef<number|undefined>();
  const [voucherPrice, setVoucherPrice] = useState(0);
  const [inviteCount, setInviteCount] = useState(0);
  const [payType, setPayType] = useState(1); // 1: wechat, 2: alipay
  const [paying, setPaying] = useState(false)

  async function buy (planId: number) {
    setPaying(true)
    try {
      if (payType === 1) {
        const res = await fetch(`/api/weichat/pay?planId=${planId}`);
        const payInfo = (await res.json());
        setPayInfo(payInfo);
        if (payInfo.tradeNo) {
          orderPolling.current = window.setInterval(async () => {
            const res: CustomResponseType = await fetchJson(`/api/weichat/queryOrder?tradeNo=${payInfo.tradeNo}`);
            if (res.status === 'COMPLETE') {
              setPayInfo({
                payUrl: null,
                tradeNo: null,
                orderPrice: 0
              });
              message.success('支付成功');
              clearInterval(orderPolling.current);
              if (payCallback && typeof payCallback === 'function') {
                payCallback(planId);
              }
            } else if (res.status === 'failed') {
              message.error(res.message);
              clearInterval(orderPolling.current);
              return
            }
          }, 1000);
        } else {
          message.error('获取支付信息失败');
        }
      } else if (payType === 2) {
        //TODO alipay
      }
    } catch (e) {
      console.error('pay failed', e)
    } finally {
      setPaying(false)
    }
  }

  useEffect(() => {
    if (!user?.userCode) {
      return;
    }
    const fetchVoucher = async () => {
      const res: CustomResponseType = await fetchJson(`/api/user/queryVoucher`);
      if (res.status === 'ok') {
        setVoucherPrice(res.data?.voucherPrice);
        setInviteCount(res.data?.inviteCount)
      }
    };
    fetchVoucher();
  }, [user?.userCode]);

  function onCancelPay () {
    setPayInfo({
      payUrl: null,
      tradeNo: null,
      orderPrice: 0
    });
    clearInterval(orderPolling.current);
  }

  function countPrice(price: number) {
    return Math.max(0.01, price - voucherPrice);
  }

  return (
    <div
      className="text-black w-full min-h-[300px] rounded-3xl flex justify-center items-center py-6 gap-5 flex-wrap"
      style={{ backgroundColor: "rgba(56,114,224,.04)" }}
    >
      <Modal
        title={`${payType === 1 ? '微信' : '支付宝'}支付`}
        width="fit-content"
        open={!!payInfo.payUrl}
        onCancel={onCancelPay}
        footer={null}
      >
        {payInfo?.payUrl && 
        <div className='w-full flex flex-col justify-center items-center gap-2'>
          {payType === 1 && <h1 className='font-bold'>微信扫一扫付款</h1>}
          {payInfo?.orderPrice > 0 && <p className='text-lg text-red-500 font-bold'>￥{payInfo?.orderPrice}</p>}
          <QRCode value={payInfo?.payUrl} size={300} />
        </div>}
      </Modal>
      {voucherPrice > 0 && <p className='w-full flex justify-center items-center'>
        <span>邀请了</span>
        <span className='text-lg text-red-500 mx-2 font-bold'>{inviteCount}</span>
        <span>个用户购买，可抵扣</span>
        <span className='text-lg text-red-500 mx-2 font-bold'>{voucherPrice}</span>
        <span>元</span>
      </p>}
      <div className='w-full flex justify-center items-center'>
        <Radio.Group name="radiogroup" defaultValue={payType} className='flex justify-center items-center' onChange={e => { setPayType(e.target.value) }}>
          <Radio value={1}><WechatOutlined className='text-lg mr-2 text-green-600' rev='' />微信支付</Radio>
          <Radio value={2} disabled><AlipayCircleOutlined className='text-lg mr-2 text-blue-500' rev='' />支付宝支付</Radio>
        </Radio.Group>
      </div>
      <div className="bg-white rounded-3xl md:min-w-[250px] md:min-h-[350px] flex flex-col items-center justify-center p-4 gap-3">
        <h1 className="text-lg flex justify-center items-center" style={{ color: "#637381" }}>
          {PRICING_PLAN[0].name}
          {voucherPrice > 0 && <GiftOutlined rev='' className='text-red-500 ml-2' />}
        </h1>
        <p className="flex items-center">
          <span className="font-bold text-2xl">
            ￥{(!voucherPrice || voucherPrice <= 0) && <span>{PRICING_PLAN[0].price}</span>}
            {voucherPrice > 0 && 
            <>
              <span className='mr-2 text-gray-500 line-through'>{PRICING_PLAN[0].price}</span>
              <Popover content={`邀请了${inviteCount}个用户，已抵扣${voucherPrice}元`}>
                <span className='text-red-500 cursor-pointer'>{countPrice(PRICING_PLAN[0].price)}</span>
              </Popover>
            </>}
          </span>
          <span className="text-base"> /一周</span>
        </p>
        <button
          className="w-full cursor-pointer bg-gradient-to-br from-blue-500 to-blue-900 shadow-md hover:shadow-lg text-white font-medium py-2 px-4 rounded"
          onClick={() => {
            buy(1);
          }}
          disabled={paying}
        >
          订阅
        </button>
        <div className="px-4 flex flex-col items-start justify-center gap-1">
          <p className="flex items-center">
            <CheckCircleFilled rev='' className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>边缘计算，极速访问</span>
          </p>
          <p className="flex items-center">
            <CheckCircleFilled rev='' className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>支持上下文关联查询</span>
          </p>
          <p className="flex items-center">
            <CheckCircleFilled rev='' className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>会话管理个性化调教</span>
          </p>
          <p className="flex items-center">
            <CheckCircleFilled rev='' className="w-4 h-4 float-left mr-2 text-green-500" />
            <span className="font-bold mr-1">
              {PRICING_PLAN[0].queryCount}
            </span>
            <span style={{ color: "#000000a6" }}>次查询</span>
          </p>
          <p className="flex items-center">
            <CheckCircleFilled rev='' className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>聊天记录一键导出</span>
          </p>
          <p className="flex items-center">
            <CheckCircleFilled rev='' className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>一周时效性</span>
          </p>
        </div>
      </div>
      <div className="bg-white rounded-3xl md:min-w-[250px] md:min-h-[350px] flex flex-col items-center justify-center p-4 gap-3">
        <h1 className="text-lg text-indigo-700 flex justify-center">
          {PRICING_PLAN[1].name}
          {voucherPrice > 0 && <GiftOutlined rev='' className='text-red-500 ml-2' />}
        </h1>
        <p className="flex items-center">
          <span className="font-bold text-2xl">
            ￥
            {(!voucherPrice || voucherPrice <= 0) && <span>{PRICING_PLAN[1].price}</span>}
            {voucherPrice > 0 && 
            <>
              <span className='mr-2 text-gray-500 line-through'>{PRICING_PLAN[1].price}</span>
              <Popover content={`邀请了${inviteCount}个用户，已抵扣${voucherPrice}元`}>
                <span className='text-red-500 cursor-pointer'>{countPrice(PRICING_PLAN[1].price)}</span>
              </Popover>
            </>}
          </span>
          <span className="text-base"> /{PRICING_PLAN[1].label}</span>
        </p>
        <button
          className="w-full bg-gradient-to-br from-blue-500 to-blue-900 shadow-md hover:shadow-lg text-white font-medium py-2 px-4 rounded"
          onClick={() => {
            buy(2);
          }}
          disabled={paying}
        >
          订阅
        </button>
        <div className="px-4 flex flex-col items-start justify-center gap-1">
          <p className="flex items-center">
            <CheckCircleFilled rev='' className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>边缘计算，极速访问</span>
          </p>
          <p className="flex items-center">
            <CheckCircleFilled rev='' className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>支持上下文关联查询</span>
          </p>
          <p className="flex items-center">
            <CheckCircleFilled rev='' className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>会话管理个性化调教</span>
          </p>
          <p className="flex items-center">
            <CheckCircleFilled rev='' className="w-4 h-4 float-left mr-2 text-green-500" />
            <span className="font-bold mr-1">
              {PRICING_PLAN[1].queryCount}
            </span>
            <span style={{ color: "#000000a6" }}>次查询</span>
          </p>
          <p className="flex items-center">
            <CheckCircleFilled rev='' className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>聊天记录一键导出</span>
          </p>
          <p className="flex items-center">
            <CheckCircleFilled rev='' className="w-4 h-4 float-left mr-2 text-green-500" />
            <span className="font-bold mr-1">一个月</span><span style={{ color: "#000000a6" }}>深度体验</span>
          </p>
        </div>
      </div>
      <div className="relative bg-white rounded-3xl md:min-w-[250px] md:min-h-[350px] flex flex-col items-center justify-center p-4 gap-3">
        <Image className="absolute top-0 left-0" src="/pro.svg" width={64} height={64} alt="logo" />
        <h1 className="text-lg text-violet-700 flex justify-center">
          {PRICING_PLAN[2].name}
          {voucherPrice > 0 && <GiftOutlined rev='' className='text-red-500 ml-2' />}
        </h1>
        <p className="flex items-center">
          <span className="font-bold text-2xl">
            ￥
            {(!voucherPrice || voucherPrice <= 0) && <span>{PRICING_PLAN[2].price}</span>}
            {voucherPrice > 0 && 
            <>
              <span className='mr-2 text-gray-500 line-through'>{PRICING_PLAN[2].price}</span>
              <Popover content={`邀请了${inviteCount}个用户，已抵扣${voucherPrice}元`}>
                <span className='text-red-500 cursor-pointer'>{countPrice(PRICING_PLAN[2].price)}</span>
              </Popover>
            </>}
          </span>
          <span className="text-base"> /{PRICING_PLAN[2].label}</span>
        </p>
        <button
          className="w-full bg-gradient-to-br from-blue-500 to-blue-900 shadow-md hover:shadow-lg text-white font-medium py-2 px-4 rounded"
          onClick={() => {
            buy(3);
          }}
          disabled={paying}
        >
          订阅
        </button>
        <div className="px-4 flex flex-col items-start justify-center gap-1">
          <p className="flex items-center">
            <CheckCircleFilled rev='' className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>边缘计算，极速访问</span>
          </p>
          <p className="flex items-center">
            <CheckCircleFilled rev='' className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>支持上下文关联查询</span>
          </p>
          <p className="flex items-center">
            <CheckCircleFilled rev='' className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>会话管理个性化调教</span>
          </p>
          <p className="flex items-center">
            <CheckCircleFilled rev='' className="w-4 h-4 float-left mr-2 text-green-500" />
            <span className="font-bold mr-1">9999</span>
            <span style={{ color: "#000000a6" }}>次查询</span>
          </p>
          <p className="flex items-center">
            <CheckCircleFilled rev='' className="w-4 h-4 float-left mr-2 text-green-500" />
            <span style={{ color: "#000000a6" }}>聊天记录一键导出</span>
          </p>
          <p className="flex items-center">
            <CheckCircleFilled rev='' className="w-4 h-4 float-left mr-2 text-green-500" />
            <span className="font-bold mr-1">三个月</span><span style={{ color: "#000000a6" }}>无限畅玩</span>
          </p>
          {/* <div className="flex items-start justify-center flex-col">
            <p className="flex items-center" style={{ color: "#000000a6" }}><CheckCircleFilled rev='' className="w-4 h-4 float-left mr-2 text-green-500" />专业玩家，支持设置</p>
            <p className="text-sm" style={{ color: "#000000a6" }}>role、max_token、temperature等</p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
