import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  confirmed: "bg-green-500/10 text-green-400",
  cancelled: "bg-red-500/10 text-red-400",
  completed: "bg-gray-500/10 text-gray-400",
};

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

export default async function AppointmentsPage() {
  const supabase = await createClient();

  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      id, date, time, status, notes, created_at,
      patients(name, phone),
      services(name)
    `)
    .order("date", { ascending: true })
    .order("time", { ascending: true })
    .limit(100);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Citas</h1>
        <p className="text-gray-400 text-sm mt-1">Citas reservadas por el agente IA</p>
      </div>

      {!appointments || appointments.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-12 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-gray-400 font-medium">Sin citas aún</p>
          <p className="text-gray-600 text-sm mt-1">
            Las citas reservadas por el agente aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Paciente</th>
                <th className="px-5 py-3 text-left">Servicio</th>
                <th className="px-5 py-3 text-left">Fecha</th>
                <th className="px-5 py-3 text-left">Hora</th>
                <th className="px-5 py-3 text-left">Estado</th>
                <th className="px-5 py-3 text-left">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <p className="text-gray-200 font-medium">{(apt.patients as any)?.name ?? "—"}</p>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <p className="text-gray-500 text-xs">{(apt.patients as any)?.phone ?? ""}</p>
                  </td>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <td className="px-5 py-3 text-gray-300">{(apt.services as any)?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-300">
                    {new Date(apt.date).toLocaleDateString("es-ES", {
                      weekday: "short", day: "numeric", month: "short",
                    })}
                  </td>
                  <td className="px-5 py-3 text-gray-300">{apt.time?.slice(0, 5)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[apt.status] ?? ""}`}>
                      {statusLabel[apt.status] ?? apt.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{apt.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
