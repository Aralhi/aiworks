import Link from 'next/link';
import { useEffect, useState } from 'react';
import useUser from '@/lib/userUser';
import fetchJson from '@/lib/fetchJson';
import { useRouter } from 'next/router';
import { AVATARS } from '@/utils/constants';
import Image from 'next/image';
import { isPC } from '../utils';

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, mutateUser } = useUser();
  const router = useRouter();
  const query = router.query;

  useEffect(() => {
    setIsMobile(isPC() ? false : true);
  })

  function avatarClick() {
    setShowMenu(!showMenu);
  }

  function userInfoClick() {
    setShowMenu(false);
    if (!user?.isLoggedIn) {
      // 未登录跳转到登录页
      if (router.pathname !== '/login') {
        router.push({
          pathname: '/login',
          query: Object.assign({}, query, { originUrl: router.pathname }),
        });
      }
      return;
    }
    router.push({ pathname: '/user', query });
  }

  async function logout() {
    setShowMenu(false);
    mutateUser(await fetchJson('/api/user/logout', { method: 'POST' }), false);
    router.push({
      pathname: '/login',
      query: Object.assign({}, query, { originUrl: router.pathname }),
    });
  }

  return (
    <header className="w-full bg-black shadow z-10 md:px-6 h-[60px]">
      <nav className="flex justify-between items-center h-full">
        <Link href="/">
          <Image width={120} height={32} alt="logo" src="/aiworks-long.png" />
        </Link>
        <div className="navigation text-white">
          <ul className="flex">
            <li className="mr-2 md:mr-6 flex items-center">
              <Link href={{ pathname: '/chat', query }}>Chat</Link>
            </li>
            <li className="mr-2 md:mr-6 flex items-center">
              <Link href={{ pathname: '/midjourney', query }}>Midjourney</Link>
            </li>
            {/* {!isMobile && <li className="mr-2 md:mr-6 flex items-center">
              <Link href={{ pathname: '/tutorial', query }}>教程</Link>
            </li>} */}
            <li className="mr-2 md:mr-6 flex items-center">
              <Link href={{ pathname: '/pricing', query }}>价格</Link>
            </li>
            {!isMobile && <li className="relative z-50" onClick={avatarClick}>
              <a href="#">
                <img src={user?.avatarUrl || AVATARS[0]} alt="Avatar" className="rounded-full w-8 h-8" />
              </a>
              {showMenu && (
                <div className="absolute bg-black text-white mt-2 translate-x-[-50%]">
                  <div
                    className="w-20 h-10 text-center flex flex-col justify-center border-b border-gray-200 dark:border-gray-800 cursor-pointer"
                    onClick={userInfoClick}
                  >
                    用户中心
                  </div>
                  <div
                    className="w-20 h-10 text-center flex flex-col justify-center border-b border-gray-200 dark:border-gray-800 cursor-pointer"
                    onClick={logout}
                  >
                    登出
                  </div>
                </div>
              )}
            </li>}
          </ul>
        </div>
      </nav>
    </header>
  );
}
