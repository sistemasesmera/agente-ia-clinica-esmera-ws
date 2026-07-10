"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number | null;
  active: boolean;
}

export default function ServicesManager({ services }: { services: Service[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    duration_minutes: 60,
    price: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: form.price ? Number(form.price) : null,
      }),
    });
    setForm({ name: "", description: "", duration_minutes: 60, price: "" });
    setAdding(false);
    setSaving(false);
    router.refresh();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        {services.length === 0 && !adding ? (
          <div className="p-10 text-center">
            <p className="text-gray-500 text-sm">Sin servicios. Añade el primero.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {services.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className={`font-medium text-sm ${s.active ? "text-gray-200" : "text-gray-500"}`}>
                    {s.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {s.duration_minutes} min
                    {s.price ? ` · ${s.price}€` : ""}
                    {s.description ? ` · ${s.description}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => toggleActive(s.id, s.active)}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${s.active ? "bg-green-500" : "bg-gray-700"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${s.active ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {adding ? (
        <form onSubmit={handleAdd} className="rounded-xl border border-gray-700 bg-gray-900 p-5 space-y-4">
          <h3 className="text-sm font-medium text-gray-300">Nuevo servicio</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="Nombre del servicio"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="col-span-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-green-500"
            />
            <input
              placeholder="Descripción (opcional)"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="col-span-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-green-500"
            />
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Duración (min)</label>
              <input
                type="number"
                value={form.duration_minutes}
                onChange={(e) => setForm((f) => ({ ...f, duration_minutes: Number(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-green-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Precio (€, opcional)</label>
              <input
                type="number"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold py-2 rounded-lg text-sm transition-colors">
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" onClick={() => setAdding(false)}
              className="px-4 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg text-sm transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)}
          className="w-full border border-dashed border-gray-700 hover:border-green-500/50 text-gray-500 hover:text-green-400 rounded-xl py-3 text-sm transition-colors">
          + Añadir servicio
        </button>
      )}
    </div>
  );
}
