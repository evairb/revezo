import {
  LayoutDashboard,
  Church,
  Users,
  CalendarDays,
  ClipboardList,
  Settings,
  ChevronLeft,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}
import { NavLink } from "react-router-dom";

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const menuItems = [
    {
      label: "Visão geral",
      icon: LayoutDashboard,
      path: "/",
    },
    {
      label: "Igrejas",
      icon: Church,
      path: "/igrejas",
    },
    {
      label: "Ministérios",
      icon: Users,
      path: "/ministerios",
    },
    {
      label: "Cultos",
      icon: CalendarDays,
      path: "/cultos",
    },
    {
      label: "Escalas",
      icon: ClipboardList,
      path: "/escalas",
    },
  ];

  return (
    <aside
      className={`relative flex h-screen flex-col border-r border-border bg-sidebar transiton-all duration 300 ${collapsed ? "w-20" : "w-64"
        }`}
    >
      <div className="flex h-20 items-center justify-between border-b border-border px-5">
        {!collapsed && (
          <div>
            <h1 className="text-2x1 font-bold tracking-tight text-primary">
              Revezo
            </h1>
            <p className="text-xs text-muted">Gestão de escalas</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="rounded-lg p-2 text-muted transition hover:bg-surface hover:text-foreground"
          aria-label="Recolher menu"
        >
          <ChevronLeft
            size={20}
            className={`transition-transform ${collapsed ? "rotate-180" : ""
              }`}
          />
        </button>
      </div>

      <nav className="flex-1 space-y-2 p-3">
        {!collapsed && (
          <p className="mb-4 px-3 pt-4 text-xs font-semibold uppercase tracking-wider text-muted">
            Menu Principa
          </p>
        )}

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive
                  ? "bg-primary text-white"
                  : "text-muted hover:bg-surface hover:text-foreground"
                }`
              }
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button
          title={collapsed ? "Configurações" : undefined}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted transition hover:bg-surface hover:text-foreground"
        >
          <Settings size={20} />
          {!collapsed && <span>Configurações</span>}
        </button>
      </div>
    </aside>
  )
}