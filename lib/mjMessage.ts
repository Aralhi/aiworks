import MJMessage, { IMJMessage } from "@/models/MJMessage";
import dbConnect from "./dbConnect";

export async function insertMessage(message: IMJMessage) {
  try {
    await dbConnect();
    const result = await new MJMessage(message).save();
    return { status: "ok", data: result };
  } catch (e) {
    console.error("insert midjourney message failed!", e);
    return { status: "failed" };
  }
}
