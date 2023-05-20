import { ChangeEvent, useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import fetchJson, { CustomResponseType } from '@/lib/fetchJson';
import { useRouter } from 'next/router';
import { Tabs, Checkbox, Input } from 'antd';
import type { TabsProps } from 'antd';
import { createQrCode } from '@/lib/weichat';
import Link from 'next/link';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import React from 'react';
import { InferGetServerSidePropsType } from 'next';
import { MP_WX_API } from '@/utils/constants';

const SMS_TIMEOUT = process.env.NODE_ENV === 'development' ? 5 : 60;
let protocolChecked = false;

const Login = ({ qrUrl, ticket }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [phoneCheck, setPhoneCheck] = useState(true);
  const [codeCheck, setCodeCheck] = useState(true);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(-1);
  const [qrStatus, setQrStatus] = useState('');
  const router = useRouter();
  const inviteCode = router.query?.c

  const tabItems: TabsProps['items'] = [
    {
      key: 'weixin',
      label: '微信登录',
      children: <WeixinLogin />
    },
    {
      key: 'phone',
      label: '手机号登录',
      children: <PhoneLogin />
    }
  ]

  const handleSendCode = async () => {
    if (countdown > 0) {
      return
    }
    if (!phone || !phoneCheck) {
      toast.error('请输入正确的手机号码');
      return
    }
    if (!protocolChecked) {
      toast.error('请阅读并同意用户协议');
      return
    }
    setCountdown(SMS_TIMEOUT);
    const res = await fetch('/api/sms/sendCode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone
      })
    })
    if (!res.ok) {
      toast.error('验证码发送失败');
    }
    const result = await res.json();
    if (result.status === 'ok') {
      toast.success('验证码发送成功');
    }
  };

  useEffect(() => {
    document.title = '登录 | AI works';
    if (ticket && qrUrl) {
      // 生成二维码成功，轮询二维码扫码状态
      const checkLogin = async () => {
        const res: CustomResponseType = await fetchJson(`/api/weichat/checkLogin?ticket=${ticket}&inviteCode=${inviteCode}`, {
          method: 'GET'
        })
        if (res && res.status === 'ok') {
          const originUrl = router.query.originUrl as string;
          if (originUrl) {
            // 重定向到原来的页面
            window.location.href = originUrl;
          } else {
            window.location.href = '/chat';
          }
        } else if (res.status === 'expired'){
          setQrStatus('expired');
          timerId && clearInterval(timerId);
        }
      };
      const timerId = setInterval(checkLogin, 1000); // 每隔1秒钟重新获取一次数据
      return () => clearInterval(timerId); // 卸载组件时清除定时器
    }
  }, [])

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }
    let timer: any = null;
    timer = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown])

  const phoneBlur = (e: ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value)
    checkPhone(e.target.value);
  };

  const codeBlur = (e: ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value)
    checkCode(e.target.value);
  };

  function checkPhone(phone: string) {
    if (/^1[3-9]\d{9}$/.test(phone)) {
      setPhoneCheck(true);
    } else {
      setPhoneCheck(false);
    }
  }

  function checkCode(code: string) {
    if (/^\d{6}$/.test(code)) {
      setCodeCheck(true)
    } else {
      setCodeCheck(false)
    }
  }

  function protocolClick (e: CheckboxChangeEvent) {
    protocolChecked = e.target.checked;
  }

  const handleLogin = async () => {
    setLoading(true);
    const res: CustomResponseType = await fetchJson('/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone,
        code,
        inviteCode
      })
    })
    setLoading(false);
    if (res && res?.status === 'ok') {
      toast.success('登录成功');
      const originUrl = router.query.originUrl as string;
      if (originUrl) {
        // 重定向到原来的页面
        window.location.href = originUrl;
      } else {
        window.location.href = '/chat';
      }
    } else {
      toast.error('登录失败');
    }
  };

  function refreshQRCode() {
    console.log('refreshQRCode');
  }

  function WeixinLogin() {
    return (
      <div className="flex justify-center items-center flex-col gap-4 relative min-h-[350px]">
        <p className="text-gray-400 text-center">微信扫码关注公众号完成登录</p>
        <div
          className="flex justify-center items-center w-[200px] h-[200px] md:w-[250px] md:h-[250px] bg-white bg-opacity-95"
        >
          <img src={qrUrl || ''} className='w-full h-full'/>
          {qrStatus === 'expired' && <>
            <span>二维码已过期，</span>
            <span className="cursor-pointer text-blue-500"
              onClick={refreshQRCode}
            >刷新
            </span></>}
        </div>
        <p> 登录即表示您已阅读并同意<Link className='text-blue-500 ml-2' href={'/protocol'} target='_blank'>服务条款</Link></p>
      </div>
    );
  }

  function PhoneLogin() {
    return (
      <div className="flex justify-center items-center bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 min-h-[350px] w-[300px] md:w-[400px]">
        <div className="space-y-6">
          <Input 
            placeholder='请输入手机号'
            addonBefore={<span>+86</span>}
            defaultValue={phone}
            className='w-full h-[40px]'
            onBlur={phoneBlur}
          />
          <label className='text-red-400 text-xs'>{!phoneCheck && '请输入正确的电话号码'}</label>
          <Input
            defaultValue={code}
            placeholder='请输入验证码'
            onBlur={codeBlur}
            addonAfter={<span className='cursor-pointer' onClick={handleSendCode}>{countdown > 0 ? `${countdown} 秒重新获取` : '获取验证码'}</span>}
            className='w-full h-[40px]'
          />
          <label className='text-red-400 text-xs'>{!codeCheck && '请输入正确的验证码'}</label>
          {inviteCode &&
            <Input
              disabled
              defaultValue={inviteCode}
              addonBefore={<span>邀请码</span>}
            />}
          <div>
            <Checkbox onChange={protocolClick} defaultChecked={protocolChecked} value={protocolChecked}>阅读并同意</Checkbox>
            <Link className='text-blue-500' href={'/protocol'} target='_blank'>《用户协议与隐私政策》</Link>
          </div>
          <div>
            <button
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleLogin}
              disabled={loading || !phoneCheck || !codeCheck}
            >登录
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">AI works，让AI触手可及 </h2>
      </div>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{ duration: 2000 }}
      />
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Tabs items={tabItems} centered size={'large'}/>
      </div>
    </div>
  );
};

export default Login;

export async function getServerSideProps() {
  // 生成二维码
  const result = await createQrCode();
  if (result?.ticket) {
    return {
      props: {
        ticket: result?.ticket,
        qrUrl: `${MP_WX_API}/cgi-bin/showqrcode?ticket=${encodeURIComponent(result?.ticket)}`
      }
    }
  }
  console.log('login getServerSideProps create qr', result);
  return {
    props: {
      ticket: null,
      qr: null
    }
  }
}