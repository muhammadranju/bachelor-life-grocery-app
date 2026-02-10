import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { BACKEND_BASE_URL } from "../constants/Config";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";

export interface NeedItem {
  id: string;
  productName: string;
  quantity: number;
  quantityUnit: string;
  addedByName: string;
  isBought: boolean;
  createdAt: any;
}

interface NeedContextType {
  needs: NeedItem[];
  isLoading: boolean;
  addNeed: (item: Omit<NeedItem, "id" | "createdAt" | "isBought">) => Promise<void>;
  deleteNeed: (id: string) => Promise<void>;
  updateNeed: (id: string, data: Partial<NeedItem>) => Promise<void>;
  refreshNeeds: (silent?: boolean) => Promise<void>;
}

const NeedContext = createContext<NeedContextType>({
  needs: [],
  isLoading: true,
  addNeed: async () => {},
  deleteNeed: async () => {},
  updateNeed: async () => {},
  refreshNeeds: async () => {},
});

export const useNeed = () => useContext(NeedContext);

export function NeedProvider({ children }: { children: React.ReactNode }) {
  const [needs, setNeeds] = useState<NeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { socket } = useSocket();

  const getToken = async () => {
    if (Platform.OS === "web") {
      return localStorage.getItem("accessToken");
    }
    return await SecureStore.getItemAsync("accessToken");
  };

  const addNeed = async (
    item: Omit<NeedItem, "id" | "createdAt" | "isBought">,
  ) => {
    const token = await getToken();
    const response = await fetch(`${BACKEND_BASE_URL}/needs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(item),
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || "Failed to add need item");
    }
    const created = json.data as NeedItem;
    setNeeds((prev) => [created, ...prev]);
  };

  const deleteNeed = async (id: string) => {
    const token = await getToken();
    await fetch(`${BACKEND_BASE_URL}/needs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    setNeeds((prev) => prev.filter((item) => item.id !== id));
  };

  const updateNeed = async (id: string, data: Partial<NeedItem>) => {
    const token = await getToken();
    const response = await fetch(`${BACKEND_BASE_URL}/needs/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || "Failed to update need item");
    }
    const updated = json.data as NeedItem;
    setNeeds((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  const refreshNeeds = async (silent = false) => {
    if (!user) {
      setNeeds([]);
      setIsLoading(false);
      return;
    }
    if (!silent) setIsLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`${BACKEND_BASE_URL}/needs`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch needs");
      }
      const json = await response.json();
      const items = (json.data || []) as NeedItem[];
      setNeeds(items);
    } catch (error) {
      console.error("Failed to refresh needs:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshNeeds();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      console.log("Need update received via socket");
      refreshNeeds(true);
    };

    socket.on("need-update", handleUpdate);

    return () => {
      socket.off("need-update", handleUpdate);
    };
  }, [socket, user]);

  return (
    <NeedContext.Provider
      value={{
        needs,
        isLoading,
        addNeed,
        deleteNeed,
        updateNeed,
        refreshNeeds,
      }}
    >
      {children}
    </NeedContext.Provider>
  );
}
