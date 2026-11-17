import { useCallback, useEffect, useState } from "react";

type FetchListResult<T> = T[] | {
  results: T[];
};

interface UseFetchListResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useFetchList = <T,>(
  fetchFn: () => Promise<FetchListResult<T>>,
): UseFetchListResult<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(0);

  const refetch = useCallback(() => {
    setRequestKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchFn();

        if (!active) return;

        setData(Array.isArray(result) ? result : result.results);
      } catch (err) {
        console.error(err);

        if (active) {
          setError("Não foi possível carregar os dados.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      active = false;
    };
  }, [fetchFn, requestKey]);

  return { data, loading, error, refetch }
};