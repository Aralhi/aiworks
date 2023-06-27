import { Schema, model, models } from "mongoose";

export interface IMJMessage {
  userId?: string;
  fingerprint?: string;
  prompt: string;
  progress?: string;
  type: "imagine" | "upscale" | "variation";
  index?: number;
  unionId: string;
  msgId?: string;
  msgHash?: string;
  /** oss图片访问地址 */
  img?: string;
  /** oss图片路径 */
  imgPath?: string;
  flags: number;
  /** 原图 */
  originImg?: string;
  content?: string;
  createAt?: Date;
}

const MJMessageSchema = new Schema<IMJMessage>({
  userId: {
    type: String,
  },
  fingerprint: {
    type: String,
  },
  prompt: {
    type: String,
    required: [true, "Please provide prompt."],
  },
  progress: {
    type: String,
  },
  content: {
    type: String,
  },
  unionId: {
    type: String,
  },
  flags: {
    type: Number,
  },
  type: {
    // imagine, upscale, variation
    type: String,
    required: [true, "Please provide a type."],
  },
  img: {
    type: String,
  },
  imgPath: {
    type: String,
  },
  originImg: {
    type: String,
  },
  index: {
    type: Number,
  },
  msgId: {
    type: String,
  },
  msgHash: {
    type: String,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

MJMessageSchema.index({ userId: 1, createAt: -1 });

export default models.MJMessage ||
  model("MJMessage", MJMessageSchema, "mjmessage");
