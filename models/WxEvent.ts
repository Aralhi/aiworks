
export interface IWxEvent {
  createAt?: string;
  updateAt?: string;
  type: string;
  key?: string;
  value?: string;
  expireAt?: number;
  openid?: string;
  message?: Object;
  response?: Object;
}
