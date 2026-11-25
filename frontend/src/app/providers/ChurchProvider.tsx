
import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./AuthProvider";
import { getMyChurches } from "../../feature/auth/service";
import type { UserChurch } from "../../feature/auth/types";

interface ChurchContextData {
  churches: UserChurch[];
  activeChurch: UserChurch | null;
  isLoadingChurches: boolean;
  selectChurch: (churchId: number) => void;
  refreshChurches: () => Promise<void>;
}

const ChurchContext = createContext<ChurchContextData | undefined>(undefined);

export const ChurchProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuthContext();

  const [churches, setChurches] = useState<UserChurch[]>([]);
  const [activeChurch, setActiveChurch] = useState<UserChurch | null>(null);
  const [isLoadingChurches, setIsLoadingChurches] = useState(false);

  const refreshChurches = async () => {
    if (!isAuthenticated || !user) {
      setChurches([]);
      setActiveChurch(null);
      return;
    }

    setIsLoadingChurches(true);

    try {
      const data = await getMyChurches();
      setChurches(data);

      const storageKey = `revezo_active_church_${user.id}`;
      const savedChurchId = localStorage.getItem(storageKey);

      const savedChurch = data.find(
        (church) => church.id === Number(savedChurchId)
      );

      const selectedChurch = savedChurch ?? (data.length === 1 ? data[0] : null);

      setActiveChurch(selectedChurch);

      if (selectedChurch) {
        localStorage.setItem(storageKey, String(selectedChurch.id));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch {
      setChurches([]);
      setActiveChurch(null);
    } finally {
      setIsLoadingChurches(false);
    }
  };

  const selectChurch = (churchId: number) => {
    const selectedChurch = churches.find((church) => church.id === churchId);

    if (!selectedChurch || !user) return;

    setActiveChurch(selectedChurch);

    localStorage.setItem(
      `revezo_active_church_${user.id}`,
      String(selectedChurch.id)
    );
  };

  useEffect(() => {
    void refreshChurches();
  }, [isAuthenticated, user?.id]);

  return (
    <ChurchContext.Provider
      value={{
        churches,
        activeChurch,
        isLoadingChurches,
        selectChurch,
        refreshChurches,
      }}
    >
      {children}
    </ChurchContext.Provider>
  );
};

export const useChurchContext = () => {
  const context = useContext(ChurchContext);

  if (!context) {
    throw new Error(
      "useChurchContext deve ser utilizado dentro de ChurchProvider."
    );
  }

  return context;
};
