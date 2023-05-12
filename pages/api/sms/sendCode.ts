import { NextApiRequest, NextApiResponse } from "next";
import * as tencentcloud from "tencentcloud-sdk-nodejs";
import cache from 'memory-cache'
import { getCodeKey } from "@/lib/sms";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { phone } = req.body || {};
  console.log('phone', phone, !/^1[3-9]\d{9}$/.test(phone))
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    res.status(400).json({ status: 'failed' , message: "手机号格式不正确" });
    return;
  }
  const code = Math.random().toString().slice(-6);//生成6位数随机验证码
  // 导入对应产品模块的client models。
  const smsClient = tencentcloud.sms.v20210111.Client

  /* 实例化要请求产品(以sms为例)的client对象 */
  const client = new smsClient({
    credential: {
      secretId: process.env.TENCENT_SECRET_ID,
      secretKey: process.env.TENCENT_SECRET_KEY,
    },
    region: "ap-guangzhou",
  })

  /* 帮助链接：
  * 短信控制台: https://console.cloud.tencent.com/smsv2 */
  const params = {
    /* 短信应用ID: 短信SmsSdkAppId在 [短信控制台] 添加应用后生成的实际SmsSdkAppId，示例如1400006666 */
    // 应用 ID 可前往 [短信控制台](https://console.cloud.tencent.com/smsv2/app-manage) 查看
    SmsSdkAppId: process.env.SMS_SDK_APP_ID || '',
    /* 短信签名内容: 使用 UTF-8 编码，必须填写已审核通过的签名 */
    // 签名信息可前往 [国内短信](https://console.cloud.tencent.com/smsv2/csms-sign) 或 [国际/港澳台短信](https://console.cloud.tencent.com/smsv2/isms-sign) 的签名管理查看
    SignName: "南屿创客科技",
    /* 模板 ID: 必须填写已审核通过的模板 ID */
    // 模板 ID 可前往 [国内短信](https://console.cloud.tencent.com/smsv2/csms-template) 或 [国际/港澳台短信](https://console.cloud.tencent.com/smsv2/isms-template) 的正文模板管理查看
    TemplateId: process.env.SMS_TEMPLATE_ID || '',
    /* 模板参数: 模板参数的个数需要与 TemplateId 对应模板的变量个数保持一致，若无模板参数，则设置为空 */
    TemplateParamSet: [code, '2'],
    /* 下发手机号码，采用 e.164 标准，+[国家或地区码][手机号]
    * 示例如：+8613711112222， 其中前面有一个+号 ，86为国家码，13711112222为手机号，最多不要超过200个手机号*/
    PhoneNumberSet: [`+86${phone}`]
  }
  console.log('params', params)
  // 通过client对象调用想要访问的接口，需要传入请求对象以及响应回调函数
  client.SendSms(params, function (err, response) {
    // 请求异常返回，打印异常信息
    if (err) {
      console.log('send sms error', err)
      return
    }
    if(response.SendStatusSet[0].Code === 'Ok') {
      // 缓存2分钟
      cache.put(getCodeKey(phone), code, 2 * 60 * 1000);
      console.log('send sms success', response)
      res.status(200).json({ status: 'ok', message: "发送成功" });
    } else {
      console.error('send sms error', response)
      res.status(400).json({ status: 'failed', message: "发送失败" });
    }
  })
}