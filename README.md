# aiworks

项目基于nextjs+tailwind+headlessui实现

## Icon
https://react-icons.github.io/react-icons/icons?name=fa

## 组件库
headlessui

## 查询规则

- 免费：未登录体验三次，然后引导登录

- 免费：登录每天10次上限，根据fingerpoint判断

- 尝鲜版：一周500次，根据用户ID判断

- 尊享版：一个月200次，根据用户ID判断

- 季卡版：会员期上线9999次，根据用户ID判断，支持设置[temperature](https://platform.openai.com/docs/api-reference/completions/create#completions/create-temperature)，[max_token](https://platform.openai.com/docs/api-reference/completions/create#completions/create-max_tokens)等参数

PRICING_PLAN: 套餐信息

## 请求发送
该项目是前后端一体，直接用fetch发送就行了，不需要额外引入axios包


```
const res:CustomResponseType = await fetchJson('/api/user/user', {
  method: 'PUT',
  body: JSON.stringify(body)
})
toast.success(res.message)
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