export interface ChatMessage {
  id?: string;
  role: 'user' | 'ai';
  content: string;
  imageUrl?: string;
  timestamp?: number;
}

export interface Chat {
  id: string;
  timestamp: string | number;
  isPinned?: boolean;
  customName?: string;
  title?: string;
  messages: ChatMessage[];
  createdAt?: number;
  updatedAt?: number;
}

