
export type ResponseError = {
  message: string
}

export interface IMJMessage {
  userId: string
  fingerprint?: string
  prompt: string
  type: string
  index?: number
  msgId?: string
  msgHash?: string
}
