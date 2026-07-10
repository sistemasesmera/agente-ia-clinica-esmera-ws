const BASE_URL = process.env.CHATWOOT_BASE_URL ?? "https://app.chatwoot.com";
const API_TOKEN = process.env.CHATWOOT_API_TOKEN!;
const ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID!;
export const INBOX_ID = Number(process.env.CHATWOOT_INBOX_ID);

function headers() {
  return {
    "Content-Type": "application/json",
    "api_access_token": API_TOKEN,
  };
}

export async function sendMessage(conversationId: number, content: string) {
  const res = await fetch(
    `${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ content, message_type: "outgoing", private: false }),
    }
  );
  if (!res.ok) throw new Error(`Chatwoot sendMessage error ${res.status}`);
  return res.json();
}

export async function sendPrivateNote(conversationId: number, content: string) {
  const res = await fetch(
    `${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ content, message_type: "outgoing", private: true }),
    }
  );
  if (!res.ok) throw new Error(`Chatwoot sendPrivateNote error ${res.status}`);
  return res.json();
}

export async function assignConversation(conversationId: number, teamId: number) {
  const res = await fetch(
    `${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/assignments`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ team_id: teamId }),
    }
  );
  if (!res.ok) throw new Error(`Chatwoot assignConversation error ${res.status}`);
  return res.json();
}

export async function addLabel(conversationId: number, label: string) {
  const res = await fetch(
    `${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/labels`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ labels: [label] }),
    }
  );
  if (!res.ok) throw new Error(`Chatwoot addLabel error ${res.status}`);
  return res.json();
}

export async function toggleConversationStatus(
  conversationId: number,
  status: "open" | "resolved" | "pending"
) {
  const res = await fetch(
    `${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/toggle_status`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ status }),
    }
  );
  if (!res.ok) throw new Error(`Chatwoot toggleStatus error ${res.status}`);
  return res.json();
}

export async function getConversation(conversationId: number) {
  const res = await fetch(
    `${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`Chatwoot getConversation error ${res.status}`);
  return res.json();
}

export async function setConversationCustomAttribute(
  conversationId: number,
  attributes: Record<string, string | number | boolean>
) {
  const res = await fetch(
    `${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/custom_attributes`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ custom_attributes: attributes }),
    }
  );
  if (!res.ok) throw new Error(`Chatwoot setCustomAttribute error ${res.status}`);
  return res.json();
}
