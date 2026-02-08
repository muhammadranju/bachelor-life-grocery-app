import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useGrocery } from "../context/GroceryContext";

export default function ReportsScreen() {
  const router = useRouter();
  const { groceries } = useGrocery();

  const reportData = useMemo(() => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

    // Filter for current month
    const monthlyGroceries = groceries.filter((item) =>
      item.date.startsWith(currentMonth),
    );
    const totalMonth = monthlyGroceries.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Group by user
    const userTotals: Record<string, number> = {};
    monthlyGroceries.forEach((item) => {
      const userKey = item.addedByName || "Unknown";
      userTotals[userKey] =
        (userTotals[userKey] || 0) + item.price * item.quantity;
    });

    return { totalMonth, userTotals };
  }, [groceries]);

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <ScrollView contentContainerClassName="p-6">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-surface-light dark:bg-surface-dark rounded-full items-center justify-center shadow-sm border border-gray-100 dark:border-gray-800 mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-text-primary dark:text-gray-100">
            Monthly Report
          </Text>
        </View>

        {/* Main Total Card */}
        <View className="bg-primary p-6 rounded-3xl shadow-xl shadow-primary/30 mb-8 relative overflow-hidden">
          {/* Decorative Circle */}
          <View className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full" />

          <Text className="text-white/80 text-lg font-medium mb-1">
            Total Expenses (This Month)
          </Text>
          <Text className="text-white text-5xl font-bold tracking-tight">
            ৳{reportData.totalMonth.toLocaleString()}
          </Text>
          <View className="flex-row items-center mt-4 bg-white/20 self-start px-3 py-1 rounded-full">
            <Ionicons
              name="trending-up"
              size={16}
              color="white"
              style={{ marginRight: 4 }}
            />
            <Text className="text-white text-xs font-semibold">
              Spending limit: N/A
            </Text>
          </View>
        </View>

        <Text className="text-xs font-bold text-text-primary dark:text-gray-100 mb-4 px-1 uppercase tracking-wide opacity-80">
          Contribution by User
        </Text>

        <View className="space-y-3">
          {Object.entries(reportData.userTotals).map(([user, total]) => (
            <View
              key={user}
              className="bg-surface-light dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex-row justify-between items-center"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-secondary rounded-full items-center justify-center mr-4">
                  <Text className="text-primary font-bold text-lg">
                    {user.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text className="text-text-primary dark:text-gray-100 font-bold text-base">
                    {user}
                  </Text>
                  <Text className="text-text-secondary dark:text-gray-400 text-xs">
                    {((total / reportData.totalMonth) * 100).toFixed(1)}% of
                    total
                  </Text>
                </View>
              </View>

              <Text className="text-xl font-bold text-text-primary dark:text-gray-100">
                ৳{total.toLocaleString()}
              </Text>
            </View>
          ))}
          {Object.keys(reportData.userTotals).length === 0 && (
            <View className="items-center justify-center py-10 opacity-50">
              <Ionicons name="bar-chart-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-center mt-4">
                No data for this month.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
