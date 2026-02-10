import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNotification } from "../context/NotificationContext";

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    isLoading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotification();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (id: string, type: string) => {
    await markAsRead(id);
    if (type === "announcement") {
      router.push("/announcements");
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isAnnouncement = item.type === "announcement";
    const hasMetadata = item.metadata && item.metadata.productName;

    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item.id, item.type)}
        className={`bg-white p-4 rounded-xl mb-3 shadow-sm border ${
          item.isRead ? "border-gray-100" : "border-green-200 bg-green-50"
        }`}
        activeOpacity={0.7}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-row flex-1">
            <View
              className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                isAnnouncement ? "bg-orange-100" : "bg-blue-100"
              }`}
            >
              <Ionicons
                name={
                  isAnnouncement ? "megaphone-outline" : "notifications-outline"
                }
                size={20}
                color={isAnnouncement ? "#EA580C" : "#3B82F6"}
              />
            </View>
            <View className="flex-1">
              {isAnnouncement && hasMetadata ? (
                <View>
                  <View className="flex-row items-center mb-1">
                    <Text
                      className={`text-base font-bold mr-2 ${
                        item.isRead ? "text-gray-900" : "text-gray-900"
                      }`}
                    >
                      {item.metadata.productName}
                    </Text>
                    <View className="bg-orange-100 px-2 py-0.5 rounded">
                      <Text className="text-orange-700 text-[10px] font-bold">
                        {item.metadata.quantity} {item.metadata.quantityUnit}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-gray-500 text-xs mb-2">
                    Added by {item.metadata.addedByName}
                  </Text>
                </View>
              ) : (
                <View>
                  <Text
                    className={`text-sm font-bold mb-1 ${
                      item.isRead ? "text-gray-800" : "text-gray-900"
                    }`}
                  >
                    {item.title}
                  </Text>
                  <Text className="text-gray-600 text-xs mb-2 leading-5">
                    {item.message}
                  </Text>
                </View>
              )}
              <Text className="text-gray-400 text-[10px]">
                {format(new Date(item.createdAt), "MMM d, yyyy h:mm a")}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => deleteNotification(item.id)}
            className="p-2 -mr-2 -mt-2"
          >
            <Ionicons name="close" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Notifications</Text>
        </View>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text className="text-green-600 font-medium text-sm">Read All</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading && notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00B761" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-6 pb-24"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-10">
              <View className="bg-gray-100 w-16 h-16 rounded-full items-center justify-center mb-4">
                <Ionicons
                  name="notifications-off-outline"
                  size={32}
                  color="#9CA3AF"
                />
              </View>
              <Text className="text-gray-500 font-medium">
                No notifications yet
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00B761"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
