import { SettleInfo } from "tencentcloud-sdk-nodejs/tencentcloud/services/cpdp/v20190820/cpdp_models";

export interface PayAmout {
  /**
   * 订单总金额，单位为分。
   * 示例值：100
   */
  total: number;

  /**
   * 货币类型，CNY：人民币，境内商户号仅支持人民币。
   * 示例值：CNY
   */
  currency?: string;
}

export interface Payer {
  /**
   * 用户在直连商户appid下的唯一标识。 下单前需获取到用户的Openid，Openid获取详见
   * 示例值：oUpF8uMuAJO_M2pxb1Q9zNjWeS6o
   */
  openid: string;
}

export interface WechatPayGoodsDetail {
  /**
   * 商户侧商品编码，由半角的大小写字母、数字、中划线、下划线中的一种或几种组成。
   * 示例值：1246464644
   */
  merchant_goods_id: string;

  /**
   * 微信支付定义的统一商品编号（没有可不传）
   * 示例值：1001
   */
  wechatpay_goods_id?: string;

  /**
   * 商品的实际名称
   * 示例值：iPhoneX 256G
   */
  goods_name?: string;

  /**
   * 用户购买的数量
   * 示例值：1
   */
  quantity: number;

  /**
   * 单位为：分。如果商户有优惠，需传输商户优惠后的单价(例如：用户对一笔100元的订单使用了商场发的纸质优惠券100-50，则活动商品的单价应为原单价-50)
   * 示例值：528800
   */
  unit_price: number;
}

export interface WechatPayPromotionDetail {
  /**
   * 订单原价，商户侧一张小票订单可能被分多次支付，订单原价用于记录整张小票的交易金额。
   * 当订单原价与支付金额不相等，则不享受优惠。
   * 该字段主要用于防止同一张小票分多次支付，以享受多次优惠的情况，正常支付订单不必上传此参数。
   * 示例值：608800
   */
  cost_price?: number;

  /**
   * 商家小票ID
   * 示例值：微信123
   */
  invoice_id?: string;
}

export interface WechatPaySceneInfo {
  /**
   * 用户的客户端IP，支持IPv4和IPv6两种格式的IP地址。
   * 示例值：14.23.150.211
   */
  payer_client_ip: string;

  /**
   * 商户端设备号（门店号或收银设备ID）。
   * 示例值：013467007045764
   */
  device_id?: string;
}

export interface WechatPaySellerInfo {
  /**
   * 商户侧门店编号
   * 示例值：0001
   */
  id: string;

  /**
   * 商户侧门店名称
   * 示例值：腾讯大厦分店
   */
  name?: string;

  /**
   * 地区编码，详细请见省市区编号对照表。
   * 示例值：440305
   */
  area_code?: string;

  /**
   * 详细的商户门店地址
   * 示例值：广东省深圳市南山区科技中一道10000号
   */
  address?: string;
}

export interface WechatPaySettleInfo {
  /**
   * 是否指定分账
   * 示例值：false
   */
  profit_sharing: boolean;
}

export interface H5PrePayRequestParams {
  /**
   * 应用ID，由微信生成的应用ID，全局唯一。请求基础下单接口时请注意APPID的应用属性，例如公众号场景下，需使用应用属性为公众号的服务号APPID
   * 示例值：wxd678efh567hg6787
   */
  appid: string;

  /**
   * 直连商户号，直连商户的商户号，由微信支付生成并下发。
   * 示例值：1230000109
   */
  mchid: string;

  /**
   * 商品描述
   * 示例值：Image形象店-深圳腾大-QQ公仔
   */
  description: string;

  /**
   * 商户订单号，商户系统内部订单号，只能是数字、大小写字母_-*且在同一个商户号下唯一
   * 示例值：1217752501201407033233368018
   */
  out_trade_no: string;

  /**
   * 交易结束时间，订单失效时间，遵循rfc3339标准格式，格式为yyyy-MM-DDTHH:mm:ss+TIMEZONE，yyyy-MM-DD表示年月日，T出现在字符串中，表示time元素的开头，HH:mm:ss表示时分秒，TIMEZONE表示时区（+08:00表示东八区时间，领先UTC8小时，即北京时间）。
   * 例如：2015-05-20T13:29:35+08:00表示，北京时间2015年5月20日 13点29分35秒。
   * 示例值：2018-06-08T10:34:56+08:00
   */
  time_expire?: string;

  /**
   * 附加数据，在查询API和支付通知中原样返回，可作为自定义参数使用，实际情况下只有支付完成状态才会返回该字段。
   * 示例值：自定义数据
   */
  attach?: string;

  /**
   * 异步接收微信支付结果通知的回调地址，通知url必须为外网可访问的url，不能携带参数。
   * 公网域名必须为https，如果是走专线接入，使用专线NAT IP或者私有回调域名可使用http
   * 示例值：https://www.weixin.qq.com/wxpay/pay.php
   */
  notify_url: string;

  /**
   * 订单优惠标记
   * 示例值：WXG
   */
  goods_tag?: string;

  /**
   * 电子发票入口开放标识，传入true时，支付成功消息和支付详情页将出现开票入口。需要在微信支付商户平台或微信公众平台开通电子发票功能，传此字段才可生效。
   * true：是
   * false：否
   * 示例值：true
   */
  support_fapiao?: boolean;

  /**
   * 订单金额信息
   */
  amount: PayAmout;

  /**
   * 支付者信息
   */
  payer: Payer;

  /**
   * 优惠功能
   */
  detail?: WechatPayPromotionDetail;

  /**
   * 单品列表信息
   */
  goods_detail?: WechatPayGoodsDetail[];

  /**
   * 支付场景描述
   */
  scene_info?: WechatPaySceneInfo;

  /**
   * 商户门店信息
   */
  store_info?: WechatPaySellerInfo;

  /**
   * 结算信息
   */
  settle_info?: WechatPaySettleInfo;
}

export interface NativePrePayRequestParams {
  /**
   * 应用ID，由微信生成的应用ID，全局唯一。请求基础下单接口时请注意APPID的应用属性，
   * 例如公众号场景下，需使用应用属性为公众号的APPID
   * 示例值：wxd678efh567hg6787
   */
  appid: string;

  /**
   * 直连商户号，直连商户的商户号，由微信支付生成并下发。
   * 示例值：1230000109
   */
  mchid: string;

  /**
   * 商品描述
   * 示例值：Image形象店-深圳腾大-QQ公仔
   */
  description: string;

  /**
   * 商户系统内部订单号，只能是数字、大小写字母_-*且在同一个商户号下唯一
   * 示例值：1217752501201407033233368018
   */
  out_trade_no: string;

  /**
   * 订单失效时间，遵循rfc3339标准格式，格式为yyyy-MM-DDTHH:mm:ss+TIMEZONE，
   * yyyy-MM-DD表示年月日，T出现在字符串中，表示time元素的开头，
   * HH:mm:ss表示时分秒，TIMEZONE表示时区（+08:00表示东八区时间，领先UTC8小时，即北京时间）。
   * 例如：2015-05-20T13:29:35+08:00表示，北京时间2015年5月20日 13点29分35秒。
   * 示例值：2018-06-08T10:34:56+08:00
   */
  time_expire?: string;

  /**
   * 附加数据，在查询API和支付通知中原样返回，可作为自定义参数使用，
   * 实际情况下只有支付完成状态才会返回该字段。
   * 示例值：自定义数据
   */
  attach?: string;

  /**
   * 通知URL必须为直接可访问的URL，不允许携带查询串，
   * 要求必须为https地址。
   * 示例值：https://www.weixin.qq.com/wxpay/pay.php
   */
  notify_url: string;

  /**
   * 订单优惠标记
   * 示例值：WXG
   */
  goods_tag?: string;

  /**
   * 电子发票入口开放标识
   * true：是
   * false：否
   * 示例值：true
   */
  support_fapiao?: boolean;

  /**
   * 订单金额信息
   */
  amount: {
    /**
     * 订单总金额，单位为分。
     * 示例值：100
     */
    total: number;

    /**
     * 货币类型，CNY：人民币，境内商户号仅支持人民币。
     * 示例值：CNY
     */
    currency?: string;
  };

  /**
   * 优惠功能
   */
  detail?: WechatPayPromotionDetail;

  /**
   * 单品列表信息
   */
  goods_detail?: WechatPayGoodsDetail[];

  /**
   * 支付场景描述
   */
  scene_info?: WechatPaySceneInfo;

  /**
   * 商户门店信息
   */
  store_info?: {
    /**
     * 商户侧门店编号
     * 示例值：0001
     */
    id: string;

    /**
     * 商户侧门店名称
     * 示例值：腾讯大厦分店
     */
    name?: string;

    /**
     * 地区编码，详细请见省市区编号对照表。
     * 示例值：440305
     */
    area_code?: string;

    /**
     * 详细的商户门店地址
     * 示例值：广东省深圳市南山区科技中一道10000号
     */
    address?: string;
  };

  /**
   * 结算信息
   */
  settle_info?: SettleInfo;
}
