"use client";

import { useEffect, useState } from "react";

type Status = "checking" | "ok" | "error" | "not_configured";

interface ChatwootHealth {
  status: string;
  chatwoot: string;
  inbox?: { id: number; name: string } | null;
}

export default function ChatwootStatusCard() {
  const [status, setStatus] = useState<Status>("checking");
  const [inbox, setInbox] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/health/chatwoot");
        const data: ChatwootHealth = await res.json();
        if (data.chatwoot === "connected") {
          setStatus("ok");
          setInbox(data.inbox ?? null);
        } else if (data.chatwoot === "not_configured") {
          setStatus("not_configured");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    }
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const config = {
    checking: {
      card: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      dot: "bg-yellow-400 animate-pulse",
      label: "Verificando...",
    },
    ok: {
      card: "bg-green-500/10 text-green-400 border-green-500/20",
      dot: "bg-green-400",
      label: "Conectado",
    },
    error: {
      card: "bg-red-500/10 text-red-400 border-red-500/20",
      dot: "bg-red-400",
      label: "Error de conexión",
    },
    not_configured: {
      card: "bg-gray-800 text-gray-500 border-gray-700",
      dot: "bg-gray-600",
      label: "No configurado",
    },
  }[status];

  return (
    <div className={`rounded-xl border p-5 ${config.card}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium opacity-70">Chatwoot</p>
        <span className="text-lg">📡</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
        <span className="font-semibold">{config.label}</span>
      </div>
      {inbox && (
        <p className="text-xs opacity-60 mt-2 truncate">
          {inbox.name} · inbox {inbox.id}
        </p>
      )}
    </div>
  );
}
