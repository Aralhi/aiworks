
// 用户的套餐信息，下单后更新到用户表
export interface IPricing {
  name: string; // 套餐名
  queryCount: number; // 套餐内查询次数
  price: number;
  startAt: number; // 套餐生效开始时间
  endAt: number; // 套餐结束时间
}
