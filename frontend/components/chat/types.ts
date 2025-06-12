export type MessagePart = {
  type: 'text';
  text?: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  parts: MessagePart[];
};

export type ChatStatus = 'idle' | 'streaming' | 'submitted'; 