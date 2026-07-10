export type ChatwootEventType =
  | "conversation_created"
  | "conversation_updated"
  | "conversation_status_changed"
  | "message_created"
  | "message_updated";

export interface ChatwootContact {
  id: number;
  name: string;
  phone_number?: string;
  email?: string;
}

export interface ChatwootConversation {
  id: number;
  status: string;
  inbox_id: number;
  meta?: {
    sender?: ChatwootContact;
  };
}

export interface ChatwootMessage {
  id: number;
  content: string;
  message_type: number; // 0=incoming, 1=outgoing, 2=activity
  created_at: number;
  conversation_id?: number;
}

export interface ChatwootWebhookPayload {
  event: ChatwootEventType;
  id?: number;
  account?: { id: number; name: string };
  conversation?: ChatwootConversation;
  contact?: ChatwootContact;
  inbox?: { id: number; name: string };
  // Para eventos de mensaje
  content?: string;
  message_type?: number;
  created_at?: number;
}
