
import { useState } from "react";
import {
  Church,
  Plus,
  RefreshCw,
  Pencil,
  Power,
  X,
} from "lucide-react";

import { getChurches, createChurch, updateChurch } from "../service";
import { useFetchList } from "../../../shared/hooks/useFetchList";

import type { Church as ChurchType } from "../types";

export const ChurchesPage = () => {
  const {
    data: churches,
    loading,
    error,
    refetch,
  } = useFetchList<ChurchType>(getChurches);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingChurch, setEditingChurch] = useState<ChurchType | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const openCreateModal = () => {
    setEditingChurch(null);
    setName("");
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (church: ChurchType) => {
    setEditingChurch(church);
    setName(church.name);
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingChurch(null);
    setName("");
    setFormError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setFormError("Informe o nome da igreja.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      if (editingChurch) {
        await updateChurch(editingChurch.id, {
          name: trimmedName,
        });
      } else {
        await createChurch({
          name: trimmedName,
        });
      }

      setModalOpen(false);
      setEditingChurch(null);
      setName("");

      refetch();
    } catch {
      setFormError(
        "Não foi possível salvar a igreja. Verifique os dados e suas permissões.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (church: ChurchType) => {
    const action = church.is_active ? "desativar" : "ativar";

    const confirmed = window.confirm(
      `Deseja realmente ${action} a igreja "${church.name}"?`,
    );

    if (!confirmed) return;

    try {
      await updateChurch(church.id, {
        is_active: !church.is_active,
      });

      refetch();
    } catch {
      window.alert(`Não foi possível ${action} a igreja.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Igrejas</h1>
          <p className="mt-2 text-muted">
            Gerencie as igrejas cadastradas no sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-white hover:opacity-90"
        >
          <Plus size={18} />
          Nova igreja
        </button>
      </div>

      {/* Listagem */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="font-semibold">Todas as igrejas</h2>
            <p className="mt-1 text-sm text-muted">
              {churches.length} igreja(s) encontrada(s)
            </p>
          </div>

          <button
            type="button"
            onClick={refetch}
            disabled={loading}
            className="rounded-lg p-2 text-muted hover:bg-muted/10 disabled:opacity-50"
            title="Atualizar"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-muted">
            Carregando igrejas...
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p className="text-red-500">{error}</p>

            <button
              type="button"
              onClick={refetch}
              className="mt-4 rounded-lg border border-border px-4 py-2"
            >
              Tentar novamente
            </button>
          </div>
        ) : churches.length === 0 ? (
          <div className="p-10 text-center">
            <Church className="mx-auto mb-3 text-muted" size={36} />

            <h3 className="font-semibold">
              Nenhuma igreja cadastrada
            </h3>

            <p className="mt-2 text-sm text-muted">
              Comece cadastrando a primeira igreja do sistema.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-5 rounded-lg bg-primary px-4 py-2 text-white"
            >
              Cadastrar igreja
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {churches.map((church) => (
              <div
                key={church.id}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Church size={21} />
                  </div>

                  <div>
                    <h3 className="font-semibold">{church.name}</h3>

                    <span
                      className={`text-xs font-medium ${church.is_active
                        ? "text-green-600"
                        : "text-muted"
                        }`}
                    >
                      {church.is_active ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(church)}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/10"
                  >
                    <Pencil size={15} />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleToggleStatus(church)}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/10"
                  >
                    <Power size={15} />
                    {church.is_active ? "Desativar" : "Ativar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de cadastro e edição */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 text-foreground shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingChurch ? "Editar igreja" : "Nova igreja"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-muted hover:bg-muted/10"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="church-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Nome da igreja
                </label>

                <input
                  id="church-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex.: Igreja Central"
                  maxLength={200}
                  required
                  autoFocus
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
                />
              </div>

              {formError && (
                <p className="text-sm text-red-500">{formError}</p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
