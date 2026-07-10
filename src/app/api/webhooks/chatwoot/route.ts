import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processQueue } from "@/lib/queue/processor";

const DEBOUNCE_MS = 5000;

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-chatwoot-token");
  if (
    process.env.CHATWOOT_WEBHOOK_TOKEN &&
    token !== process.env.CHATWOOT_WEBHOOK_TOKEN
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    await handleEvent(supabase, payload);
  } catch (err) {
    console.error("[Webhook] Error:", err);
    await supabase.from("agent_logs").insert({
      event: "webhook_error",
      payload: { chatwoot_event: payload.event, error: err instanceof Error ? err.message : "Unknown" },
    });
  }

  return NextResponse.json({ ok: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertConversation(supabase: any, conv: any) {
  const sender = conv.meta?.sender;
  await supabase.from("conversations").upsert(
    {
      chatwoot_id: conv.id,
      status: conv.status ?? "open",
      inbox_id: conv.inbox_id,
      contact_name: sender?.name ?? null,
      contact_phone: sender?.phone_number ?? null,
    },
    { onConflict: "chatwoot_id" }
  );
  const { data } = await supabase
    .from("conversations")
    .select("id, agent_enabled")
    .eq("chatwoot_id", conv.id)
    .single();
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleEvent(supabase: any, payload: any) {
  const event: string = payload.event;

  switch (event) {
    case "conversation_created":
    case "conversation_updated":
    case "conversation_status_changed": {
      const conv = payload.conversation;
      if (!conv) break;
      await upsertConversation(supabase, conv);
      break;
    }

    case "message_created": {
      const isIncoming =
        payload.message_type === "incoming" || payload.message_type === 0;
      if (!isIncoming) break;
      if (!payload.content || !payload.conversation?.id) break;

      const conv = await upsertConversation(supabase, payload.conversation);
      if (!conv?.agent_enabled) break;

      const processAfter = new Date(Date.now() + DEBOUNCE_MS).toISOString();

      // Buscar batch pendiente para esta conversación
      const { data: existing } = await supabase
        .from("pending_messages")
        .select("id, content")
        .eq("conversation_id", conv.id)
        .eq("processed", false)
        .single();

      if (existing) {
        // Acumular y reiniciar timer
        await supabase
          .from("pending_messages")
          .update({
            content: `${existing.content}\n${payload.content}`,
            process_after: processAfter,
          })
          .eq("id", existing.id);
      } else {
        // Nuevo batch
        await supabase.from("pending_messages").insert({
          conversation_id: conv.id,
          chatwoot_conversation_id: payload.conversation.id,
          content: payload.content,
          sender_name: payload.sender?.name ?? null,
          chatwoot_contact_id: payload.sender?.id ?? null,
          process_after: processAfter,
          processed: false,
        });
      }

      // Después de enviar el 200, esperar 5s y procesar la cola
      after(async () => {
        await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_MS + 500));
        const freshSupabase = await createClient();
        await processQueue(freshSupabase);
      });

      break;
    }

    default:
      break;
  }
}
