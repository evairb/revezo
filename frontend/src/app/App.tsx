
import { useTheme } from "./providers/ThemeProvider";

function App() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">

      <header className="flex items-center justify-between border-b border-border px-6 py-5">
        <div>
          <h1 className="text-2xl font-bold">Revezo</h1>
          <p className="text-sm text-muted">
            Sistema de gerenciamento de escalas
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTheme("light")}
            className={`rounded-lg px-4 py-2 text-sm ${
              theme === "light"
                ? "bg-primary text-white"
                : "bg-surface text-foreground"
            }`}
          >
            Institucional
          </button>

          <button
            onClick={() => setTheme("dark")}
            className={`rounded-lg px-4 py-2 text-sm ${
              theme === "dark"
                ? "bg-primary text-white"
                : "bg-surface text-foreground"
            }`}
          >
            Dark
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
          Bem-vindo ao Revezo
        </p>

        <h2 className="text-3xl font-bold sm:text-4xl">
          Sua igreja organizada.
          <br />
          Sua equipe preparada.
        </h2>

        <p className="mt-4 max-w-xl leading-relaxed text-muted">
          Uma plataforma para organizar ministérios, gerenciar cultos
          e construir escalas de serviço de maneira simples e eficiente.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Igrejas",
              description: "Gerenciamento das igrejas cadastradas.",
              icon: "🏛️",
            },
            {
              title: "Ministérios",
              description: "Organização das equipes e responsabilidades.",
              icon: "🤝",
            },
            {
              title: "Escalas",
              description: "Planejamento das equipes para os cultos.",
              icon: "📅",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <span className="text-3xl">{item.icon}</span>
              <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
