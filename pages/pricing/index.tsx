import PriceCard from "@/components/PriceCard";
import { AppstoreFilled, BulbFilled, SafetyCertificateFilled, TrophyFilled } from "@ant-design/icons";
import { Popover } from 'antd'

const whyUs = (
  <section className="bg-gray-100 md:py-10 p-6 md:max-w-[800px]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="lg:text-center">
      <h2 className="text-base font-semibold tracking-wide uppercase" style={{ color: '#CD500C' }}>为什么选择我们</h2>
      <p className="mt-4 max-w-2xl md:text-xl lg:mx-auto">
        AI works 平台是由多名<b>字节</b>&<b>阿里</b>技术专家联合打造，旨在帮助所有人抓住 AI 浪潮中的机会，提高生产力，实现让 AI 触手可及的目标。
      </p>
    </div>
    <div className="mt-10">
      <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
        <div className="flex">
          <div className="flex-shrink-0">
            <BulbFilled className="w-12 h-12 text-blue-500" rev={''} style={{ color: '#FD9F6D' }}/>
          </div>
          <div className="ml-4">
            <dt className="md:text-lg leading-6 font-medium text-gray-900">稳定可靠的服务</dt>
            <dd className="mt-2 md:text-base text-gray-500">
              我们的平台底层服务均来自官方 API，由强大的技术团队提供支持和帮助，确保您获得最佳的使用体验。
            </dd>
          </div>
        </div>
        <div className="flex">
          <div className="flex-shrink-0">
            <SafetyCertificateFilled className="w-12 h-12 text-blue-500" rev={''} />
          </div>
          <div className="ml-4">
            <dt className="md:text-lg leading-6 font-medium text-gray-900">安全保障</dt>
            <dd className="mt-2 md:text-base text-gray-500">
              我们提供多重安全保障措施，确保您的信息和数据始终得到保护。
            </dd>
          </div>
        </div>
        <div className="flex">
          <div className="flex-shrink-0">
            <TrophyFilled  className="w-12 h-12" rev={''} style={{ color: '#A831FF' }}/>
          </div>
          <div className="ml-4">
            <dt className="md:text-lg leading-6 font-medium">专业团队</dt>
            <dd className="mt-2 md:text-base text-gray-500">
              我们拥有一支专业的技术团队，随时为您提供支持和帮助，确保您的使用体验始终如一。
            </dd>
          </div>
        </div>
        <div className="flex">
          <div className="flex-shrink-0">
            <AppstoreFilled className="w-12 h-12" rev={''} style={{ color: '#03AFBF' }}/>
          </div>
          <div className="ml-4">
            <dt className="md:text-lg leading-6 font-medium text-gray-900">丰富的产品形态</dt>
            <dd className="mt-2 md:text-base text-gray-500">
              我们有丰富的产品形态，让你生活工作全方位使用AI。包括PC、手机浏览器、微信机器人、订阅号、Chrome插件等。
            </dd>
          </div>
          </div>
        </dl>
        </div>
      </div>
    </section>
)

export default function Pricing() {

  return (
    <div className="flex flex-col gap-4 w-full"
      style={{ background: 'url(/pricing_bg.png) no-repeat', backgroundColor: '#01031f', backgroundSize: '476px 100%', height: '100vh' }}>
      <div className="flex flex-col flex-1 w-full items-center justify-center gap-4 dark">
        <h1 className="text-white text-2xl md:text-4xl font-{800}">使用 AI works 提高生产力</h1>
        <h3 className="text-white text-lg text-center">
          我们提供市场上最具成本效益的解决方案之一！
          <Popover content={whyUs}>
            <span className="text-violet-500">为什么选择我们？</span>
          </Popover>
        </h3>
        <PriceCard />
      </div>
    </div>
  );
}
