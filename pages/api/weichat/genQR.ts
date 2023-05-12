import { getWXAccessToken, createQrCode } from "@/lib/weichat"

export const config = {
  runtime: "edge"
}

export default async (req: Request, res: Response) => {
  const result = await createQrCode()
  return new Response()
}