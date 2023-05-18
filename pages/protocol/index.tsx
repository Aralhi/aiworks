export default function Protocol() {
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
        本服务按照现状提供，不作任何明示或暗示的保证，包括但不限于适销性、特定用途适用性和非侵权性。我们不对本服务的可用性、准确性、完整性、安全性或及时性作任何保证。
      </p>
      <h2 className="text-lg font-bold my-2">责任限制</h2>
      <p className="mb-2">
        在任何情况下，我们均不对因使用或无法使用本服务而产生的任何直接、间接、附带、特殊、惩罚性或后果性损害承担责任，除非我们的行为是故意或重大过失造成的损害。
      </p>
      <h2 className="text-lg font-bold my-2">知识产权</h2>
      <p className="mb-2">
        本服务中的所有内容都是我们或我们的许可方拥有的知识产权。您不得复制、修改、分发、传播、出售或使用本服务中的任何内容，除非得到我们或我们的许可方的明确授权。
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
