
import { Bell, LogOut, Menu, Moon, Sun, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useTheme } from "../../providers/ThemeProvider";
import { useAuth } from "../../../feature/auth/hooks/useAuth";

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header = ({ onMenuToggle }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao encerrar sessão:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="flex h-20 items-center justify-between border-b border-border bg-surface px-5 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-muted transition hover:bg-sidebar hover:text-foreground lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="text-lg font-semibold">Visão geral</h2>
          <p className="hidden text-xs text-muted sm:block">
            Bem-vindo ao Revezo
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2.5 text-muted transition hover:bg-sidebar hover:text-foreground"
          aria-label="Alternar tema"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          className="relative rounded-xl p-2.5 text-muted transition hover:bg-sidebar hover:text-foreground"
          aria-label="Notificações"
        >
          <Bell size={20} />
        </button>

        <div className="h-8 w-px bg-border" />

        <button className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-sidebar">
          <UserCircle size={28} className="text-primary" />
          <span className="hidden text-sm font-medium sm:block">
            Minha conta
          </span>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl p-2.5 text-muted transition hover:bg-sidebar hover:text-red-500"
          aria-label="Sair da conta"
          title="Sair da conta"
        >
          <LogOut size={20} />
          <span className="hidden text-sm font-medium sm:block">
            Sair
          </span>
        </button>
      </div>
    </header>
  );
};
