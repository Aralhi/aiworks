import { Schema, model, models } from "mongoose";

export interface IMJMessage {
  userId: string;
  fingerprint?: string;
  prompt: string;
  progress?: string;
  type: "imagine" | "upscale" | "variation";
  index?: number;
  msgId?: string;
  msgHash?: string;
  img?: string;
  originImg?: string;
}

type MJMessageModel = IMJMessage & {
  createAt: Date;
};

const MJMessageSchema = new Schema<MJMessageModel>({
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
  type: {
    // imagine, upscale, variation
    type: String,
    required: [true, "Please provide a type."],
  },
  img: {
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

export default models.MJMessage ||
  model("MJMessage", MJMessageSchema, "mjmessage");
