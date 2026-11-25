
import { useCallback, useEffect, useState } from "react";

import { useChurchContext } from "../../../app/providers/ChurchProvider";
import {
  getMinistries,
  createMinistry,
  updateMinistry,
} from "../service";

import type { Ministry } from "../types";

export const useMinistries = () => {
  const { activeChurch } = useChurchContext();

  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManageMinistries =
    activeChurch?.role === "master" ||
    activeChurch?.role === "admin";

  const fetchMinistries = useCallback(async () => {
    if (!activeChurch || !canManageMinistries) {
      setMinistries([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getMinistries(activeChurch.id);
      setMinistries(response.results);
    } catch (error) {
      console.error("Erro ao carregar ministérios:", error);
      setError("Não foi possível carregar os ministérios.");
      setMinistries([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeChurch, canManageMinistries]);

  const addMinistry = async (name: string) => {
    if (!activeChurch) return false;

    setIsSaving(true);
    setError(null);

    try {
      await createMinistry({
        church: activeChurch.id,
        name,
      });

      await fetchMinistries();
      return true;
    } catch (error) {
      console.error("Erro ao cadastrar ministério:", error);
      setError("Não foi possível cadastrar o ministério.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const editMinistry = async (ministryId: number, name: string) => {
    setIsSaving(true);
    setError(null);

    try {
      await updateMinistry(ministryId, { name });
      await fetchMinistries();
      return true;
    } catch (error) {
      console.error("Erro ao editar ministério:", error);
      setError("Não foi possível editar o ministério.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    void fetchMinistries();
  }, [fetchMinistries]);

  return {
    ministries,
    isLoading,
    isSaving,
    error,
    canManageMinistries,
    addMinistry,
    editMinistry,
    refreshMinistries: fetchMinistries,
  };
};
