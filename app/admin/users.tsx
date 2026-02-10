import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BACKEND_BASE_URL } from "../../constants/Config";
import { useAlert } from "../../context/AlertContext";
import { useAuth } from "../../context/AuthContext";

export default function UserListScreen() {
  const router = useRouter();
  const { role, user: currentUser } = useAuth();
  const { showAlert } = useAlert();
  const [users, setUsers] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const isAdmin =
    role === "admin" ||
    role === "ADMIN" ||
    role === "SUPER_ADMIN" ||
    role === "super_admin";

  useFocusEffect(
    useCallback(() => {
      if (!isAdmin) {
        showAlert(
          "Access Denied",
          "Only admins can view this page",
          [],
          "error",
        );
        router.back();
        return;
      }
      fetchUsers();
    }, [role, isAdmin]),
  );

  const fetchUsers = async () => {
    setRefreshing(true);
    try {
      let token = null;
      if (Platform.OS === "web") {
        token = localStorage.getItem("accessToken");
      } else {
        token = await SecureStore.getItemAsync("accessToken");
      }

      const response = await fetch(`${BACKEND_BASE_URL}/user`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const json = await response.json();
      const userList = (json.data || []) as any[];
      setUsers(userList);
    } catch (error: any) {
      console.error("Fetch Users Error:", error);
      showAlert(
        "Error",
        "Failed to fetch users: " + error.message,
        [],
        "error",
      );
      setUsers([]);
    }
    setRefreshing(false);
  };

  const handleDeleteUser = async (userId: string) => {
    showAlert(
      "Warning",
      "Are you sure you want to delete this user?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            let token = null;
            if (Platform.OS === "web") {
              token = localStorage.getItem("accessToken");
            } else {
              token = await SecureStore.getItemAsync("accessToken");
            }

            await fetch(`${BACKEND_BASE_URL}/user/${userId}`, {
              method: "DELETE",
              headers: {
                Authorization: token ? `Bearer ${token}` : "",
              },
            });
            fetchUsers();
          },
        },
      ],
      "warning",
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const itemRole = String(item.role || "").toLowerCase();
    const itemIsAdmin = itemRole === "admin" || itemRole === "super_admin";

    return (
      <View className="bg-white p-5 mb-4 rounded-3xl shadow-sm border border-gray-100 flex-row justify-between items-center">
        <View className="flex-row items-center flex-1 mr-4">
          <View
            className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
              itemIsAdmin ? "bg-green-100" : "bg-blue-100"
            }`}
          >
            <Ionicons
              name={itemIsAdmin ? "shield-checkmark" : "person"}
              size={20}
              color={itemIsAdmin ? "#00B761" : "#2563EB"}
            />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900 mb-0.5">
              {item.name || "No Name"}
            </Text>
            <Text className="text-gray-500 text-xs mb-1">{item.email}</Text>
            <View
              className={`self-start px-2 py-0.5 rounded-md ${
                itemIsAdmin ? "bg-green-100" : "bg-blue-100"
              }`}
            >
              <Text
                className={`text-xs font-semibold capitalize ${
                  itemIsAdmin ? "text-green-700" : "text-blue-700"
                }`}
              >
                {item.role}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => handleDeleteUser(item.id)}
          className="p-3 bg-red-50 rounded-full"
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" backgroundColor="#f9fafb" />
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100"
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text className="ml-4 text-xl font-bold text-gray-900">
          Manage Users
        </Text>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerClassName="p-6 pt-2 pb-24"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchUsers}
            tintColor="#00B761"
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center mt-20 opacity-50">
            <Ionicons name="people-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 text-center mt-4">
              No users found.
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-[#00B761] w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-green-500/30"
        onPress={() => router.push("/admin/add-user")}
        activeOpacity={0.9}
      >
        <Ionicons name="person-add" size={26} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
