"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Config {
  clinic_name: string;
  system_prompt: string;
  model: string;
  enabled: boolean;
  auto_reply: boolean;
}

export default function AgentConfigForm({ config }: { config: Config | null }) {
  const router = useRouter();
  const [form, setForm] = useState<Config>({
    clinic_name: config?.clinic_name ?? "",
    system_prompt: config?.system_prompt ?? "",
    model: config?.model ?? "gpt-4o-mini",
    enabled: config?.enabled ?? true,
    auto_reply: config?.auto_reply ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/agent-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Estado del agente */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
        <h2 className="font-semibold text-white">Estado</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">Agente activo</p>
            <p className="text-xs text-gray-500">El agente procesará los mensajes entrantes</p>
          </div>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, enabled: !f.enabled }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.enabled ? "bg-green-500" : "bg-gray-700"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.enabled ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">Respuesta automática</p>
            <p className="text-xs text-gray-500">Responde automáticamente sin intervención humana</p>
          </div>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, auto_reply: !f.auto_reply }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.auto_reply ? "bg-green-500" : "bg-gray-700"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.auto_reply ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {/* Identidad */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
        <h2 className="font-semibold text-white">Identidad</h2>

        <div className="space-y-1">
          <label className="text-xs text-gray-500 uppercase tracking-wider">Nombre de la clínica</label>
          <input
            type="text"
            value={form.clinic_name}
            onChange={(e) => setForm((f) => ({ ...f, clinic_name: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-500 uppercase tracking-wider">Modelo</label>
          <select
            value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-green-500"
          >
            <option value="gpt-4o-mini">gpt-4o-mini (rápido y económico)</option>
            <option value="gpt-4o">gpt-4o (más inteligente)</option>
            <option value="gpt-4-turbo">gpt-4-turbo</option>
          </select>
        </div>
      </div>

      {/* Prompt del sistema */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-2">
        <h2 className="font-semibold text-white">Instrucciones del agente</h2>
        <p className="text-xs text-gray-500">Define cómo debe comportarse, qué puede responder y qué tono usar</p>
        <textarea
          value={form.system_prompt}
          onChange={(e) => setForm((f) => ({ ...f, system_prompt: e.target.value }))}
          rows={8}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-green-500 resize-none font-mono"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold py-3 rounded-lg transition-colors"
      >
        {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar configuración"}
      </button>
    </form>
  );
}
