import PriceCard from "@/components/PriceCard";
import { RadioGroup } from '@headlessui/react'
import { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";

const PRICING_TYPES = [
  {
    name: 'chatGPT',
  },
  {
    name: 'Midjourney',
  }
]

export default function Pricing() {
  const [selected, setSelected] = useState(PRICING_TYPES[0])

  return (
    <div className="flex flex-col gap-4 w-full"
      style={{ background: 'url(/pricing_bg.png) no-repeat', backgroundColor: '#01031f', backgroundSize: '476px 100%', height: '100vh' }}>
      <div className="flex flex-col flex-1 w-full items-center justify-center gap-4">
        <h1 className="text-white text-4xl font-{800}">使用 AI works 提高工作效率</h1>
        <h3 className="text-white text-lg">我们提供市场上最具成本效益的解决方案之一！</h3>
        <div className="flex items-center px-4 py-4" style={{ borderRadius: '12px', backgroundColor: '#353459' }}>
          <RadioGroup value={selected} onChange={setSelected} className="flex flex-1 gap-4">
          {PRICING_TYPES.map((plan) => (
              <RadioGroup.Option
                key={plan.name}
                value={plan}
                disabled={plan.name === 'Midjourney'}
                className={({ active, checked }) =>
                  `${
                    active
                      ? 'ring-2 ring-white ring-opacity-60 ring-offset-2 ring-offset-sky-300'
                      : ''
                  }
                  ${
                    checked ? 'bg-sky-900 bg-opacity-75 text-white' : 'bg-white'
                  }
                    relative flex cursor-pointer rounded-lg px-5 py-2 shadow-md focus:outline-none`
                }
              >
                {({ active, checked }) => (
                  <>
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <RadioGroup.Label
                            as="p"
                            className={`font-medium  ${
                              checked ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {plan.name}
                          </RadioGroup.Label>
                          <RadioGroup.Description
                            as="span"
                            className={`inline ${
                              checked ? 'text-sky-100' : 'text-gray-500'
                            }`}
                          >
                          </RadioGroup.Description>
                        </div>
                      </div>
                      {checked && (
                        <div className="shrink-0 text-white ml-2">
                          <FaCheckCircle className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </RadioGroup.Option>
            ))}
          </RadioGroup>
        </div>
        <PriceCard />
      </div>
    </div>
  );
}
