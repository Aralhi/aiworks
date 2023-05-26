type ArgsOptionType = {
  key: string;
  arg: string;
  label: string;
  checked?: boolean;
  default?: string | number;
  placeholder?: string;
  type?: "select" | "number" | "input";
  rule?: RegExp;
  tip?: string;
};

export const argsOption: ArgsOptionType[] = [
  {
    key: "aspect",
    arg: "--ar",
    label: "图片比例",
  },
  {
    key: "size",
    arg: "--size",
    label: "图片尺寸",
  },
  {
    key: "chaos",
    arg: "--c",
    label: "多样化",
  },
  {
    key: "no",
    arg: "--no",
    label: "否定关键词",
  },
  {
    key: "quality",
    arg: "--q",
    label: "质量",
  },
  {
    key: "wi",
    arg: "--wi",
    label: "影响权重",
  },
  {
    key: "seed",
    arg: "--seed",
    label: "种子",
  },
  {
    key: "stop",
    arg: "--stop",
    label: "提前停止渲染",
  },
  {
    key: "stylize",
    arg: "--s",
    label: "艺术性",
  },
  {
    key: "remaster",
    arg: "--remaster",
    label: "创新性",
  },
  {
    key: "tile",
    arg: "--tile",
    label: "平铺",
  },
  {
    key: "version",
    arg: "--v",
    label: "版本",
    rule: /^V[1-4]$/,
    placeholder: "默认V4",
    tip: "AI模型版本号,默认使用V4",
  },
];
