import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import useUser from "@/lib/userUser";
import fetchJson from "@/lib/fetchJson";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import { AVATARS } from "@/utils/constants";
import { Menu } from '@headlessui/react'


export default function Header() {
  const [showMenu, setShowMenu] = useState(false)
  const { user, mutateUser } = useUser()
  const router = useRouter()

  function avatarClick () {
    setShowMenu(!showMenu)
  }

  function userInfoClick () {
    setShowMenu(false)
    if (!user?.isLoggedIn) {
      // 未登录跳转到登录页
      if (router.pathname !== '/login') {
        router.push(`/login?originUrl=${router.pathname}`)
      }
      return
    }
  router.push('/user')    
  }

  async function logout() {
    setShowMenu(false)
    mutateUser(
      await fetchJson('/api/user/logout', { method: 'POST' }),
      false
    )
    router.push(`/login?originUrl=${router.pathname}`)
  }

  return (
    <header className="w-full bg-black shadow fixed z-10 md:px-6 h-[60px]">
      <nav className="flex justify-between items-center h-full">
        <a href="/">
          <Image width={120} height={100} alt="logo" src="/aiworks-long.png" />
        </a>
        <div className="navigation text-white flex">
          <Menu>
            <Menu.Button className="mr-6 flex items-center">
              <Link href={"./chat"}>Chat</Link>
            </Menu.Button>
            <Menu.Button className="mr-6 flex items-center">
              <Link href={"./midjourney"}>Midjourney</Link>
              <a href="#"></a>
            </Menu.Button>
            <Menu.Button className="mr-6 flex items-center">
              <Link href={"./tutorial"}>教程</Link>
            </Menu.Button>
            <Menu.Button className="mr-6 flex items-center">
              <Link href={"./pricing"}>价格</Link>
            </Menu.Button>
            <Menu.Button className="hidden md:block relative" onClick={avatarClick}>
              <a href="#">
                <img
                  src={user?.avatarUrl || AVATARS[0]}
                  alt="Avatar"
                  className="rounded-full w-8 h-8"
                />
              </a>
              {showMenu && <div className="absolute bg-black text-white mt-2 translate-x-[-50%]">
                <div className="w-20 h-10 text-center flex flex-col justify-center border-b border-gray-200 dark:border-gray-800 cursor-pointer"
                  onClick={userInfoClick}>用户中心</div>
                <div className="w-20 h-10 text-center flex flex-col justify-center border-b border-gray-200 dark:border-gray-800 cursor-pointer"
                  onClick={logout}>登出</div>
                </div>}
            </Menu.Button>
          </Menu>
        </div>
      </nav>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{ duration: 2000 }}
      />
    </header>
  );
}
