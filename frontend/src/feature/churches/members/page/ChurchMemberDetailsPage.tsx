
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Church,
  CalendarDays,
  ShieldCheck,
  UserX,
  UserCheck,
  Save,
} from "lucide-react";

import {
  getChurchMember,
  updateChurchMembership,
} from "../service";

import type { ChurchMembership, ChurchRole } from "../types";

export const ChurchMemberDetailsPage = () => {
  const { churchId, memberId } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState<ChurchMembership | null>(null);
  const [selectedRole, setSelectedRole] = useState<ChurchRole>("member");
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedMemberId = Number(memberId);
  const parsedChurchId = Number(churchId);

  useEffect(() => {
    let active = true;

    const loadMember = async () => {
      if (
        !Number.isInteger(parsedMemberId) ||
        parsedMemberId <= 0 ||
        !Number.isInteger(parsedChurchId) ||
        parsedChurchId <= 0
      ) {
        setError("Identificadores inválidos.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getChurchMember(parsedMemberId);

        if (data.church !== parsedChurchId) {
          throw new Error("O membro não pertence a esta igreja.");
        }

        if (active) {
          setMember(data);
          setSelectedRole(data.role);
        }
      } catch (err) {
        console.error(err);

        if (active) {
          setError("Não foi possível carregar os dados do membro.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadMember();

    return () => {
      active = false;
    };
  }, [parsedMemberId, parsedChurchId]);

  const handleStatusChange = async () => {
    if (!member) return;

    const action = member.is_active ? "desativar" : "reativar";

    const confirmed = window.confirm(
      `Deseja realmente ${action} o vínculo de ${member.user_email} com esta igreja?`,
    );

    if (!confirmed) return;

    try {
      setSavingStatus(true);
      setError(null);

      const updatedMember = await updateChurchMembership(member.id, {
        is_active: !member.is_active,
      });

      setMember(updatedMember);
    } catch (err) {
      console.error(err);
      setError(`Não foi possível ${action} o membro.`);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleRoleChange = async () => {
    if (!member || selectedRole === member.role) return;

    const newRoleLabel =
      selectedRole === "admin"
        ? "Administrador da Igreja"
        : "Membro";

    const confirmed = window.confirm(
      `Deseja alterar a função de ${member.user_email} para ${newRoleLabel}?`,
    );

    if (!confirmed) {
      setSelectedRole(member.role);
      return;
    }

    try {
      setSavingRole(true);
      setError(null);

      const updatedMember = await updateChurchMembership(member.id, {
        role: selectedRole,
      });

      setMember(updatedMember);
      setSelectedRole(updatedMember.role);
    } catch (err) {
      console.error(err);
      setSelectedRole(member.role);
      setError("Não foi possível alterar a função do membro.");
    } finally {
      setSavingRole(false);
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted">
        Carregando informações do membro...
      </div>
    );
  }

  if (error && !member) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-red-500">{error}</p>

        <button
          type="button"
          onClick={() => navigate(`/igrejas/${churchId}/membros`)}
          className="mt-4 rounded-lg border border-border px-4 py-2"
        >
          Voltar para membros
        </button>
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(`/igrejas/${churchId}/membros`)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={18} />
        Voltar para membros
      </button>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound size={30} />
            </div>

            <div className="flex-1">
              <h1 className="text-xl font-semibold">
                {member.user_email}
              </h1>

              <p className="mt-1 text-sm text-muted">
                Informações do vínculo com a igreja
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                member.is_active
                  ? "bg-green-500/10 text-green-600"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {member.is_active ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Mail size={19} className="mt-1 text-muted" />
            <div>
              <p className="text-xs text-muted">E-mail</p>
              <p className="mt-1 font-medium">{member.user_email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Church size={19} className="mt-1 text-muted" />
            <div>
              <p className="text-xs text-muted">Igreja</p>
              <p className="mt-1 font-medium">{member.church_name}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck size={19} className="mt-1 text-muted" />
            <div>
              <p className="text-xs text-muted">Função na igreja</p>
              <p className="mt-1 font-medium">
                {member.role === "admin"
                  ? "Administrador da Igreja"
                  : "Membro"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CalendarDays size={19} className="mt-1 text-muted" />
            <div>
              <p className="text-xs text-muted">Data de vínculo</p>
              <p className="mt-1 font-medium">
                {formatDate(member.joined_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">Função na Igreja</h2>

        <p className="mt-1 text-sm text-muted">
          Defina o nível de responsabilidade deste membro dentro da igreja.
          Essa alteração não modifica suas funções nos ministérios.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="member-role"
              className="mb-2 block text-sm font-medium"
            >
              Selecionar função
            </label>

            <select
              id="member-role"
              value={selectedRole}
              onChange={(event) =>
                setSelectedRole(event.target.value as ChurchRole)
              }
              disabled={savingRole || savingStatus}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="member">Membro</option>
              <option value="admin">Administrador da Igreja</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleRoleChange}
            disabled={
              savingRole ||
              savingStatus ||
              selectedRole === member.role
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={17} />
            {savingRole ? "Salvando..." : "Salvar função"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">Gerenciar vínculo</h2>

        <p className="mt-1 text-sm text-muted">
          {member.is_active
            ? "Desativar interrompe a participação do membro nesta igreja, preservando seu histórico."
            : "Reativar restabelece o vínculo do membro com esta igreja."}
        </p>

        <button
          type="button"
          onClick={handleStatusChange}
          disabled={savingStatus || savingRole}
          className={`mt-5 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            member.is_active
              ? "border-red-500/30 text-red-500 hover:bg-red-500/10"
              : "border-green-500/30 text-green-600 hover:bg-green-500/10"
          }`}
        >
          {member.is_active ? (
            <UserX size={17} />
          ) : (
            <UserCheck size={17} />
          )}

          {savingStatus
            ? "Atualizando..."
            : member.is_active
              ? "Desativar vínculo"
              : "Reativar vínculo"}
        </button>
      </div>
    </div>
  );
};
