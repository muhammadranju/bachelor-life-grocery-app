import { createContext, useContext, useEffect, useState } from "react";

import { BACKEND_BASE_URL } from "../constants/Config";
import { useAuth } from "./AuthContext";

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

interface GroceryContextType {
  groceries: GroceryItem[];
  isLoading: boolean;
  addGrocery: (item: Omit<GroceryItem, "id" | "createdAt">) => Promise<void>;
  deleteGrocery: (id: string) => Promise<void>;
  updateGrocery: (id: string, data: Partial<GroceryItem>) => Promise<void>;
  getTodayTotal: () => number;
  getMonthTotal: () => number;
}

const GroceryContext = createContext<GroceryContextType>({
  groceries: [],
  isLoading: true,
  addGrocery: async () => {},
  deleteGrocery: async () => {},
  updateGrocery: async () => {},
  getTodayTotal: () => 0,
  getMonthTotal: () => 0,
});

export const useGrocery = () => useContext(GroceryContext);

export function GroceryProvider({ children }: { children: React.ReactNode }) {
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth(); // Could be used to filter or tag

  const addGrocery = async (item: Omit<GroceryItem, "id" | "createdAt">) => {
    const response = await fetch(`${BACKEND_BASE_URL}/grocery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    await fetch(`${BACKEND_BASE_URL}/grocery/${id}`, {
      method: "DELETE",
    });
    setGroceries((prev) => prev.filter((item) => item.id !== id));
  };

  const updateGrocery = async (id: string, data: Partial<GroceryItem>) => {
    const response = await fetch(`${BACKEND_BASE_URL}/grocery/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
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

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setGroceries([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/grocery`);
        const json = await response.json();
        const items = (json.data || []) as GroceryItem[];
        setGroceries(items);
      } catch (error) {
        setGroceries([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user]);

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

  return (
    <GroceryContext.Provider
      value={{
        groceries,
        isLoading,
        addGrocery,
        deleteGrocery,
        updateGrocery,
        getTodayTotal,
        getMonthTotal,
      }}
    >
      {children}
    </GroceryContext.Provider>
  );
}
