
import { useCallback, useEffect, useState } from "react";
import {
  getMinistryFunctions,
  createMinistryFunction,
  updateMinistryFunction,
} from "../service";
import type {
  MinistryFunction,
  MinistryFunctionPayload,
  MinistryFunctionUpdatePayload,
} from "../types";

export const useMinistryFunctions = (ministryId: number) => {
  const [activeFunctions, setActiveFunctions] = useState<MinistryFunction[]>([]);
  const [inactiveFunctions, setInactiveFunctions] = useState<MinistryFunction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFunctions = useCallback(async () => {
    if (!ministryId) {
      setActiveFunctions([]);
      setInactiveFunctions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [activeResponse, inactiveResponse] = await Promise.all([
        getMinistryFunctions(ministryId, "active"),
        getMinistryFunctions(ministryId, "inactive"),
      ]);

      setActiveFunctions(activeResponse.results);
      setInactiveFunctions(inactiveResponse.results);
    } catch (error) {
      console.error("Erro ao buscar funções do ministério:", error);
      setError("Não foi possível carregar as funções do ministério.");
    } finally {
      setIsLoading(false);
    }
  }, [ministryId]);

  const addFunction = async (data: MinistryFunctionPayload) => {
    setIsSaving(true);
    setError(null);

    try {
      await createMinistryFunction(data);
      await fetchFunctions();
      return true;
    } catch (error) {
      console.error("Erro ao cadastrar função:", error);
      setError("Não foi possível cadastrar a função.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const editFunction = async (
    id: number,
    data: MinistryFunctionUpdatePayload
  ) => {
    setIsSaving(true);
    setError(null);

    try {
      await updateMinistryFunction(id, data);
      await fetchFunctions();
      return true;
    } catch (error) {
      console.error("Erro ao atualizar função:", error);
      setError("Não foi possível atualizar a função.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    void fetchFunctions();
  }, [fetchFunctions]);

  return {
    activeFunctions,
    inactiveFunctions,
    isLoading,
    isSaving,
    error,
    addFunction,
    editFunction,
    refreshFunctions: fetchFunctions,
  };
};
