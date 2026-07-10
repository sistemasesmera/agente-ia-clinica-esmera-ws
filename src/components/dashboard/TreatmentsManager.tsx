"use client";

import { useState } from "react";

interface Treatment {
  id: string;
  name: string;
  category: "estetico" | "medico";
  duration_minutes: number | null;
  price: number | null;
  description: string | null;
  benefits: string | null;
  protocol: string | null;
  active: boolean;
}

interface Props {
  treatments: Treatment[];
}

const EMPTY: Omit<Treatment, "id" | "active"> = {
  name: "",
  category: "estetico",
  duration_minutes: null,
  price: null,
  description: "",
  benefits: "",
  protocol: "",
};

export default function TreatmentsManager({ treatments: initial }: Props) {
  const [treatments, setTreatments] = useState(initial);
  const [editing, setEditing] = useState<Treatment | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Treatment, "id" | "active">>(EMPTY);
  const [saving, setSaving] = useState(false);

  const esteticos = treatments.filter((t) => t.category === "estetico" && t.active);
  const medicos = treatments.filter((t) => t.category === "medico" && t.active);
  const inactivos = treatments.filter((t) => !t.active);

  function openCreate() {
    setForm(EMPTY);
    setCreating(true);
    setEditing(null);
  }

  function openEdit(t: Treatment) {
    setForm({
      name: t.name,
      category: t.category,
      duration_minutes: t.duration_minutes,
      price: t.price,
      description: t.description ?? "",
      benefits: t.benefits ?? "",
      protocol: t.protocol ?? "",
    });
    setEditing(t);
    setCreating(false);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: form.category === "medico" ? null : form.price,
      };

      if (creating) {
        const res = await fetch("/api/treatments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        setTreatments((prev) => [...prev, data]);
      } else if (editing) {
        const res = await fetch(`/api/treatments/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        setTreatments((prev) => prev.map((t) => (t.id === editing.id ? data : t)));
      }
      closeForm();
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(t: Treatment) {
    const res = await fetch(`/api/treatments/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !t.active }),
    });
    const data = await res.json();
    setTreatments((prev) => prev.map((x) => (x.id === t.id ? data : x)));
  }

  const showForm = creating || editing !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Tratamientos</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Cristina usa esta info para responder sobre servicios
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black text-sm font-medium rounded-lg transition-colors"
        >
          + Añadir
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5 space-y-4">
          <h3 className="text-white font-medium text-sm">
            {creating ? "Nuevo tratamiento" : `Editar: ${editing?.name}`}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Nombre</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                placeholder="Ej: Limpieza Facial"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Categoría</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as "estetico" | "medico" })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="estetico">Estético</option>
                <option value="medico">Médico</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Duración (min)</label>
              <input
                type="number"
                value={form.duration_minutes ?? ""}
                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value ? Number(e.target.value) : null })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                placeholder="60"
              />
            </div>

            {form.category === "estetico" && (
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Precio (€)</label>
                <input
                  type="number"
                  value={form.price ?? ""}
                  onChange={(e) => setForm({ ...form, price: e.target.value ? Number(e.target.value) : null })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                  placeholder="45"
                />
              </div>
            )}

            <div className="col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Descripción</label>
              <textarea
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white resize-none"
                placeholder="Describe el tratamiento..."
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Beneficios</label>
              <textarea
                value={form.benefits ?? ""}
                onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                rows={2}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white resize-none"
                placeholder="Piel más luminosa, poros limpios..."
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Protocolo</label>
              <textarea
                value={form.protocol ?? ""}
                onChange={(e) => setForm({ ...form, protocol: e.target.value })}
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white resize-none"
                placeholder="Pasos del tratamiento, preparación previa, cuidados posteriores..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving || !form.name}
              className="px-4 py-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={closeForm}
              className="px-4 py-2 text-gray-400 hover:text-gray-200 text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {[{ label: "Estéticos", items: esteticos }, { label: "Médicos", items: medicos }].map(
        ({ label, items }) =>
          items.length > 0 && (
            <div key={label} className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</p>
              {items.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-gray-800 bg-gray-900 px-5 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-gray-200 font-medium text-sm">{t.name}</p>
                        {t.duration_minutes && (
                          <span className="text-xs text-gray-500">{t.duration_minutes} min</span>
                        )}
                        {t.category === "estetico" && t.price !== null && (
                          <span className="text-xs text-green-400 font-medium">{t.price}€</span>
                        )}
                        {t.category === "medico" && (
                          <span className="text-xs text-blue-400">Precio bajo consulta</span>
                        )}
                      </div>
                      {t.description && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{t.description}</p>
                      )}
                      {t.benefits && (
                        <p className="text-gray-600 text-xs mt-1">✓ {t.benefits}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => openEdit(t)}
                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggle(t)}
                        className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                      >
                        Desactivar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
      )}

      {inactivos.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600 uppercase tracking-wider font-medium">Inactivos</p>
          {inactivos.map((t) => (
            <div key={t.id} className="rounded-xl border border-gray-800 bg-gray-900/50 px-5 py-3 flex items-center justify-between opacity-50">
              <p className="text-gray-400 text-sm">{t.name}</p>
              <button
                onClick={() => handleToggle(t)}
                className="text-xs text-gray-500 hover:text-green-400 transition-colors"
              >
                Activar
              </button>
            </div>
          ))}
        </div>
      )}

      {treatments.filter(t => t.active).length === 0 && !showForm && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-10 text-center">
          <p className="text-gray-600 text-sm">Sin tratamientos aún. Añade el primero.</p>
        </div>
      )}
    </div>
  );
}
