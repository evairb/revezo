
import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";

import { AddMemberOptions } from "./AddMemberOptions";
import { CreateMemberForm } from "./CreateMemberForm";
import { ExistingMemberForm } from "./ExistingMemberForm";

interface AddMemberModalProps {
  churchId: number;
  onClose: () => void;
  onCreated: () => void;
}

type ModalMode = "options" | "new" | "existing";

export const AddMemberModal = ({
  churchId,
  onClose,
  onCreated,
}: AddMemberModalProps) => {
  const [mode, setMode] = useState<ModalMode>("options");

  const handleCreated = () => {
    onCreated();
    onClose();
  };

  const handleBack = () => {
    setMode("options");
  };

  const title = {
    options: "Adicionar membro",
    new: "Cadastrar nova pessoa",
    existing: "Vincular usuário",
  }[mode];

  const description = {
    options: "Escolha como deseja adicionar a pessoa.",
    new: "Crie uma conta e vincule-a automaticamente à igreja.",
    existing: "Pesquise uma conta existente no Revezo.",
  }[mode];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 text-foreground shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode !== "options" && (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-lg p-2 text-muted hover:bg-muted/10"
                aria-label="Voltar"
              >
                <ArrowLeft size={19} />
              </button>
            )}

            <div>
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted">{description}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted hover:bg-muted/10"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {mode === "options" && (
          <AddMemberOptions
            onCreateNew={() => setMode("new")}
            onLinkExisting={() => setMode("existing")}
          />
        )}

        {mode === "new" && (
          <CreateMemberForm
            churchId={churchId}
            onCancel={handleBack}
            onCreated={handleCreated}
          />
        )}

        {mode === "existing" && (
          <ExistingMemberForm
            churchId={churchId}
            onCancel={handleBack}
            onCreated={handleCreated}
          />
        )}
      </div>
    </div>
  );
};
