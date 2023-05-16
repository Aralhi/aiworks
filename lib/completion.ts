import Completion from "@/models/Completion";
import { getTodayTime } from "../utils";
import dbConnect from "./dbConnect";

export async function queryCompletionCount(userId: string = '', fingerprint: string = '') {
  try {
    await dbConnect()
    const [todayStartCST, todayEndCST] = getTodayTime()
    const result = await Completion.aggregate([
      {
        $match: {
          $or: [
            { userId },
            { fingerprint }
          ],
          createAt: {
            $gte: new Date(todayStartCST),
            $lte: new Date(todayEndCST),
          },
        },
      },
      {
        $count: 'count',
      },
    ]);
    return result[0]?.count || 0
  } catch (error) {
    console.error('get completion count error', error)
    return 0
  }
}