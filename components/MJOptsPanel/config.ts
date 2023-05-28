import { InputNumberProps, InputProps, SelectProps } from "antd";

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
  inputNumberProps?: InputNumberProps;
  selectProps?: SelectProps;
  inputProps?: InputProps;
};

export const argsOption: ArgsOptionType[] = [
  {
    key: "aspect",
    arg: "--ar",
    label: "图片比例",
    tip: "例如：1:1",
    rule: /^\d+:\d+$/,
    type: "input",
  },
  {
    key: "size",
    arg: "--size",
    label: "图片尺寸",
    tip: "单位：像素（px）",
    type: "number",
    inputNumberProps: { min: 50, step: 1, prefix: "px" },
  },
  {
    key: "chaos",
    arg: "--c",
    label: "多样化",
    tip: "生成结果差异(0 - 100)",
    type: "number",
    inputNumberProps: { min: 0, max: 100, step: 1 },
  },
  {
    key: "no",
    arg: "--no",
    label: "否定关键词",
    tip: "屏蔽不需要的东西",
    type: "select",
    selectProps: { mode: "tags" },
  },
  {
    key: "quality",
    arg: "--q",
    label: "质量",
    tip: "渲染质量，越高越精细",
    type: "select",
    selectProps: {
      options: [
        { label: "0.25", value: 0.25 },
        { label: "0.5", value: 0.5 },
        { label: "1", value: 1 },
        { label: "2", value: 2 },
      ],
    },
  },
  {
    key: "wi",
    arg: "--wi",
    label: "影响权重",
    tip: "以一张图为参考来生成新图",
    type: "number",
    inputNumberProps: { min: 0, max: 1 },
  },
  {
    key: "seed",
    arg: "--seed",
    label: "种子",
    tip: "加上之前图片种子编号，让生成图应用之前生成图的参数，这样生成的图片就会跟之前的图片很相似",
    type: "number",
    inputNumberProps: { step: 1, min: 0, max: 4294967295 },
  },
  {
    key: "stop",
    arg: "--stop",
    label: "提前停止渲染",
    tip: "提前停止渲染（0 - 100）",
    type: "number",
    inputNumberProps: { step: 1, min: 0, max: 100 },
  },
  {
    key: "stylize",
    arg: "--s",
    label: "艺术性",
    tip: "数值越高生成结果越具有艺术性，但会跟自己输入的关键词越不匹配（0 - 1000）",
    type: "number",
    inputNumberProps: { min: 0, max: 1000 },
  },
  {
    key: "remaster",
    arg: "--remaster",
    label: "创新性",
    tip: "使画面有创造性，惊喜和创新",
  },
  {
    key: "tile",
    arg: "--tile",
    label: "平铺",
    tip: "生成纹理，拼贴类的图像",
  },
  {
    key: "version",
    arg: "--v",
    label: "模型版本",
    placeholder: "默认v4",
    tip: "AI模型版本号,默认使用v4",
    type: "select",
    selectProps: {
      options: [
        { label: "V4", value: 4 },
        { label: "V3", value: 3 },
        { label: "V2", value: 2 },
        { label: "V1", value: 1 },
      ],
    },
  },
];
