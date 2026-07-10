"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: "⊞", exact: true },
  { href: "/dashboard/conversations", label: "Conversaciones", icon: "💬" },
  { href: "/dashboard/knowledge", label: "Conocimiento", icon: "📚" },
  { href: "/dashboard/agents", label: "Agente IA", icon: "🤖" },
  { href: "/dashboard/settings", label: "Configuración", icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-black font-bold text-sm">
            IA
          </div>
          <div>
            <p className="font-semibold text-white text-sm">IA Clínica</p>
            <p className="text-xs text-gray-400">Agente WhatsApp</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-green-500/10 text-green-400 font-medium"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-600 text-center">v0.2.0 — Alpha</p>
      </div>
    </aside>
  );
}
