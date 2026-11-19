
import { ArrowLeft, Plus, RefreshCw, Users } from "lucide-react";

interface MembersHeaderProps {
  churchName: string;
  loadingChurch: boolean;
  loadingMembers: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onAdd: () => void;
}

export const MembersHeader = ({
  churchName,
  loadingChurch,
  loadingMembers,
  onBack,
  onRefresh,
  onAdd,
}: MembersHeaderProps) => {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Voltar para igrejas
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold">Membros</h1>
            <p className="mt-1 text-muted">
              {loadingChurch ? "Carregando igreja..." : churchName}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loadingMembers}
            className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted/10 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Atualizar
          </button>

          <button
            type="button"
            onClick={onAdd}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus size={17} />
            Adicionar membro
          </button>
        </div>
      </div>
    </div>
  );
};
