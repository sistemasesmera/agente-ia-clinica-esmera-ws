export default function SettingsPage() {
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/webhooks/chatwoot`;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-gray-400 text-sm mt-1">Integraciones y credenciales</p>
      </div>

      {/* Chatwoot */}
      <section className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-5">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <span>📡</span> Chatwoot
        </h2>

        <div className="space-y-1">
          <label className="text-xs text-gray-500 uppercase tracking-wider">
            URL del Webhook
          </label>
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2.5">
            <code className="text-green-400 text-sm flex-1 break-all">
              {webhookUrl}
            </code>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Configura esta URL en Chatwoot → Settings → Integrations → Webhooks
          </p>
        </div>

        <div className="space-y-3 text-sm text-gray-400 bg-gray-800/50 rounded-lg p-4">
          <p className="font-medium text-gray-300">Pasos para configurar el webhook:</p>
          <ol className="space-y-2 list-decimal list-inside text-gray-400">
            <li>Ve a <strong className="text-gray-300">Settings → Integrations → Webhooks</strong></li>
            <li>Haz clic en <strong className="text-gray-300">Add new webhook</strong></li>
            <li>Pega la URL del webhook de arriba</li>
            <li>Activa los eventos: <code className="text-green-400">message_created</code>, <code className="text-green-400">conversation_created</code>, <code className="text-green-400">conversation_status_changed</code></li>
            <li>Guarda y listo</li>
          </ol>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-500 uppercase tracking-wider">
            Variables de entorno necesarias
          </label>
          <div className="bg-gray-800 rounded-lg p-4 font-mono text-xs space-y-1 text-gray-300">
            <p><span className="text-blue-400">CHATWOOT_BASE_URL</span>=https://app.chatwoot.com</p>
            <p><span className="text-blue-400">CHATWOOT_API_TOKEN</span>=tu-api-token</p>
            <p><span className="text-blue-400">CHATWOOT_ACCOUNT_ID</span>=tu-account-id</p>
            <p><span className="text-blue-400">CHATWOOT_WEBHOOK_TOKEN</span>=token-secreto-opcional</p>
            <p><span className="text-blue-400">NEXT_PUBLIC_APP_URL</span>=https://tu-dominio.com</p>
          </div>
        </div>
      </section>

      {/* Estado variables */}
      <section className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <span>🔑</span> Estado de credenciales
        </h2>
        <div className="space-y-2 text-sm">
          {[
            ["NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL],
            ["CHATWOOT_BASE_URL", process.env.CHATWOOT_BASE_URL],
            ["CHATWOOT_API_TOKEN", process.env.CHATWOOT_API_TOKEN],
            ["CHATWOOT_ACCOUNT_ID", process.env.CHATWOOT_ACCOUNT_ID],
            ["OPENAI_API_KEY", process.env.OPENAI_API_KEY],
          ].map(([key, val]) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <code className="text-gray-400 text-xs">{key}</code>
              <span className={`text-xs font-medium ${val ? "text-green-400" : "text-gray-600"}`}>
                {val ? "✓ Configurado" : "— Pendiente"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
