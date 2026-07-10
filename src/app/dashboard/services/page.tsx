import { createClient } from "@/lib/supabase/server";
import ServicesManager from "@/components/dashboard/ServicesManager";

export const revalidate = 0;

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("name");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Servicios</h1>
        <p className="text-gray-400 text-sm mt-1">
          Servicios que ofrece la clínica — el agente los usa para gestionar citas
        </p>
      </div>
      <ServicesManager services={services ?? []} />
    </div>
  );
}
