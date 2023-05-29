export {};

declare global {
  var mongoose: any;
  var WeixinJSBridge: any;
}

export type BasicModel<T = {}> = { _id: string; __v: number } & T;
