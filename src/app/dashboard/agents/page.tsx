import { createClient } from "@/lib/supabase/server";
import AgentConfigForm from "@/components/dashboard/AgentConfigForm";

export const revalidate = 0;

export default async function AgentsPage() {
  const supabase = await createClient();
  const { data: config } = await supabase
    .from("agent_config")
    .select("*")
    .single();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Agente IA</h1>
        <p className="text-gray-400 text-sm mt-1">
          Configura el comportamiento del asistente de WhatsApp
        </p>
      </div>
      <AgentConfigForm config={config} />
    </div>
  );
}
