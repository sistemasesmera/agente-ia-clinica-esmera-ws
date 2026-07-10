import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.CHATWOOT_BASE_URL ?? "https://app.chatwoot.com";
  const token = process.env.CHATWOOT_API_TOKEN;
  const accountId = process.env.CHATWOOT_ACCOUNT_ID;

  if (!token || !accountId) {
    return NextResponse.json({ status: "error", chatwoot: "not_configured" });
  }

  try {
    const res = await fetch(
      `${base}/api/v1/accounts/${accountId}/inboxes`,
      {
        headers: { api_access_token: token },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!res.ok) {
      return NextResponse.json({
        status: "error",
        chatwoot: "auth_failed",
        code: res.status,
      });
    }

    const data = await res.json();
    const inboxes: { id: number; name: string; channel_type: string }[] =
      data.payload ?? [];

    const whatsappInbox = inboxes.find(
      (i) => i.id === Number(process.env.CHATWOOT_INBOX_ID)
    );

    return NextResponse.json({
      status: "ok",
      chatwoot: "connected",
      account_id: accountId,
      inbox: whatsappInbox
        ? { id: whatsappInbox.id, name: whatsappInbox.name }
        : null,
      total_inboxes: inboxes.length,
    });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      chatwoot: "unreachable",
      error: err instanceof Error ? err.message : "Unknown",
    });
  }
}
