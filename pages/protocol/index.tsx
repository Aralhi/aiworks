import { useEffect } from "react";

export default function Protocol() {
  useEffect(() => {
    document.title = '用户协议'
    }, [])

  return (
    <div className="p-6 pt-[100px] px-10 md:px-20" style={{ color: 'rgba(39,38,77,.65)' }}>
      <h1 className="text-2xl font-bold mb-4">用户协议</h1>
      <p className="mb-2">
        欢迎使用AI Works（以下简称“本服务”）。本服务由aiworks.club（以下简称“我们”或“本公司”）提供。通过使用本服务，您同意遵守以下用户协议（以下简称“本协议”）。请仔细阅读本协议的全部内容。如果您不同意本协议的任何部分，请不要使用本服务。
      </p>
      <h2 className="text-lg font-bold my-2">账户注册与使用</h2>
      <p className="mb-2">
        为了使用本服务，您需要创建一个账户。其中使用微信扫描登录默认同意本条款。在创建账户时，请提供真实、准确、完整和最新的信息。您有责任保护您的账户信息和密码，以防止未经授权的访问。如果您发现任何未经授权的使用或安全漏洞，请立即通知我们。
      </p>
      <h2 className="text-lg font-bold my-2">用户行为</h2>
      <p className="mb-2">
        您同意在使用本服务时遵守所有适用的法律法规。您不得使用本服务进行以下活动：
      </p>
      <ul className="list-disc list-inside mb-2">
        <li>传播违法、侵权、诽谤、恶俗或其他有害信息；</li>
        <li>侵犯他人知识产权、隐私权或其他权益；</li>
        <li>未经授权访问、破坏或篡改他人数据；</li>
        <li>传播计算机病毒或恶意代码；</li>
        <li>进行任何可能破坏本服务正常运行的行为。</li>
      </ul>
      <h2 className="text-lg font-bold my-2">免责声明</h2>
      <p className="mb-2">
        <ul className="list-disc list-inside mb-2">
          <li>
          本服务按照现状提供，不作任何明示或暗示的保证，包括但不限于适销性、特定用途适用性和非侵权性。我们不对本服务的可用性、准确性、完整性、安全性或及时性作任何保证。
          </li>
          <li>
          您在本平台上的全部行为应符合法律法规及政策、社会公共秩序和道德风尚，包括但不限于禁止政治、反动、色情、暴力、冒犯、侮辱等不良信息内容的输入和生成，一切行为由您自行完全负责；同时，平台会对您的操作行为和生成内容进行记录。
          </li>
          <li>
          服务生成的所有内容都是由人工智能模型生成，我们对其生成内容的准确性、完整性和功能性不做任何保证，并且其生成的内容不代表我们的态度或观点。
          </li>
        </ul>
        
      </p>
      <h2 className="text-lg font-bold my-2">联系我们</h2>
      <p className="mb-2">
        邮箱：aiworks.club@gmail.com
      </p>
      <p className="mb-2">
        公众号：南风聊AI，AI Studios
      </p>
      <p className="mb-2">
        微信：aiworks-00, aiworks-01
      </p>
      <img className="w-[200px] h-[270px]" src="/weixin_service.JPG" alt="wechat" />
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      title: "隐私政策",
    },
  };
}
