import useUser from "@/lib/userUser";
import { useState, ChangeEvent, useEffect } from "react";
import PriceCard from "@/components/PriceCard";
import { AVATARS, USERNAME_LENGTH } from "@/utils/constants";
import fetchJson, { CustomResponseType } from "@/lib/fetchJson";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import { InferGetServerSidePropsType } from "next";
import { getTodayTime, formatUTCTime } from "@/utils/index";
import Completion from "@/models/Completion";
import { Button, Divider, QRCode, message } from "antd";
import { AccountBookOutlined, CopyFilled, GiftTwoTone, UserOutlined } from "@ant-design/icons";

function UserFC({ todayQueryCount, leftQueryCount, inviteList }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { user } = useUser();
  const [currentIndex, setCurrentIndex] = useState(1);
  const [userName, setUserName] = useState(user?.name || '')
  const [userAvatar, setUserAvatar] = useState(user?.avatarUrl || '')
  const [inviteUrl, setInviteUrl] = useState('')
  if (user && (!user?.pricings || user?.pricings.length <= 0)) {
    user.pricings = [{
      type: 'free',
      name: '免费',
      status: 'active',
      queryCount: 10,
      startAt: 0,
      endAt: 0
    }]
  }

  function userNameChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length > USERNAME_LENGTH) {
      message.error('用户名长度不能超过10个字符')
      return
    }
    setUserName(e.target.value)
  }

  function selectAvatar(index: number) {
    setUserAvatar(AVATARS[index])
  }

  useEffect(() => {
    // 规避第一次user为空的情况
    if (!user?.name) {
      document.title = `${user?.name}-用户中心`
    }
    setUserName(user?.name || '')
    setUserAvatar(user?.avatarUrl || '')
    setInviteUrl(`${location.origin}/login?c=${user?.userCode}`)
  }, [user])

  async function copyCode () {
    try {
      await navigator.clipboard.writeText(user?.userCode || '')
      message.success('复制成功')
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  async function saveUser() {
    const body: any = {}
    let checked = false
    if (userName !== user?.name) {
      body.name = userName
      checked = true
    }
    if (user?.avatarUrl !== userAvatar) {
      body.avatarUrl = userAvatar
      checked = true
    }
    if (!checked) {
      return message.error('请修改后再保存')
    }
    const res:CustomResponseType = await fetchJson('/api/user/user', {
      method: 'PUT',
      body: JSON.stringify(body)
    })
    message.success(res.message)
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      message.success('复制成功')
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const downloadQRCode = () => {
    const canvas = document.getElementById('myqrcode')?.querySelector<HTMLCanvasElement>('canvas');
    if (canvas) {
      const url = canvas.toDataURL();
      const a = document.createElement('a');
      a.download = 'QRCode.png';
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="w-full flex pt-[80px]">
      <div
        id="user-menu"
        className="md:w-[250px] md:min-w-[200px] bg-white border-gray-400 border-r float-left"
      >
        <ul className="w-full md:px-4">
          <li
            className={`cursor-pointer flex items-center md:px-6 sm:px-2 py-2 ${
              currentIndex === 1 ? "bg-gray-200 text-cyan-700" : "text-gray-700"
            } hover:bg-gray-100`}
            onClick={() => {
              setCurrentIndex(1);
            }}
          >
            <AccountBookOutlined rev='' className="w-4 h-4 mr-4" />
            <span>账单</span>
          </li>
          <li
            className={`cursor-pointer flex items-center md:px-6 sm:px-2 py-2 ${
              currentIndex === 2 ? "bg-gray-200 text-cyan-700" : "text-gray-700"
            } hover:bg-gray-100`}
            onClick={() => {
              setCurrentIndex(2);
            }}
          >
            <UserOutlined rev='' className="w-4 h-4 mr-4" />
            <span>账户</span>
          </li>
          <li
            className={`cursor-pointer flex items-center md:px-6 sm:px-2 py-2 ${
              currentIndex === 3 ? "bg-gray-200 text-cyan-700" : "text-gray-700"
            } hover:bg-gray-100`}
            onClick={() => {
              setCurrentIndex(3);
            }}
          >
            <GiftTwoTone rev='' className="w-4 h-4 mr-4" />
            <span>奖励</span>
          </li>
        </ul>
      </div>
      <div id="user-info" className="h-screen w-full">
        {currentIndex === 1 && (
          <div className="p-4">
            <h1 className="text-2xl">套餐</h1>
            <div className="flex gap-6 flex-row">
              {(user?.pricings?.map(pricing => (
                <div className="flex flex-col gap-4 p-4 mt-6 w-1/2 shadow-md transition duration-300 ease-out delay-0">
                <p>
                  <span className="text-gray-400 mr-2">当前的套餐是</span>
                  <span className="font-bold text-black">
                    {pricing?.name || "免费"}
                  </span>
                </p>
                <p>
                  {!pricing?.name && <>
                    <span className="text-gray-400">每天只有</span>
                    <span className="font-bold text-black mx-2">
                      {pricing?.queryCount || 10}
                    </span>
                    <span className="text-gray-400">查询次数</span>
                  </>}
                  {pricing?.name && <>
                    <span className="text-gray-400">您共有</span>
                    <span className="font-bold text-black mx-2">
                      {pricing?.queryCount || 10}
                    </span>
                    <span className="text-gray-400">查询次数</span>
                  </>}
                </p>
                <p>
                  <span className="text-gray-400 mr-4">似乎不够用？</span>
                  <a className="text-blue-600" href="/pricing">
                    获取更多
                  </a>
                </p>
              </div>
              )))}
              <div className="flex justify-center items-center gap-4 p-4 mt-6 w-1/2 shadow-md transition duration-300 ease-out delay-0">
                <div className="flex flex-col gap-5 text-center">
                  <div className="text-lg text-black">{todayQueryCount < 0 ? '-' : todayQueryCount}</div>
                  <div className="">今天的请求次数</div>
                </div>
                {/* <div className="w-[1px] bg-gray-500 h-[38px] mt-6"></div>
                <div className="flex flex-col gap-5 text-center">
                  <div className="text-lg text-black">{leftQueryCount < 0 ? '-' : leftQueryCount}</div>
                  <div className="">剩余请求次数</div>
                </div> */}
              </div>
            </div>
            <h1 className="text-2xl my-4">高级套餐</h1>
            <PriceCard />
          </div>
        )}
        {currentIndex === 2 && (
          <div className="p-4">
            <h1 className="text-2xl">账户信息</h1>
            <div className="flex gap-6 flex-wrap justify-start p-6">
              <div className="w-full flex-grow items-center">
                <span className="font-bold md:w-[100px] inline-block mr-4">
                  头像:
                </span>
                <div className="flex justify-start items-center flex-wrap gap-6">
                  <img
                    className={`cursor-pointer w-[64px] h-[64px] ${
                      userAvatar === AVATARS[0]
                        ? "border border-solid border-violet-700"
                        : ""
                    }`}
                    src={AVATARS[0]}
                    onClick={() => {
                      selectAvatar(0);
                    }}
                  />
                  <img
                    className={`cursor-pointer w-[64px] h-[64px] ${
                      userAvatar === AVATARS[1]
                        ? "border border-solid border-violet-700"
                        : ""
                    }`}
                    src={AVATARS[1]}
                    onClick={() => {
                      selectAvatar(1);
                    }}
                  />
                  <img
                    className={`cursor-pointer w-[64px] h-[64px] ${
                      userAvatar === AVATARS[2]
                        ? "border border-solid border-violet-700"
                        : ""
                    }`}
                    src={AVATARS[2]}
                    onClick={() => {
                      selectAvatar(2);
                    }}
                  />
                </div>
              </div>
              <div className="w-full flex-grow">
                <span className="font-bold md:w-[100px] inline-block mr-4">
                  用户昵称:
                </span>
                <input
                  className="border p-2"
                  value={userName}
                  onChange={userNameChange}
                ></input>
              </div>
              <div className="w-full flex-grow">
                <span className="font-bold md:w-[100px] inline-block mr-4">
                  用户邀请码:
                </span>
                <span>{user?.userCode}</span>
                <span
                  className="ml-6 text-blue-700 inline-block cursor-pointer underline"
                  onClick={copyCode}
                >
                  复制邀请码
                </span>
              </div>
              <div className="flex-grow">
                <button
                  className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={saveUser}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
        {currentIndex === 3 && (
          <div className="p-4 w-[900px]">
            <h1 className="text-2xl">参与过程</h1>
            <div
              className="flex flex-col p-6 justify-center rounded-2xl my-6"
              style={{ backgroundColor: "rgba(56, 114, 224, 0.04)" }}
            >
              <div className="items-center flex flex-row gap-5 justify-center">
                <div className="w-[40px] h-[40px] bg-white flex justify-center items-center border-2 border-solid border-{reward-gray} border-rad rounded-full" style={{ WebkitBoxShadow: '0 0 0 2px #fff' }}>🔗</div>
                <div className="flex items-center flex-row w-[190px]">
                  <div className="flex-1" style={{ height: '1px', border: '1px dashed rgba(56,114,224,.56)' }}></div>
                  <div className="rotate-90" style={{borderBottom: '6px solid rgba(56,114,224,.56)', borderLeft: '3px solid transparent', borderRight: '3px solid transparent' }}></div>
                </div>
                <div className="w-[40px] h-[40px] bg-white flex justify-center items-center border-2 border-solid border-{reward-gray} border-rad rounded-full" style={{ WebkitBoxShadow: '0 0 0 2px #fff' }}>🖥️</div>
                <div className="flex items-center flex-row w-[190px]">
                  <div className="flex-1" style={{ height: '1px', border: '1px dashed rgba(56,114,224,.56)' }}></div>
                  <div className="rotate-90" style={{borderBottom: '6px solid rgba(56,114,224,.56)', borderLeft: '3px solid transparent', borderRight: '3px solid transparent' }}></div>
                </div>
                <div className="w-[40px] h-[40px] bg-white flex justify-center items-center border-2 border-solid border-{reward-gray} border-rad rounded-full" style={{ WebkitBoxShadow: '0 0 0 2px #fff' }}>🎁</div>
              </div>
              <div className="items-center flex flex-row gap-5 justify-center mt-4">
                <p className="flex-1 text-center">通过邀请链接邀请好友</p>
                <p className="flex-1 text-center">好友注册账户</p>
                <p className="flex-1 text-center">您和您的朋友各获得1个MJ调用额</p>
              </div>
              <Divider />
              <div className="flex justify-between items-center">
                <div className="bg-white flex h-[40px] overflow-hidden w-1/2 mt-6" style={{ border: '1px solid #212b36', borderRadius: '8px' }}>
                  <input className="py-4 flex-1 text-gray-950 outline-none pl-2" disabled style={{ color: '#212b36', lineHeight: '40px' }} value={inviteUrl}/>
                  <div className="flex py-4 items-center flex-row justify-center gap-4 text-white cursor-pointer" style={{ backgroundColor: '#212b36', width: '140px', lineHeight: '40px', userSelect: 'none' }}
                    onClick={copyUrl}>
                    <CopyFilled rev='' />复制
                  </div>
                </div>
                <div id="myqrcode" className="flex flex-col justify-start items-center w-1/2">
                  <QRCode className="mt-2" value={inviteUrl}/>
                  <Button className="w-[100px]" onClick={downloadQRCode}>下载</Button>
                </div>
              </div>
            </div>
            <h1 className="text-2xl">记录</h1>
            <table className="flex justify-center items-center flex-1 w-full flex-row flex-wrap p-4">
              <thead className="w-full">
                <tr className="w-full flex justify-center flex-row flex-1 bg-gray-100">
                  <th className="w-1/2 py-4" style={{ border: '1px solid violet', borderRight: 'none' }}>用户</th>
                  <th className="w-1/2 py-4" style={{ border: '1px solid violet' }}>创建时间</th>
                </tr>
              </thead>
              <tbody className="w-full">
                {(inviteList || []).map((item: any, index: number) => (
                  <tr key={`invite_${index}`} className="w-full flex justify-center items-center flex-row flex-1">
                    <td className="w-1/2 text-center h-[48px]" style={{ lineHeight: '48px', border: '1px solid violet', borderRight: 'none', borderTop: index === 0 ? 'none' : '' }}>
                      {item.name}
                    </td>
                    <td className="w-1/2 text-center h-[48px]" style={{ lineHeight: '48px', border: '1px solid violet', borderTop: index === 0 ? 'none' : '' }}>
                      {item.createAt ? formatUTCTime(item.createAt) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
export default UserFC;

export const getServerSideProps = withIronSessionSsr(async ({ req, res }) => {
  const defaultProps = { todayQueryCount: -1, leftQueryCount: -1, inviteList: [] }
  if (!req.session.user || !req.session.user?.isLoggedIn) {
    // 未登录重定向到登录页
    res.statusCode = 302
    res.setHeader('Location', '/login')
    res.end()
    return {
      props: defaultProps,
    };
  }
  try {
    await dbConnect()
    // get today completion count by userId
    const [todayStartUTC, todayEndUTC] = getTodayTime()
    console.log('todayStartCST', todayStartUTC, todayEndUTC)
    const result = await Completion.aggregate([
      {
        $match: {
          $or: [
            {userId: req.session.user?._id},
            {fingerprint: req.session.user?.fingerprint}
          ],
          createAt: {
            $gte: new Date(todayStartUTC),
            $lte: new Date(todayEndUTC)
          }
        }
      },
      {
        $count: 'count',
      },
    ])
    const todayQueryCount = result[0]?.count || 0
    console.log('todayQueryCount', todayQueryCount)
    const inviteList = await User.find({ inviteCode: req.session.user?.userCode }).lean()
    return {
      props: {
        todayQueryCount,
        //TODO 统计剩余的次数
        leftQueryCount: -1,
        inviteList: JSON.parse(JSON.stringify(inviteList))
      },
    };
  } catch (err) {
    console.log('get user inviteList error', err)
    return {
      props: defaultProps,
    };
  }
}, sessionOptions)
