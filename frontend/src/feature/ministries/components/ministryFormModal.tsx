
import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type { Ministry } from "../types";

interface MinistryFormModalProps {
  open: boolean;
  ministry: Ministry | null;
  saving: boolean;
  formError: string | null;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export const MinistryFormModal = ({
  open,
  ministry,
  saving,
  formError,
  onClose,
  onSubmit,
}: MinistryFormModalProps) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      setName(ministry?.name ?? "");
    }
  }, [open, ministry]);

  if (!open) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedName = name.trim();

    if (!normalizedName) return;

    onSubmit(normalizedName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 text-foreground shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {ministry ? "Editar ministério" : "Novo ministério"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-muted hover:bg-muted/10 disabled:opacity-50"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="ministry-name"
              className="mb-2 block text-sm font-medium"
            >
              Nome do ministério
            </label>

            <input
              id="ministry-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Louvor"
              maxLength={150}
              required
              autoFocus
              disabled={saving}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary disabled:opacity-50"
            />
          </div>

          {formError && (
            <p className="text-sm text-red-500">{formError}</p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-border px-4 py-2.5 text-sm disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
