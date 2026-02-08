import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useGrocery } from "../../context/GroceryContext";

export default function Dashboard() {
  const { user } = useAuth();
  const { getTodayTotal, getMonthTotal, groceries } = useGrocery();
  const router = useRouter();

  const recentGroups = useMemo(() => {
    const sorted = [...groceries].sort((a, b) => {
      const aTime = new Date(a.createdAt || a.date).getTime();
      const bTime = new Date(b.createdAt || b.date).getTime();
      return bTime - aTime;
    });
    const grouped = new Map<string, typeof sorted>();
    sorted.forEach((item) => {
      const key = item.addedByName || "Unknown";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(item);
    });
    return Array.from(grouped.entries()).map(([name, items], index) => ({
      name,
      items,
      colorIndex: index,
    }));
  }, [groceries]);

  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>(
    {},
  );
  const [hasSetDefault, setHasSetDefault] = useState(false);

  useEffect(() => {
    if (!hasSetDefault && recentGroups.length > 0) {
      setExpandedUsers({ [recentGroups[0].name]: true });
      setHasSetDefault(true);
    }
  }, [recentGroups, hasSetDefault]);

  const colorPalette = [
    { bg: "bg-green-100", text: "text-green-700" },
    { bg: "bg-blue-100", text: "text-blue-700" },
    { bg: "bg-orange-100", text: "text-orange-700" },
    { bg: "bg-purple-100", text: "text-purple-700" },
    { bg: "bg-pink-100", text: "text-pink-700" },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Green Hero Section - Top 30% */}
      <View className="bg-[#00B761] h-[30%] px-6 pt-12 rounded-b-[40px] absolute top-0 left-0 right-0 z-0">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-green-100 font-medium text-sm">
              Good Morning,
            </Text>
            <Text className="text-white text-2xl font-bold">
              {user?.displayName || "User"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => alert("Notifications coming soon!")}
            className="bg-white/20 p-2 rounded-full"
          >
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="pt-[20%] px-6 z-10">
        {/* Main Spending Card - Floating */}
        <View className="bg-white p-6 rounded-3xl shadow-lg shadow-green-900/10 mb-8 mt-6">
          <Text className="text-gray-400 text-sm font-medium mb-1 text-center">
            Total Spent This Month
          </Text>
          <Text className="text-4xl font-bold text-gray-900 text-center mb-4">
            ৳{getMonthTotal().toLocaleString()}
          </Text>

          <View className="flex-row justify-between border-t border-gray-100 pt-4">
            <View className="items-center flex-1 border-r border-gray-100">
              <View className="flex-row items-center mb-1">
                <Ionicons name="arrow-down-circle" size={16} color="#00B761" />
                <Text className="text-xs text-gray-400 ml-1">Today</Text>
              </View>
              <Text className="text-lg font-bold text-gray-900">
                ৳{getTodayTotal()}
              </Text>
            </View>
            <View className="items-center flex-1">
              <View className="flex-row items-center mb-1">
                <Ionicons name="alert-circle" size={16} color="#F59E0B" />
                <Text className="text-xs text-gray-400 ml-1">Limit</Text>
              </View>
              <Text className="text-lg font-bold text-gray-900">No Limit</Text>
            </View>
          </View>
        </View>

        {/* Quick Add Button & Actions */}
        <View className="flex-row justify-between gap-4 mb-8">
          <TouchableOpacity
            className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 items-center flex-row justify-center"
            onPress={() => router.push("/add-grocery")}
            activeOpacity={0.7}
          >
            <View className="bg-green-100 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Ionicons name="add" size={24} color="#00B761" />
            </View>
            <Text className="font-bold text-gray-800">Add Item</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 items-center flex-row justify-center"
            onPress={() => router.push("/(tabs)/list")}
            activeOpacity={0.7}
          >
            <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Ionicons name="list" size={20} color="#3B82F6" />
            </View>
            <Text className="font-bold text-gray-800">View All</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity / Visual Placeholder */}
        <Text className="text-lg font-bold text-gray-800 mb-4 px-1">
          Recent Activity
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-24"
        showsVerticalScrollIndicator={false}
      >
        <View className="space-y-3">
          {recentGroups.length === 0 ? (
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <Text className="text-gray-400 text-center py-4">
                No recent items yet
              </Text>
            </View>
          ) : (
            recentGroups.map((group) => {
              const palette =
                colorPalette[group.colorIndex % colorPalette.length];
              const isExpanded = !!expandedUsers[group.name];
              return (
                <View
                  key={group.name}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-1"
                >
                  <TouchableOpacity
                    onPress={() =>
                      setExpandedUsers((prev) => ({
                        ...prev,
                        [group.name]: !prev[group.name],
                      }))
                    }
                    className="flex-row items-center justify-between"
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center">
                      <View className={`px-2 py-1 rounded-full ${palette.bg}`}>
                        <Text className={`text-xs font-bold ${palette.text}`}>
                          {group.name}
                        </Text>
                      </View>
                      <Text className="ml-2 text-xs text-gray-400">
                        {group.items.length} items
                      </Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#6B7280"
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View className="mt-3 space-y-2">
                      {group.items.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() =>
                            router.push({
                              pathname: "/modal",
                              params: { id: item.id },
                            })
                          }
                          activeOpacity={0.7}
                          className="flex-row items-center  justify-between border-b border-gray-200 rounded-xl px-3 py-2 mb-1"
                        >
                          <View className="flex-1 mr-3">
                            <Text className="text-[10px] text-gray-400">
                              {item.date}
                            </Text>
                            <View className="flex-row items-center flex-wrap">
                              <Text className="text-gray-900 font-semibold">
                                {item.itemName}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-[#00B761] font-bold">
                            ৳{item.price * item.quantity}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
