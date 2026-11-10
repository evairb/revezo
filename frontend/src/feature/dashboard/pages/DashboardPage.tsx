export const DashboardPage = () => {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        Painel administrativo
      </p>

      <h1 className="mt-2 text-3xl font-bold">Visão geral</h1>

      <p className="mt-2 text-muted">
        Acompanhe a organização e o funcionamento da sua igreja.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Igrejas", description: "Igrejas cadastradas" },
          { title: "Ministérios", description: "Ministérios cadastrados" },
          { title: "Cultos", description: "Cultos configurados" },
          { title: "Escalas", description: "Escalas mensais" },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-surface p-6"
          >
            <p className="text-sm text-muted">{item.title}</p>
            <p className="mt-3 text-3xl font-bold">—</p>
            <p className="mt-2 text-xs text-muted">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}