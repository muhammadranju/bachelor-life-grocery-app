import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { BACKEND_BASE_URL } from "../constants/Config";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";

export interface GroceryItem {
  id: string;
  itemName: string;
  price: number;
  quantity: number;
  quantityUnit: string;
  category: string;
  addedByName: string;
  pieces?: number;
  date: string;
  createdAt: any;
}

export interface MonthlyStat {
  _id: { month: number; year: number };
  count: number;
  totalSpent: number;
}

export interface UserStat {
  _id: string;
  count: number;
  totalSpent: number;
}

export interface AnalyticsData {
  monthlyStats: MonthlyStat[];
  userStats: UserStat[];
}

interface GroceryContextType {
  groceries: GroceryItem[];
  isLoading: boolean;
  addGrocery: (item: Omit<GroceryItem, "id" | "createdAt">) => Promise<void>;
  deleteGrocery: (id: string) => Promise<void>;
  updateGrocery: (id: string, data: Partial<GroceryItem>) => Promise<void>;
  refreshGroceries: (silent?: boolean) => Promise<void>;
  getTodayTotal: () => number;
  getMonthTotal: () => number;
  getAnalytics: () => Promise<AnalyticsData | null>;
}

const GroceryContext = createContext<GroceryContextType>({
  groceries: [],
  isLoading: true,
  addGrocery: async () => {},
  deleteGrocery: async () => {},
  updateGrocery: async () => {},
  refreshGroceries: async () => {},
  getTodayTotal: () => 0,
  getMonthTotal: () => 0,
  getAnalytics: async () => null,
});

export const useGrocery = () => useContext(GroceryContext);

export function GroceryProvider({ children }: { children: React.ReactNode }) {
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth(); // Could be used to filter or tag
  const { socket } = useSocket();

  const getToken = async () => {
    if (Platform.OS === "web") {
      return localStorage.getItem("accessToken");
    }
    return await SecureStore.getItemAsync("accessToken");
  };

  const addGrocery = async (item: Omit<GroceryItem, "id" | "createdAt">) => {
    const token = await getToken();
    const response = await fetch(`${BACKEND_BASE_URL}/grocery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(item),
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || "Failed to add grocery");
    }
    const created = json.data as GroceryItem;
    setGroceries((prev) => [created, ...prev]);
  };

  const deleteGrocery = async (id: string) => {
    const token = await getToken();
    await fetch(`${BACKEND_BASE_URL}/grocery/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    setGroceries((prev) => prev.filter((item) => item.id !== id));
  };

  const updateGrocery = async (id: string, data: Partial<GroceryItem>) => {
    const token = await getToken();
    const response = await fetch(`${BACKEND_BASE_URL}/grocery/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || "Failed to update grocery");
    }
    const updated = json.data as GroceryItem;
    setGroceries((prev) =>
      prev.map((item) => (item.id === id ? updated : item)),
    );
  };

  const refreshGroceries = async (silent = false) => {
    // If we have groceries and user is temporarily null/undefined, don't clear data immediately
    if (!user) {
      // Only clear if we really want to (like on logout), but here we might just return
      // if it's an auto-refresh.
      // However, if the user explicitly logged out, AuthContext should handle navigation.
      // If we are just refreshing, we should probably wait or return.
      
      // Better approach: If token is missing, then clear. User object might be lagging.
      const token = await getToken();
      if (!token) {
         setGroceries([]);
         setIsLoading(false);
         return;
      }
    }
    
    // Only set loading if we don't have data yet to avoid flash of empty content
    if (!silent && groceries.length === 0) setIsLoading(true);
    
    try {
      const token = await getToken();
      if (!token) return; // Should have been caught above, but safety check

      const response = await fetch(`${BACKEND_BASE_URL}/grocery`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch groceries");
      }
      const json = await response.json();
      const items = (json.data || []) as GroceryItem[];
      setGroceries(items);
    } catch (error) {
      console.error("Failed to refresh groceries:", error);
      // Optional: don't clear groceries on error so user still sees old data
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
     // Initial load
     if (user) {
        refreshGroceries();
     }
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      console.log("Grocery update received via socket");
      refreshGroceries(true);
    };

    socket.on("grocery-update", handleUpdate);

    return () => {
      socket.off("grocery-update", handleUpdate);
    };
  }, [socket, user]);

  const getTodayTotal = () => {
    const today = new Date().toISOString().split("T")[0];
    return groceries
      .filter((item) => item.date === today)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getMonthTotal = () => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    return groceries
      .filter((item) => item.date.startsWith(currentMonth))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getAnalytics = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${BACKEND_BASE_URL}/grocery/analytics`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const json = await response.json();
      if (response.ok) {
        return json.data as AnalyticsData;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      return null;
    }
  };

  return (
    <GroceryContext.Provider
      value={{
        groceries,
        isLoading,
        addGrocery,
        deleteGrocery,
        updateGrocery,
        refreshGroceries,
        getTodayTotal,
        getMonthTotal,
        getAnalytics,
      }}
    >
      {children}
    </GroceryContext.Provider>
  );
}
