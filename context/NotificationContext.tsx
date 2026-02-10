import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { BACKEND_BASE_URL } from "../constants/Config";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "announcement" | "grocery" | "system";
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  refreshNotifications: (silent?: boolean) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  isLoading: true,
  refreshNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
});

export const useNotification = () => useContext(NotificationContext);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { socket } = useSocket();

  const getToken = async () => {
    if (Platform.OS === "web") {
      return localStorage.getItem("accessToken");
    }
    return await SecureStore.getItemAsync("accessToken");
  };

  const refreshNotifications = async (silent = false) => {
    // Check token availability first
    const token = await getToken();
    if (!token) {
       // Only clear if logged out
       setNotifications([]);
       setUnreadCount(0);
       setIsLoading(false);
       return;
    }

    if (!user && !token) return; 

    // Only set loading if we don't have data yet to avoid flash
    if (!silent && notifications.length === 0) setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/notifications`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const json = await response.json();
      const items = (json.data || []) as any[];
      const mappedItems = items.map((item) => ({
        id: item._id || item.id,
        title: item.title,
        message: item.message,
        type: item.type,
        relatedId: item.relatedId,
        isRead: item.isRead,
        createdAt: item.createdAt,
        metadata: item.metadata,
      }));

      setNotifications(mappedItems);
      setUnreadCount(mappedItems.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Failed to refresh notifications:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = await getToken();
      await fetch(`${BACKEND_BASE_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await getToken();
      await fetch(`${BACKEND_BASE_URL}/notifications/mark-all-read`, {
        method: "PATCH",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = await getToken();
      await fetch(`${BACKEND_BASE_URL}/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      setNotifications((prev) => {
        const newNotifications = prev.filter((n) => n.id !== id);
        setUnreadCount(newNotifications.filter((n) => !n.isRead).length);
        return newNotifications;
      });
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  useEffect(() => {
    refreshNotifications();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (payload: { action: string; data: any }) => {
      console.log("Notification update received:", payload);
      const { action, data } = payload;

      if (action === "create") {
        const newItem: NotificationItem = {
          id: data._id || data.id,
          title: data.title,
          message: data.message,
          type: data.type,
          relatedId: data.relatedId,
          isRead: data.isRead,
          createdAt: data.createdAt,
          metadata: data.metadata,
        };
        setNotifications((prev) => [newItem, ...prev]);
        if (!newItem.isRead) {
          setUnreadCount((prev) => prev + 1);
        }
      } else if (action === "update") {
        // For updates like mark as read, it's safer to refresh or carefully update state
        // Here we just refresh to be safe and consistent
        refreshNotifications();
      } else if (action === "delete") {
        refreshNotifications();
      }
    };

    socket.on("notification-update", handleUpdate);

    return () => {
      socket.off("notification-update", handleUpdate);
    };
  }, [socket, user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
