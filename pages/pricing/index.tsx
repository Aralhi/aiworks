import PriceCard from "@/components/PriceCard";

export default function Pricing() {
  return (
    <div className="flex flex-col gap-4 w-full"
      style={{ background: 'url(/pricing_bg.png) no-repeat', backgroundColor: '#01031f', backgroundSize: '476px 100%', height: '100vh' }}>
      <div className="flex flex-col flex-1 w-full items-center justify-center gap-4">
        <h1 className="text-white text-4xl font-{800}">使用 AI works 提高工作效率</h1>
        <h3 className="text-white text-lg">我们提供市场上最具成本效益的解决方案之一！</h3>
        <div className="flex items-center px-4 py-2" style={{ borderRadius: '12px', backgroundColor: '#151435' }}>
        </div>
        <PriceCard />
      </div>
    </div>
  );
}
