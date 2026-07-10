"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Section {
  id: string;
  section: string;
  title: string;
  content: string;
  active: boolean;
}

export default function KnowledgeEditor({ sections }: { sections: Section[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  async function handleSave(section: Section) {
    setSaving(section.section);
    await fetch("/api/knowledge-base", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section: section.section,
        content: drafts[section.section] ?? section.content,
        active: section.active,
      }),
    });
    setSaving(null);
    setSaved(section.section);
    setEditing(null);
    router.refresh();
    setTimeout(() => setSaved(null), 2000);
  }

  async function toggleActive(section: Section) {
    await fetch("/api/knowledge-base", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section: section.section,
        content: section.content,
        active: !section.active,
      }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {sections.map((s) => (
        <div
          key={s.id}
          className={`rounded-xl border bg-gray-900 overflow-hidden transition-all ${
            s.active ? "border-gray-800" : "border-gray-800/40 opacity-60"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleActive(s)}
                className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                  s.active ? "bg-green-500" : "bg-gray-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    s.active ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <h3 className="font-medium text-gray-200 text-sm">{s.title}</h3>
            </div>
            <button
              onClick={() => {
                if (editing === s.section) {
                  setEditing(null);
                } else {
                  setEditing(s.section);
                  setDrafts((d) => ({ ...d, [s.section]: s.content }));
                }
              }}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1"
            >
              {editing === s.section ? "Cancelar" : "Editar"}
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-4">
            {editing === s.section ? (
              <div className="space-y-3">
                <textarea
                  value={drafts[s.section] ?? s.content}
                  onChange={(e) =>
                    setDrafts((d) => ({ ...d, [s.section]: e.target.value }))
                  }
                  rows={Math.max(6, (drafts[s.section] ?? s.content).split("\n").length + 2)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-green-500 resize-none font-mono leading-relaxed"
                />
                <button
                  onClick={() => handleSave(s)}
                  disabled={saving === s.section}
                  className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {saving === s.section ? "Guardando..." : saved === s.section ? "✓ Guardado" : "Guardar"}
                </button>
              </div>
            ) : (
              <pre className="text-sm text-gray-400 whitespace-pre-wrap font-sans leading-relaxed">
                {s.content}
              </pre>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
