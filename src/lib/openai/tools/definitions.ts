import type { ChatCompletionTool } from "openai/resources";

export const AGENT_TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "escalate_to_human",
      description:
        "Escala la conversación al equipo comercial y desactiva el agente IA. Úsala cuando: el lead quiera pedir una cita, solicite hablar con una persona, haga una consulta médica que requiera valoración, o muestre frustración.",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["quiere_cita", "consulta_medica", "solicita_humano", "frustracion"],
            description:
              "Motivo del escalamiento: quiere_cita (quiere reservar), consulta_medica (duda médica), solicita_humano (pide hablar con alguien), frustracion (lead frustrado)",
          },
          summary: {
            type: "string",
            description:
              "Resumen breve de lo que quiere el lead, para que el comercial tenga contexto al retomar",
          },
        },
        required: ["type", "summary"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "save_patient_info",
      description:
        "Guarda los datos de contacto del lead. Úsala cuando el lead te proporcione su nombre y/o teléfono.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nombre completo" },
          phone: { type: "string", description: "Teléfono de contacto" },
          email: { type: "string", description: "Email (opcional)" },
          notes: { type: "string", description: "Tratamiento de interés u otras notas" },
        },
        required: ["name", "phone"],
      },
    },
  },
];
