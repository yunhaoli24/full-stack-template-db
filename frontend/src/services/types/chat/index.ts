export type TalkRole = "user" | "system";

export interface IMessage {
  role: TalkRole;
  content: string;
}

export interface IChatCompletionPayload {
  model?: string;
  stream?: boolean;
  messages?: IMessage[];
  [key: string]: unknown;
}
