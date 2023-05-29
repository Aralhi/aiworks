import { useEffect, useRef, useState } from 'react';
import { PRICING_PLAN } from "@/utils/constants";
import Image from "next/image";
import { Modal, Popover, QRCode, Radio, RadioChangeEvent, message } from 'antd';
import { AlipayCircleOutlined, CheckCircleFilled, GiftOutlined, WechatOutlined } from '@ant-design/icons';
import useUser from '@/lib/userUser';
import fetchJson, { CustomResponseType } from '@/lib/fetchJson';
import { calDiscountPrice, calOrderPrice, isInWeChat } from '../utils';
import { useRouter } from 'next/router';

const PRICING_TYPES = [
  { label: 'chatGPT', value: 'chatGPT'},
  { label: 'Midjourney', value: 'Midjourney' }
]

export default function PriceCard({ payCallback }: { payCallback?: Function }) {
  const chatPlans = PRICING_PLAN.filter(i => i.type === 'chatGPT')
  const mjPlans = PRICING_PLAN.filter(i => i.type === 'midjourney')
  const { user } = useUser()
  const [payInfo, setPayInfo] = useState({
    payUrl: null,
    tradeNo: null,
    orderPrice: 0,
  });
  const orderPolling = useRef<number|undefined>();
  const [inviteCount, setInviteCount] = useState(0);
  const [payType, setPayType] = useState(1); // 1: wechat, 2: alipay
  const [paying, setPaying] = useState(false)
  const router = useRouter();
  const [selected, setSelected] = useState(PRICING_TYPES[0].value)
  const radioChange = ({ target: { value } }: RadioChangeEvent) => {
    setSelected(value);
  };

  async function buy (planId: number) {
    setPaying(true)
    try {
      if (payType === 1) {
        const type = isInWeChat() ? 'jsapi' : 'native';
        const res = await fetch(`/api/weichat/pay?planId=${planId}&type=${type}`);
        const payInfo = (await res.json());
        setPayInfo(payInfo);
        if (payInfo.tradeNo) {
          if (type === 'jsapi') {
            WeixinJSBridge.invoke('getBrandWCPayRequest', {
              ...payInfo.prePayParams,
            },
            function(res: any) {
                if (res.err_msg == "get_brand_wcpay_request:ok") {
                    // 使用以上方式判断前端返回,微信团队郑重提示：
                    //res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
                    message.success('支付成功');
                    if (payCallback && typeof payCallback === 'function') {
                      payCallback(planId);
                    }
                  } else {
                    message.success('支付失败，请重试');
                }
            });
          } else {
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
            }, 2000);
          }
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
        setInviteCount(res.data?.inviteCount)
      }
    };
    fetchVoucher();
  }, [user?.userCode]);

  useEffect(() => {
    document.title = '订阅 | AI works';
    if (router.query?.type) {
      setSelected(router.query.type as string);
    }
  }, []);

  function onCancelPay () {
    setPayInfo({
      payUrl: null,
      tradeNo: null,
      orderPrice: 0
    });
    clearInterval(orderPolling.current);
  }

  const chatPricing = (
    <>
      <div className="bg-white rounded-3xl md:min-w-[250px] md:min-h-[350px] flex flex-col items-center justify-center p-4 gap-3">
        <h1 className="text-lg flex justify-center items-center" style={{ color: "#637381" }}>
          {chatPlans[0].name}
          {inviteCount > 0 && <GiftOutlined rev='' className='text-red-500 ml-2' />}
        </h1>
        <p className="flex items-center">
          <span className="font-bold text-2xl">
            ￥{(!inviteCount || inviteCount <= 0) && <span>{chatPlans[0].price}</span>}
            {inviteCount > 0 &&
            <>
              <span className='mr-2 text-gray-500 line-through'>{chatPlans[0].price}</span>
              <Popover content={`邀请了${inviteCount}个用户，已抵扣${calDiscountPrice(chatPlans[0].price, inviteCount)}元`}>
                <span className='text-red-500 cursor-pointer'>{calOrderPrice(chatPlans[0].price, inviteCount)}</span>
              </Popover>
            </>}
          </span>
          <span className="text-base"> /周</span>
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
              {chatPlans[0].queryCount}
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
          {chatPlans[1].name}
          {inviteCount > 0 && <GiftOutlined rev='' className='text-red-500 ml-2' />}
        </h1>
        <p className="flex items-center">
          <span className="font-bold text-2xl">
            ￥
            {(!inviteCount || inviteCount <= 0) && <span>{chatPlans[1].price}</span>}
            {inviteCount > 0 &&
            <>
              <span className='mr-2 text-gray-500 line-through'>{chatPlans[1].price}</span>
              <Popover content={`邀请了${inviteCount}个用户，已抵扣${calDiscountPrice(chatPlans[1].price, inviteCount)}元`}>
                <span className='text-red-500 cursor-pointer'>{calOrderPrice(chatPlans[1].price, inviteCount)}</span>
              </Popover>
            </>}
          </span>
          <span className="text-base"> /{chatPlans[1].label}</span>
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
              {chatPlans[1].queryCount}
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
          {chatPlans[2].name}
          {inviteCount > 0 && <GiftOutlined rev='' className='text-red-500 ml-2' />}
        </h1>
        <p className="flex items-center">
          <span className="font-bold text-2xl">
            ￥
            {(!inviteCount || inviteCount <= 0) && <span>{chatPlans[2].price}</span>}
            {inviteCount > 0 &&
            <>
              <span className='mr-2 text-gray-500 line-through'>{chatPlans[2].price}</span>
              <Popover content={`邀请了${inviteCount}个用户，已抵扣${calDiscountPrice(chatPlans[2].price, inviteCount)}元`}>
                <span className='text-red-500 cursor-pointer'>{calOrderPrice(chatPlans[2].price, inviteCount)}</span>
              </Popover>
            </>}
          </span>
          <span className="text-base"> /{chatPlans[2].label}</span>
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
    </>
  )

  const mjPricing = (
    <>
      <div className="bg-white rounded-3xl md:min-w-[250px] md:min-h-[350px] flex flex-col items-center justify-center p-4 gap-3">
        <h1 className="text-lg flex justify-center items-center" style={{ color: "#637381" }}>
          {mjPlans[0].name}
          {inviteCount > 0 && <GiftOutlined rev='' className='text-red-500 ml-2' />}
        </h1>
        <p className="flex items-center">
          <span className="font-bold text-2xl">
            ￥{(!inviteCount || inviteCount <= 0) && <span>{mjPlans[0].price}</span>}
            {inviteCount > 0 &&
            <>
              <span className='mr-2 text-gray-500 line-through'>{mjPlans[0].price}</span>
              <Popover content={`邀请了${inviteCount}个用户，已抵扣${calDiscountPrice(mjPlans[0].price, inviteCount)}元`}>
                <span className='text-red-500 cursor-pointer'>{calOrderPrice(mjPlans[0].price, inviteCount)}</span>
              </Popover>
            </>}
          </span>
          <span className="text-base"> /{mjPlans[0].label}</span>
        </p>
        <button
          className="w-full cursor-pointer bg-gradient-to-br from-blue-500 to-blue-900 shadow-md hover:shadow-lg text-white font-medium py-2 px-4 rounded"
          onClick={() => {
            buy(4);
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
              {chatPlans[0].queryCount}
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
      <div className="bg-white rounded-3xl md:min-w-[250px] md:min-h-[350px] flex flex-col items-center justify-center p-4 gap-3 relative">
        <Image className="absolute top-0 left-0" src="/pro.svg" width={64} height={64} alt="logo" />
        <h1 className="text-lg flex justify-center items-center text-violet-700">
          {mjPlans[1].name}
          {inviteCount > 0 && <GiftOutlined rev='' className='text-red-500 ml-2' />}
        </h1>
        <p className="flex items-center">
          <span className="font-bold text-2xl">
            ￥{(!inviteCount || inviteCount <= 0) && <span>{mjPlans[1].price}</span>}
            {inviteCount > 0 &&
            <>
              <span className='mr-2 text-gray-500 line-through'>{mjPlans[1].price}</span>
              <Popover content={`邀请了${inviteCount}个用户，已抵扣${calDiscountPrice(mjPlans[1].price, inviteCount)}元`}>
                <span className='text-red-500 cursor-pointer'>{calOrderPrice(mjPlans[1].price, inviteCount)}</span>
              </Popover>
            </>}
          </span>
          <span className="text-base"> /{mjPlans[1].label}</span>
        </p>
        <button
          className="w-full cursor-pointer bg-gradient-to-br from-blue-500 to-blue-900 shadow-md hover:shadow-lg text-white font-medium py-2 px-4 rounded"
          onClick={() => {
            buy(5);
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
              {chatPlans[0].queryCount}
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
    </>
  )

  return (
    <div
      className="text-black w-full min-h-[300px] rounded-3xl flex justify-center items-center py-6 gap-5 flex-wrap"
      style={{ backgroundColor: "rgba(56,114,224,.04)" }}
    >
      <div className="flex items-center px-4 py-2 price-radio" id="pricing-type-radio">
        <Radio.Group value={selected} options={PRICING_TYPES} onChange={radioChange} className="flex flex-1 gap-4">
        </Radio.Group>
      </div>
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
      {inviteCount > 0 && <p className='w-full flex justify-center items-center'>
        <span>邀请了</span>
        <span className='text-lg text-red-500 mx-2 font-bold'>{inviteCount}</span>
        <span>个用户购买，可抵扣</span>
        <span className='text-lg text-red-500 mx-2 font-bold'>{calDiscountPrice(chatPlans[2].price, inviteCount)}</span>
        <span>元</span>
      </p>}
      <div className='w-full flex justify-center items-center'>
        <Radio.Group name="radiogroup" defaultValue={payType} className='flex justify-center items-center px-4 py-2' id="pay-type-radio" onChange={e => { setPayType(e.target.value) }}>
          <Radio value={1}><WechatOutlined className='text-lg mr-2 text-green-600' rev='' />微信支付</Radio>
          <Radio value={2} disabled><AlipayCircleOutlined className='text-lg mr-2 text-blue-500' rev='' />支付宝支付</Radio>
        </Radio.Group>
      </div>
      {selected === 'chatGPT' && chatPricing}
      {selected === 'Midjourney' && mjPricing}
    </div>
  );
}
