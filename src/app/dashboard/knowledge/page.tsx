import { createClient } from "@/lib/supabase/server";
import KnowledgeEditor from "@/components/dashboard/KnowledgeEditor";
import TreatmentsManager from "@/components/dashboard/TreatmentsManager";

export const revalidate = 0;

export default async function KnowledgePage() {
  const supabase = await createClient();

  const [{ data: sections }, { data: treatments }] = await Promise.all([
    supabase.from("knowledge_base").select("*").order("section"),
    supabase.from("treatments").select("*").order("category").order("name"),
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Base de conocimiento</h1>
        <p className="text-gray-400 text-sm mt-1">
          Información que usa el agente para responder a los leads
        </p>
      </div>

      <TreatmentsManager treatments={treatments ?? []} />

      <div className="border-t border-gray-800 pt-10">
        <KnowledgeEditor sections={sections ?? []} />
      </div>
    </div>
  );
}
