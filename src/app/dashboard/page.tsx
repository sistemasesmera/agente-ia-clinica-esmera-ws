import { createClient } from "@/lib/supabase/server";
import DatabaseStatusCard from "@/components/dashboard/StatusCard";
import ChatwootStatusCard from "@/components/dashboard/ChatwootStatusCard";

export const revalidate = 0;

const roadmap = [
  { step: 1, label: "Estructura inicial + Panel de control", done: true },
  { step: 2, label: "Conexión a base de datos Supabase", done: true },
  { step: 3, label: "Integración con Chatwoot (webhook + API)", done: true },
  { step: 4, label: "Integración con OpenAI", done: false },
  { step: 5, label: "Flujo completo del agente WhatsApp", done: false },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalConversations },
    { count: openConversations },
    { count: totalMessages },
    { data: recentLogs },
  ] = await Promise.all([
    supabase.from("conversations").select("*", { count: "exact", head: true }),
    supabase.from("conversations").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("messages").select("*", { count: "exact", head: true }),
    supabase.from("agent_logs").select("event, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const metrics = [
    {
      label: "Conversaciones totales",
      value: totalConversations ?? "—",
      icon: "💬",
      color: "text-blue-400",
    },
    {
      label: "Conversaciones abiertas",
      value: openConversations ?? "—",
      icon: "🟢",
      color: "text-green-400",
    },
    {
      label: "Mensajes procesados",
      value: totalMessages ?? "—",
      icon: "📨",
      color: "text-purple-400",
    },
    {
      label: "Agente IA",
      value: "Pendiente",
      icon: "🤖",
      color: "text-gray-500",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Panel de Control</h1>
        <p className="text-gray-400 text-sm mt-1">
          Agente de IA para WhatsApp — Estado del sistema
        </p>
      </div>

      {/* Estado del sistema */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
          Estado del sistema
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DatabaseStatusCard />

          <ChatwootStatusCard />

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-400">OpenAI</p>
              <span className="text-lg">🧠</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-600" />
              <span className="font-semibold text-gray-500">No configurado</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">Fase 4</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-400">WhatsApp</p>
              <span className="text-lg">📱</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-600" />
              <span className="font-semibold text-gray-500">Vía Chatwoot</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">Pendiente</p>
          </div>
        </div>
      </section>

      {/* Métricas */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
          Métricas
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{m.icon}</span>
              </div>
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-xs text-gray-500 mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progreso */}
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
            Progreso del proyecto
          </h2>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
            {roadmap.map((item) => (
              <div key={item.step} className="flex items-center gap-4">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    item.done
                      ? "bg-green-500 text-black"
                      : "bg-gray-800 text-gray-500 border border-gray-700"
                  }`}
                >
                  {item.done ? "✓" : item.step}
                </div>
                <p className={`text-sm ${item.done ? "text-gray-300" : "text-gray-600"}`}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Logs recientes */}
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
            Actividad reciente
          </h2>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            {!recentLogs || recentLogs.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-4">
                Sin actividad aún
              </p>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 font-mono">{log.event}</span>
                    <span className="text-gray-600 text-xs">
                      {new Date(log.created_at).toLocaleTimeString("es-ES")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
