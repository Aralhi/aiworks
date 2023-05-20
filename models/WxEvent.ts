import { Schema, model, models } from 'mongoose'

// 微信发送的消息事件记录
const WxEventSchema = new Schema({
  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
  type: { // 事件类型
    type: String,
  },
  key: {
    type: String,
  },
  value: {
    type: String,
  },
  expireAt: {
    type: Number, // 时间戳
  },
  openid: { // 用户openid
    type: String,
  },
  message: { // 微信响应body
    type: Object,
  },
  response: { // 微信响应
    type: Object,
  },
})

WxEventSchema.pre('save', function(next) {
  this.updateAt = new Date();
  next();
});

export default models.WxEvent ||  model('WxEvent', WxEventSchema, 'wxevent')
