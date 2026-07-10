import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function ConversationsPage() {
  const supabase = await createClient();

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(`
      id, chatwoot_id, contact_name, contact_phone,
      status, agent_enabled, created_at, updated_at,
      messages(count)
    `)
    .order("updated_at", { ascending: false })
    .limit(100);

  // Agrupar por teléfono — quedarse con la conversación más reciente por contacto
  const byPhone = new Map<string, typeof conversations extends (infer T)[] | null ? T : never>();
  for (const conv of conversations ?? []) {
    const key = conv.contact_phone ?? conv.id;
    if (!byPhone.has(key)) byPhone.set(key, conv);
  }
  const leads = Array.from(byPhone.values());

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Conversaciones</h1>
          <p className="text-gray-400 text-sm mt-1">
            Leads que han escrito por WhatsApp
          </p>
        </div>
        <span className="text-sm text-gray-500">{leads.length} contactos</span>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
          Error: {error.message}
        </div>
      )}

      {!error && leads.length === 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-12 text-center">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-gray-400 font-medium">Sin conversaciones aún</p>
          <p className="text-gray-600 text-sm mt-1">
            Cuando un lead escriba por WhatsApp aparecerá aquí
          </p>
        </div>
      )}

      {leads.length > 0 && (
        <div className="space-y-2">
          {leads.map((conv) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msgCount = (conv.messages as any)?.[0]?.count ?? 0;
            const isActive = conv.agent_enabled;
            const isEscalated = !isActive;

            return (
              <div
                key={conv.id}
                className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900 px-5 py-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-semibold text-sm flex-shrink-0">
                    {(conv.contact_name ?? "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-gray-200 font-medium text-sm">
                      {conv.contact_name ?? "Desconocido"}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {conv.contact_phone ?? "Sin teléfono"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center hidden sm:block">
                    <p className="text-gray-200 text-sm font-medium">{msgCount}</p>
                    <p className="text-gray-600 text-xs">mensajes</p>
                  </div>

                  <div className="text-center hidden md:block">
                    <p className="text-gray-500 text-xs">
                      {new Date(conv.updated_at ?? conv.created_at).toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEscalated ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        Con asesor
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        Cristina activa
                      </span>
                    )}
                  </div>

                  <a
                    href={`https://app.chatwoot.com/app/accounts/174275/conversations/${conv.chatwoot_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-600 hover:text-gray-300 transition-colors"
                  >
                    Ver en Chatwoot →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
