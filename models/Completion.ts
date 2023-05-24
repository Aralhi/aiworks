
export interface ICompletion {
  userId: string;
  prompt: string;
  role: string;
  stream: Boolean;
  chatId: string; // chat gpt id
  model: string;
  content: string;
  createAt?: string;
  conversationId: string;
  usage?: Usage 
  fingerprint?: string;
}

export type Usage = {
  prompt_tokens: Number;
  completion_tokens: Number;
  total_tokens: Number;
}
