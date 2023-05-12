import { ChangeEvent, useState, useCallback, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { debounce } from 'lodash';
import fetchJson, { CustomResponseType } from '@/lib/fetchJson';
import { useRouter } from 'next/router';

const SMS_TIMEOUT = process.env.NODE_ENV === 'development' ? 1 : 120;

const Login = () => {
  const [phone, setPhone] = useState('');
  const [phoneCheck, setPhoneCheck] = useState(true);
  const [code, setCode] = useState('');
  const [codeCheck, setCodeCheck] = useState(true);
  const [isCodeButtonDisabled, setIsCodeButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(SMS_TIMEOUT);
  const router = useRouter();
  const inviteCode = router.query?.c

  useEffect(() => {
    let timer: any = null;
    if (isCodeButtonDisabled) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCodeButtonDisabled]);

  useEffect(() => {
    if (countdown === 0) {
      setIsCodeButtonDisabled(false);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!phone || !phoneCheck) {
      toast.error('请输入正确的手机号码');
      return
    }
    setIsCodeButtonDisabled(true);
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

  const phoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    debouncePhoneChange(e.target.value);
  };

  const codeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
    debounceCodeChange(e.target.value);
  };

  const debouncePhoneChange = useCallback(
    debounce(function(value) {
      checkPhone(value);
    }, 500)
  ,[])

  const debounceCodeChange = useCallback(
    debounce(function(value) {
      checkCode(value);
    }, 500)
  ,[])

  function checkPhone(value: string) {
    if (/^1[3-9]\d{9}$/.test(value || phone)) {
      setPhoneCheck(true);
    } else {
      setPhoneCheck(false);
    }
  }

  function checkCode(value: string) {
    if (/^\d{6}$/.test(value)) {
      setCodeCheck(true)
    } else {
      setCodeCheck(false)
    }
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">登录</h2>
      </div>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{ duration: 2000 }}
      />
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                电话：
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={phoneChange}
                  className="caret-violet-400 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            <label className='text-red-600 text-sm'>{!phoneCheck && '请输入正确的电话号码'}</label>
            </div>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                验证码：
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  id="code"
                  name="code"
                  type="text"
                  autoComplete="off"
                  required
                  value={code}
                  onChange={codeChange}
                  className="caret-violet-400 appearance-none block w-2/3 px-3 py-2 border border-gray-300 rounded-l-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isCodeButtonDisabled}
                  className="inline-flex items-center w-1/3 px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-r-md"
                >
                  {isCodeButtonDisabled ? `(${countdown}s)` : '获取验证码'}
                </button>
              </div>
              <label className='text-red-600 text-sm'>{!codeCheck && '请输入正确的验证码'}</label>
            </div>
            {inviteCode && <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                邀请码：
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  id="code"
                  name="code"
                  type="text"
                  autoComplete="off"
                  disabled
                  value={inviteCode}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-l-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>}
            <div>
              <button
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleLogin}
                disabled={loading || !phoneCheck || !codeCheck}
              >
                登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;