import { ArrowDownOutlined } from '@ant-design/icons';
import { Row, Table, TableColumnsType, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';

interface DataType {
  arg: string;
  desc: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: '参数',
    dataIndex: 'arg',
    render: (val) => <Tag>{val}</Tag>,
  },
  {
    title: '说明',
    key: 'desc',
    dataIndex: 'desc',
  },
];

const data: DataType[] = [
  { arg: '--v', desc: '模型版本号，默认使用最新版本V5' },
  { arg: '--no', desc: '负面加权（–no red 会尝试移除红色）' },
  { arg: '--iw', desc: '设置图片提示的权重' },
  { arg: '--ar', desc: '图像宽高比' },
  { arg: '--w', desc: '图像的宽度。必须是 64 的倍数（可选 128 --hd）效果更好' },
  { arg: '--h', desc: '图像的高度。必须是 64 的倍数（可选 128 --hd）效果更好' },
  { arg: '--seed', desc: '设置随机种子，这可以帮助在几代图像之间保持更稳定/可重复性' },
  { arg: '--fast', desc: '更快的渲染速度，但图像的一致性会更少' },
  { arg: '--hd', desc: '使用不同的算法，该算法可能更适合较大的图像，但构图的一致性较差，适合抽象和风景提示。' },
  { arg: '--stop', desc: '在设定的百分比处停止生成。必须在 10-100 之间' },
];

function MJExplain() {
  return (
    <div className="p-6 w-full rounded-lg bg-white text-slate-900 text-justify shadow-lg">
      <h1 className="w-full text-center font-bold text-xl mt-2 mb-8">Midjourney上手教程</h1>
      <Row className="mb-8">
        <h2 className="text-gray-800 text-lg mb-4 w-full font-medium">什么是Midjourney</h2>
        <span>
          Midjourney是一款AI制图工具，只要关键字，就能透过AI算法生成相对应的图片，只需要不到一分钟。
          可以选择不同画家的艺术风格，例如安迪华荷、达芬奇、达利和毕加索等，还能识别特定镜头或摄影术语。
        </span>
      </Row>
      <Row className="mb-8">
        <h2 className="text-gray-800 text-lg mb-4 w-full font-medium">如何使用</h2>
        <div className="space-y-2">
          <p>在下方输入框键入你想要生成的图片语句</p>
          <p>
            例如：<Tag>A dog in space</Tag>(只支持全英文输入)，会输出以下结果
            <ArrowDownOutlined rev="" />
          </p>
          <img className="w-full md:w-1/2 lg:w-1/2 xl:w-1/2 rounded-lg shadow-lg" src="case-1.jpg" />
          <p>
            也可以输入更多生成参数，例如：<Tag>A dog in space --v 4</Tag>，其中<Tag>--v 4</Tag>为使用模型V4版本
          </p>
          <p>
            更多参数可参考遗下表格
            <ArrowDownOutlined rev="" />
          </p>
          <Table pagination={false} bordered columns={columns} dataSource={data}></Table>
        </div>
      </Row>
      <Row className="block flex-col flex-1">
        <h2 className="text-gray-800 text-lg mb-4 w-full font-medium">社区案例</h2>
        <div className="relative flex items-center justify-center flex-wrap">
          <div className="relative w-full md:w-1/2 lg:w-1/2 xl:w-1/2">
            <div className="relative m-2 rounded-lg shadow-lg overflow-hidden">
              <div className="w-full pt-[100%]" />
              <div className="absolute top-0 left-0 w-full h-full bg-[url('/style-1.jpg')] bg-center bg-cover bg-no-repeat " />
            </div>
          </div>
          <div className="relative w-full md:w-1/2 lg:w-1/2 xl:w-1/2">
            <div className="relative m-2 rounded-lg shadow-lg overflow-hidden">
              <div className="w-full pt-[100%]" />
              <div className="absolute top-0 left-0 w-full h-full bg-[url('/style-2.jpg')] bg-center bg-cover bg-no-repeat " />
            </div>
          </div>
          <div className="relative w-full md:w-1/2 lg:w-1/2 xl:w-1/2">
            <div className="relative m-2 rounded-lg shadow-lg overflow-hidden">
              <div className="w-full pt-[100%]" />
              <div className="absolute top-0 left-0 w-full h-full bg-[url('/style-3.jpg')] bg-center bg-cover bg-no-repeat " />
            </div>
          </div>
          <div className="relative w-full md:w-1/2 lg:w-1/2 xl:w-1/2">
            <div className="relative m-2 rounded-lg shadow-lg overflow-hidden">
              <div className="w-full pt-[100%]" />
              <div className="absolute top-0 left-0 w-full h-full bg-[url('/style-4.jpg')] bg-center bg-cover bg-no-repeat " />
            </div>
          </div>
        </div>
      </Row>
    </div>
  );
}

export default MJExplain;
