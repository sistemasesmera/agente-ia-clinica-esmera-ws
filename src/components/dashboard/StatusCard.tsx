"use client";

import { useEffect, useState } from "react";

type Status = "checking" | "ok" | "error";

export default function DatabaseStatusCard() {
  const [status, setStatus] = useState<Status>("checking");
  const [timestamp, setTimestamp] = useState<string>("");

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        setStatus(data.database === "connected" ? "ok" : "error");
        setTimestamp(new Date(data.timestamp).toLocaleTimeString("es-ES"));
      } catch {
        setStatus("error");
      }
    }
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const colors = {
    checking: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    ok: "bg-green-500/10 text-green-400 border-green-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const labels = {
    checking: "Verificando...",
    ok: "Conectado",
    error: "Sin conexión",
  };

  const dots = {
    checking: "bg-yellow-400 animate-pulse",
    ok: "bg-green-400",
    error: "bg-red-400",
  };

  return (
    <div className={`rounded-xl border p-5 ${colors[status]}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium opacity-70">Base de datos</p>
        <span className="text-lg">🗄</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${dots[status]}`} />
        <span className="font-semibold">{labels[status]}</span>
      </div>
      {timestamp && (
        <p className="text-xs opacity-50 mt-2">Última verificación: {timestamp}</p>
      )}
    </div>
  );
}
