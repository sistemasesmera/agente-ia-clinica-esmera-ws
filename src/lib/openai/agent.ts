import OpenAI from "openai";
import { AGENT_TOOLS } from "./tools/definitions";
import { escalateToHuman } from "./tools/escalate";
import { savePatientInfo } from "./tools/patient";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AgentConfig {
  system_prompt: string;
  model: string;
  clinic_name: string;
}

interface AgentContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  conversationId: string;
  chatwootConversationId: number;
  chatwootContactId?: number;
}

export async function runAgent(
  config: AgentConfig,
  history: Message[],
  ctx: AgentContext
): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `${config.system_prompt}\n\nFecha y hora actual: ${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}`,
    },
    ...history,
  ];

  const MAX_ITERATIONS = 5;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await openai.chat.completions.create({
      model: config.model,
      messages,
      tools: AGENT_TOOLS,
      tool_choice: "auto",
      max_tokens: 500,
      temperature: 0.6,
    });

    const choice = response.choices[0];

    // Respuesta de texto final
    if (choice.finish_reason === "stop") {
      return choice.message.content ?? "No he podido generar una respuesta.";
    }

    // Llamada a herramientas
    if (choice.finish_reason === "tool_calls" && choice.message.tool_calls) {
      messages.push(choice.message);

      for (const toolCall of choice.message.tool_calls) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tc = toolCall as any;
        const args = JSON.parse(tc.function.arguments);
        let result = "";

        try {
          switch (tc.function.name) {
            case "escalate_to_human":
              result = await escalateToHuman(args, {
                chatwootConversationId: ctx.chatwootConversationId,
                supabase: ctx.supabase,
                conversationId: ctx.conversationId,
              });
              break;

            case "save_patient_info":
              result = await savePatientInfo(args, {
                supabase: ctx.supabase,
                chatwootContactId: ctx.chatwootContactId,
              });
              break;

            default:
              result = "Herramienta no reconocida.";
          }
        } catch (err) {
          result = `Error ejecutando ${tc.function.name}: ${err instanceof Error ? err.message : "Error desconocido"}`;
        }

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }
    }
  }

  return "Lo siento, no pude completar la acción. Por favor contacta con nosotros directamente.";
}
