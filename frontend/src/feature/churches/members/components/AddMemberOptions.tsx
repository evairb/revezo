
import { UserPlus, UserRoundSearch } from "lucide-react";

interface AddMemberOptionsProps {
  onCreateNew: () => void;
  onLinkExisting: () => void;
}

export const AddMemberOptions = ({
  onCreateNew,
  onLinkExisting,
}: AddMemberOptionsProps) => {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onCreateNew}
        className="flex w-full items-center gap-4 rounded-xl border border-border p-4 text-left transition hover:border-primary hover:bg-primary/5"
      >
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserPlus size={23} />
        </div>

        <div className="flex-1">
          <p className="font-semibold">Cadastrar nova pessoa</p>
          <p className="mt-1 text-sm text-muted">
            Criar uma conta e vinculá-la automaticamente à igreja.
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={onLinkExisting}
        className="flex w-full items-center gap-4 rounded-xl border border-border p-4 text-left transition hover:border-primary hover:bg-primary/5"
      >
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserRoundSearch size={23} />
        </div>

        <div className="flex-1">
          <p className="font-semibold">Vincular usuário existente</p>
          <p className="mt-1 text-sm text-muted">
            Localizar uma conta que já existe no Revezo.
          </p>
        </div>
      </button>
    </div>
  );
};
