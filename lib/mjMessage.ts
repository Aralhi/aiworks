import { IMJMessage } from "@/models/MJMessage";
import { insertOne } from "./db";

export async function insertMessage(message: IMJMessage) {
  try {
    const result = await insertOne('mjmessage', message)
    if (result?.acknowledged) {
      console.log("insert mj Message", result)
      return result
    } else {
      console.error("insert mj Message failed", result)
    }
  } catch (error) {
    console.error("insert mj Message", error)
  }
}