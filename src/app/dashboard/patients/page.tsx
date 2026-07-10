import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function PatientsPage() {
  const supabase = await createClient();

  const { data: patients } = await supabase
    .from("patients")
    .select("*, appointments(count)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Pacientes</h1>
        <p className="text-gray-400 text-sm mt-1">
          Pacientes registrados por el agente IA
        </p>
      </div>

      {!patients || patients.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-12 text-center">
          <p className="text-4xl mb-3">👤</p>
          <p className="text-gray-400 font-medium">Sin pacientes aún</p>
          <p className="text-gray-600 text-sm mt-1">
            Los pacientes se registran automáticamente al pedir cita
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Nombre</th>
                <th className="px-5 py-3 text-left">Teléfono</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Citas</th>
                <th className="px-5 py-3 text-left">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {patients.map((p) => (
                <tr key={p.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3 text-gray-200 font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-gray-400">{p.phone}</td>
                  <td className="px-5 py-3 text-gray-500">{p.email ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-400">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(p.appointments as any)?.[0]?.count ?? 0}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(p.created_at).toLocaleDateString("es-ES")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
