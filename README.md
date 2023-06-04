# aiworks

项目基于nextjs+tailwind+headlessui实现

## Icon
https://ant.design/components/icon-cn#components-icon-demo-custom
## 组件库
headlessui

## 查询规则

- 免费：未登录体验三次，然后引导登录

- 免费：登录每天10次上限，根据fingerpoint判断

- 尝鲜版：一周500次，根据用户ID判断

- 尊享版：一个月200次，根据用户ID判断

- 季卡版：会员期上线8000次，根据用户ID判断，支持设置[temperature](https://platform.openai.com/docs/api-reference/completions/create#completions/create-temperature)，[max_token](https://platform.openai.com/docs/api-reference/completions/create#completions/create-max_tokens)等参数

PRICING_PLAN: 套餐信息

## 购买及数据结构

订单

用户套餐
```
// 用户套餐信息，下单后更新到User表
  name: string; // 套餐名
  queryCount: number; // 套餐内查询次数
  startAt: number; // 套餐生效开始时间
  endAt: number; // 套餐结束时间
```

## 请求发送
该项目是前后端一体，直接用fetch发送就行了，不需要额外引入axios包


```
const res:CustomResponseType = await fetchJson('/api/user/user', {
  method: 'PUT',
  body: JSON.stringify(body)
})
```

## 接口返回格式
```
// 操作类的简单返回
return res.json({ status: 'ok', message: '登录成功'})

// 信息获取类的
return res.json({ status: 'ok', data: { name: 'xxx', phone: '185xxxxxxxxx' }})

// 后台处理异常
return res.status(500).json({ status: 'failed', message: '注册失败'})
```

## 会话管理
新用户直接发送chat，会自动创建conversation，并在后续会话中传递改conversationId。

conversationId会记录到Completion里，用于查询该conversation中的问答记录

会话列表最多建**20**个

## 答案展示形式支持
- code
- 表格
- 列表，如1. xxx 2. xxx
- emoji


## 注意
有dbConnect的文件，不要在前端引入，否则前端执行时会出现连数据的情况。😓
[我遇到了，待验证]在 getServerSideProps 方法中设置的缓存数据只能在服务端渲染时访问，而在 API 路由中无法直接访问。下面是AI的解释
```

然而，当我们尝试在 API 路由中访问 getServerSideProps 方法中设置的缓存数据时，会发现缓存数据并没有被读取到。这是因为 memory-cache 缓存库是基于 Node.js 内存的，而 getServerSideProps 方法和 API 路由是在不同的 Node.js 环境中执行的。虽然它们都处于服务端 Node.js 环境中，但它们使用的是不同的内存空间。因此，在 getServerSideProps 方法中设置的缓存数据无法直接被 API 路由访问。

```

## wechat pay配置1
WEXIN_PAY_MERCHANTID 商户id
WEXIN_PAY_CERT_SERIAL_NO 序列号 使用 `15CBD8513455B5D44F93EBBF440CA77B04985198`
WECHAT_PAY_PEM_PRIVATE_KEY 把key.pem的内容配置进去


## API 校验
用userId或者fingerprint作为plaintext加密，用crypto-js加密，支持edge环境

## 公众号使用chatGPT及midjourney
1. 增加教程菜单，打开教程页面
2. 对于手机号注册的用户，按照openid查不到用户。需要首先在基本信息页做微信号绑定。
3. 输入`/chat`或`/mj`，后台缓存接口用户消息，有消息过来刷新缓存，五分钟有效，五分钟没有消息过来，提示用户再次输入`/chat`
4. 特殊说明：由于微信5s返回机制，可能导致过长的文本响应超过，不用担心，回复`继续`即可获取对应的输出。