import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { BACKEND_BASE_URL } from "../constants/Config";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";

interface BudgetStatus {
  limit: number;
  spent: number;
  remaining: number;
}

interface BudgetContextType {
  budgetStatus: BudgetStatus;
  isLoading: boolean;
  refreshBudget: (silent?: boolean) => Promise<void>;
  setLimit: (amount: number) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType>({
  budgetStatus: { limit: 0, spent: 0, remaining: 0 },
  isLoading: true,
  refreshBudget: async () => {},
  setLimit: async () => {},
});

export const useBudget = () => useContext(BudgetContext);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus>({
    limit: 0,
    spent: 0,
    remaining: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { socket } = useSocket();

  const getToken = async () => {
    if (Platform.OS === "web") {
      return localStorage.getItem("accessToken");
    }
    return await SecureStore.getItemAsync("accessToken");
  };

  const refreshBudget = async (silent = false) => {
    // Check token instead of just user object to prevent premature clearing
    const token = await getToken();
    if (!token) {
      // Only clear if no token (logged out)
      // We keep existing data if just user context is updating
      return;
    }

    if (!user && !token) return; // Double check

    // Only set loading if we don't have data yet and it's not a silent refresh
    // We check if limit is 0 as a proxy for "no data loaded yet"
    if (!silent && budgetStatus.limit === 0 && budgetStatus.spent === 0) {
      // Optional: setIsLoading(true) if you want specific loading state
    }

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/budget`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (response.ok) {
        const json = await response.json();
        setBudgetStatus(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch budget:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLimit = async (amount: number) => {
    try {
      const token = await getToken();
      const response = await fetch(`${BACKEND_BASE_URL}/budget`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) {
        throw new Error("Failed to set limit");
      }
      await refreshBudget();
    } catch (error) {
      console.error("Failed to set limit:", error);
      throw error;
    }
  };

  useEffect(() => {
    refreshBudget();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      console.log("Budget update triggered via socket");
      refreshBudget();
    };

    // Listen for both budget changes (limit updates) and grocery changes (spent updates)
    socket.on("budget-update", handleUpdate);
    socket.on("grocery-update", handleUpdate);

    return () => {
      socket.off("budget-update", handleUpdate);
      socket.off("grocery-update", handleUpdate);
    };
  }, [socket, user]);

  return (
    <BudgetContext.Provider
      value={{
        budgetStatus,
        isLoading,
        refreshBudget,
        setLimit,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}
