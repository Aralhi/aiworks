import MJMessage, { IMJMessage } from "@/models/MJMessage";
import dbConnect from "./dbConnect";

export async function insertMessage(message: IMJMessage) {
  try {
    await dbConnect()
    const result = await new MJMessage(message).save()
    console.log("insert mj Message", result)
  } catch (error) {
    console.error("insert mj Message", error)
  }
}