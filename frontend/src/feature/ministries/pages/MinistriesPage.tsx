
import { useState } from "react";
import {
  Building2,
  Users,
  LoaderCircle,
  AlertCircle,
  Plus,
  Pencil,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useMinistries } from "../hooks/useMinistries";
import { useChurchContext } from "../../../app/providers/ChurchProvider";
import { MinistryFormModal } from "../components/ministryFormModal";
import type { Ministry } from "../types";

export const MinistriesPage = () => {
  const { activeChurch } = useChurchContext();

  const {
    ministries,
    isLoading,
    isSaving,
    error,
    canManageMinistries,
    addMinistry,
    editMinistry,
  } = useMinistries();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingMinistry(null);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (ministry: Ministry) => {
    setEditingMinistry(ministry);
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;

    setModalOpen(false);
    setEditingMinistry(null);
    setFormError(null);
  };

  const handleSubmit = async (name: string) => {
    setFormError(null);

    const success = editingMinistry
      ? await editMinistry(editingMinistry.id, name)
      : await addMinistry(name);

    if (success) {
      setModalOpen(false);
      setEditingMinistry(null);
    } else {
      setFormError("Não foi possível salvar o ministério. Verifique os dados e tente novamente.");
    }
  };

  if (!activeChurch) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <Building2 size={36} className="mx-auto text-muted" />
        <h2 className="mt-3 text-lg font-semibold">
          Nenhuma igreja selecionada
        </h2>
        <p className="mt-2 text-sm text-muted">
          Selecione uma igreja para visualizar seus ministérios.
        </p>
      </div>
    );
  }

  if (!canManageMinistries) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <AlertCircle size={36} className="mx-auto text-muted" />
        <h2 className="mt-3 text-lg font-semibold">Acesso não disponível</h2>
        <p className="mt-2 text-sm text-muted">
          O catálogo de ministérios está disponível apenas para administradores
          da igreja.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Ministérios</h1>
          <p className="mt-2 text-sm text-muted">
            Gerencie os ministérios e suas equipes.
          </p>
          <p className="mt-1 text-sm font-medium text-primary">
            {activeChurch.name}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          <Plus size={18} />
          Novo ministério
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted">
          <LoaderCircle size={22} className="animate-spin" />
          <span>Carregando ministérios...</span>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : ministries.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-10 text-center">
          <Building2 size={38} className="mx-auto text-muted" />
          <h2 className="mt-3 text-lg font-semibold">
            Nenhum ministério cadastrado
          </h2>
          <p className="mt-2 text-sm text-muted">
            Cadastre o primeiro ministério desta igreja.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white"
          >
            Cadastrar ministério
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ministries.map((ministry) => (
            <div
              key={ministry.id}
              className="rounded-xl border border-border bg-surface p-5 transition hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Users size={22} />
                  </div>

                  <div>
                    <h2 className="font-semibold">{ministry.name}</h2>
                    <p className="text-xs text-muted">
                      {ministry.church_name}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    ministry.is_active
                      ? "bg-green-500/10 text-green-600"
                      : "bg-gray-500/10 text-gray-500"
                  }`}
                >
                  {ministry.is_active ? "Ativo" : "Inativo"}
                </span>
              </div>

              <div className="mt-5 flex gap-2 border-t border-border pt-4">
                <Link
                  to={`/ministerios/${ministry.id}/membros`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                >
                  <Users size={17} />
                  Gerenciar equipe
                </Link>

                <button
                  type="button"
                  onClick={() => openEditModal(ministry)}
                  className="rounded-xl border border-border p-2.5 text-muted transition hover:bg-sidebar hover:text-foreground"
                  title="Editar ministério"
                  aria-label={`Editar ${ministry.name}`}
                >
                  <Pencil size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MinistryFormModal
        open={modalOpen}
        ministry={editingMinistry}
        saving={isSaving}
        formError={formError}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
