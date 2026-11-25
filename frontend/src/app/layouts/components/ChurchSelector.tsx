
import { Building2, ChevronDown, Check } from "lucide-react";
import { useChurchContext } from "../../providers/ChurchProvider";

export const ChurchSelector = () => {
  const {
    churches,
    activeChurch,
    isLoadingChurches,
    selectChurch,
  } = useChurchContext();

  if (isLoadingChurches) {
    return (
      <div className="text-sm text-muted">
        Carregando igrejas...
      </div>
    );
  }

  if (churches.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Building2 size={18} />
        Nenhuma igreja disponível
      </div>
    );
  }

  if (churches.length === 1) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
        <Building2 size={18} className="text-primary" />
        <span className="max-w-40 truncate text-sm font-medium">
          {activeChurch?.name ?? churches[0].name}
        </span>
      </div>
    );
  }

  return (
    <div className="group relative">
      <button
        type="button"
        className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm transition hover:bg-sidebar"
      >
        <Building2 size={18} className="text-primary" />

        <span className="max-w-36 truncate font-medium">
          {activeChurch?.name ?? "Selecionar igreja"}
        </span>

        <ChevronDown size={16} className="text-muted" />
      </button>

      <div className="invisible absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-surface p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        {churches.map((church) => (
          <button
            key={church.id}
            type="button"
            onClick={() => selectChurch(church.id)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-sidebar"
          >
            <span className="truncate">{church.name}</span>

            {activeChurch?.id === church.id && (
              <Check size={16} className="shrink-0 text-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
