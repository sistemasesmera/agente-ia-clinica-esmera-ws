import { assignConversation, addLabel, sendPrivateNote, setConversationCustomAttribute } from "@/lib/chatwoot/client";

type EscalationType = "quiere_cita" | "consulta_medica" | "solicita_humano" | "frustracion";

interface EscalateArgs {
  type: EscalationType;
  summary: string;
}

interface EscalateContext {
  chatwootConversationId: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  conversationId: string;
}

const LABEL_MAP: Record<EscalationType, string> = {
  quiere_cita: "quiere-cita",
  consulta_medica: "consulta-medica",
  solicita_humano: "solicita-humano",
  frustracion: "cliente-molesto",
};

function isBusinessHours(): boolean {
  const now = new Date();
  const madrid = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
  const day = madrid.getDay();
  const currentMinutes = madrid.getHours() * 60 + madrid.getMinutes();
  return day >= 1 && day <= 6 && currentMinutes >= 600 && currentMinutes < 1140;
}

function buildReply(type: EscalationType, duringHours: boolean): string {
  const offHoursNote = "en el próximo horario disponible (Lunes a Sábado de 10:00 a 19:00)";

  const replies: Record<EscalationType, string> = {
    quiere_cita: duringHours
      ? "¡Genial! 🗓️ Voy a pasarte con nuestro equipo para que te ayuden a encontrar el hueco perfecto. Te contactarán enseguida. 😊"
      : `¡Genial! 🗓️ Te hemos apuntado y nuestro equipo te contactará ${offHoursNote}. 😊`,
    consulta_medica: duringHours
      ? "Entiendo tu consulta. 🩺 Voy a pasarte con nuestro equipo ahora mismo para que te den la mejor respuesta. ✨"
      : `Entiendo tu consulta. 🩺 Nuestro equipo te contactará ${offHoursNote} para darte la mejor respuesta. ✨`,
    solicita_humano: duringHours
      ? "¡Por supuesto! 🙋 Ahora mismo aviso a una de nuestras compañeras para que te atienda personalmente."
      : `¡Por supuesto! 🙋 Una de nuestras compañeras te contactará ${offHoursNote}. Queda apuntado. 😊`,
    frustracion: duringHours
      ? "Lamento que no haya podido ayudarte mejor. 🙏 Ahora mismo le paso tu conversación a una compañera del equipo."
      : `Lamento las molestias. 🙏 Una compañera del equipo te contactará ${offHoursNote} para ayudarte personalmente.`,
  };

  return replies[type];
}

export async function escalateToHuman(
  args: EscalateArgs,
  ctx: EscalateContext
): Promise<string> {
  const { chatwootConversationId, supabase, conversationId } = ctx;

  // Apagar el agente y añadir motivo en Chatwoot (fuente de verdad)
  const label = LABEL_MAP[args.type];
  if (!label) throw new Error(`Tipo de escalado desconocido: ${args.type}`);

  await Promise.all([
    addLabel(chatwootConversationId, "agente_apagado"),
    addLabel(chatwootConversationId, label),
    setConversationCustomAttribute(chatwootConversationId, { agente_ia: "Inactivo" }),
  ]);

  // Nota privada para el comercial con el contexto
  await sendPrivateNote(
    chatwootConversationId,
    `📋 *Lead escalado por Cristina*\nMotivo: ${label}\nResumen: ${args.summary}`
  );

  // Asignar a equipo si está configurado
  const teamId = process.env.CHATWOOT_ESCALATION_TEAM_ID;
  if (teamId) {
    await assignConversation(chatwootConversationId, Number(teamId));
  }

  await supabase.from("agent_logs").insert({
    conversation_id: conversationId,
    event: "escalated_to_human",
    payload: { type: args.type, summary: args.summary },
  });

  return buildReply(args.type, isBusinessHours());
}
