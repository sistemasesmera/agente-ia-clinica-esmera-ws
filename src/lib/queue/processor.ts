import { sendMessage } from "@/lib/chatwoot/client";
import { runAgent } from "@/lib/openai/agent";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function processQueue(supabase: any) {
  // Buscar mensajes pendientes cuyo tiempo de espera ya expiró
  const { data: pending } = await supabase
    .from("pending_messages")
    .select("*")
    .eq("processed", false)
    .lte("process_after", new Date().toISOString())
    .order("created_at", { ascending: true });

  if (!pending || pending.length === 0) return { processed: 0 };

  let processed = 0;

  for (const batch of pending) {
    try {
      await processBatch(supabase, batch);
      processed++;
    } catch (err) {
      console.error(`[Queue] Error procesando batch ${batch.id}:`, err);
      await supabase.from("agent_logs").insert({
        conversation_id: batch.conversation_id,
        event: "queue_error",
        payload: { error: err instanceof Error ? err.message : "Unknown", batch_id: batch.id },
      });
      // Marcar como procesado igualmente para no quedar en loop infinito
      await supabase
        .from("pending_messages")
        .update({ processed: true })
        .eq("id", batch.id);
    }
  }

  return { processed };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processBatch(supabase: any, batch: any) {
  // Marcar como procesado ANTES de llamar a la IA (evita doble procesamiento)
  await supabase
    .from("pending_messages")
    .update({ processed: true })
    .eq("id", batch.id);

  const { conversation_id, chatwoot_conversation_id, content, chatwoot_contact_id } = batch;

  // Obtener la conversación
  const { data: conv } = await supabase
    .from("conversations")
    .select("id, agent_enabled")
    .eq("id", conversation_id)
    .single();

  if (!conv?.agent_enabled) return;

  // Cargar config del agente
  const { data: config } = await supabase
    .from("agent_config")
    .select("system_prompt, model, enabled, auto_reply, clinic_name")
    .single();

  if (!config?.enabled || !config?.auto_reply) return;

  // Cargar base de conocimiento y tratamientos
  const [{ data: knowledge }, { data: treatments }] = await Promise.all([
    supabase.from("knowledge_base").select("title, content").eq("active", true).order("section"),
    supabase.from("treatments").select("*").eq("active", true).order("category").order("name"),
  ]);

  const knowledgeText = (knowledge ?? [])
    .map((k: { title: string; content: string }) => `### ${k.title}\n${k.content}`)
    .join("\n\n");

  const esteticos = (treatments ?? []).filter((t: { category: string }) => t.category === "estetico");
  const medicos = (treatments ?? []).filter((t: { category: string }) => t.category === "medico");

  const treatmentsText = [
    esteticos.length > 0 && "TRATAMIENTOS ESTÉTICOS:\n" + esteticos.map((t: {
      name: string; duration_minutes?: number; price?: number; description?: string; benefits?: string
    }) =>
      `- ${t.name}${t.duration_minutes ? ` (${t.duration_minutes} min)` : ""}${t.price != null ? ` — ${t.price}€` : " — Gratuito"}` +
      (t.description ? `\n  Descripción: ${t.description}` : "") +
      (t.benefits ? `\n  Beneficios: ${t.benefits}` : "") +
      (t.protocol ? `\n  Protocolo: ${t.protocol}` : "")
    ).join("\n"),
    medicos.length > 0 && "TRATAMIENTOS MÉDICOS (no mencionar precios, derivar a Valoración Médica gratuita):\n" + medicos.map((t: {
      name: string; duration_minutes?: number; description?: string; benefits?: string; protocol?: string
    }) =>
      `- ${t.name}${t.duration_minutes ? ` (${t.duration_minutes} min)` : ""}` +
      (t.description ? `\n  Descripción: ${t.description}` : "") +
      (t.benefits ? `\n  Beneficios: ${t.benefits}` : "") +
      (t.protocol ? `\n  Protocolo: ${t.protocol}` : "")
    ).join("\n"),
  ].filter(Boolean).join("\n\n");

  const fullSystemPrompt = [
    config.system_prompt,
    knowledgeText && `---\nINFORMACIÓN DE LA CLÍNICA:\n${knowledgeText}`,
    treatmentsText && `---\nTRATAMIENTOS:\n${treatmentsText}`,
  ].filter(Boolean).join("\n\n");

  // Guardar el mensaje acumulado en la tabla messages
  const { data: savedMsg } = await supabase
    .from("messages")
    .insert({ conversation_id, role: "user", content })
    .select("id")
    .single();

  await supabase.from("agent_logs").insert({
    conversation_id,
    event: "message_received",
    payload: { content, sender: batch.sender_name },
  });

  // Historial previo (sin incluir el mensaje actual)
  const { data: historyRows } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversation_id)
    .neq("id", savedMsg?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(10)
    .then((r: { data: { role: string; content: string }[] | null }) => ({
      ...r,
      data: (r.data ?? []).reverse(),
    }));

  const history = [
    ...(historyRows ?? []).map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    })),
    // El mensaje actual DEBE incluirse al final para que la IA lo vea
    { role: "user" as const, content },
  ];

  // Ejecutar agente IA
  const reply = await runAgent({ ...config, system_prompt: fullSystemPrompt }, history, {
    supabase,
    conversationId: conversation_id,
    chatwootConversationId: chatwoot_conversation_id,
    chatwootContactId: chatwoot_contact_id,
  });

  // Enviar respuesta por Chatwoot
  await sendMessage(chatwoot_conversation_id, reply);

  // Guardar respuesta
  await supabase.from("messages").insert({
    conversation_id,
    role: "ai",
    content: reply,
  });

  await supabase.from("agent_logs").insert({
    conversation_id,
    event: "ai_reply_sent",
    payload: { reply },
  });
}
