import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGrocery } from "../../context/GroceryContext";

export default function ReportsScreen() {
  const { groceries } = useGrocery();

  const reportData = useMemo(() => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

    const monthlyGroceries = groceries.filter((item) =>
      item.date.startsWith(currentMonth),
    );
    const totalMonth = monthlyGroceries.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const userTotals: Record<string, number> = {};
    monthlyGroceries.forEach((item) => {
      const userKey = item.addedByName || "Unknown";
      userTotals[userKey] =
        (userTotals[userKey] || 0) + item.price * item.quantity;
    });

    return { totalMonth, userTotals };
  }, [groceries]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <View className="px-6 py-4 bg-white border-b border-gray-100 mb-4">
        <Text className="text-2xl font-bold text-gray-900">Monthly Report</Text>
      </View>

      <ScrollView contentContainerClassName="px-6 pb-24">
        {/* Total Card */}
        <View className="bg-[#00B761] p-6 rounded-3xl shadow-lg shadow-green-500/20 mb-8 overflow-hidden relative">
          <View className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
          <Text className="text-green-50 text-base font-medium mb-1">
            Total Spends
          </Text>
          <Text className="text-white text-4xl font-bold tracking-tight">
            ৳{reportData.totalMonth.toLocaleString()}
          </Text>
          <View className="mt-4 flex-row items-center">
            <View className="bg-white/20 px-3 py-1 rounded-lg">
              <Text className="text-white text-xs font-bold">
                +0% from last month
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-lg font-bold text-gray-800 mb-4 px-1">
          Breakdown by User
        </Text>

        <View className="space-y-3">
          {Object.entries(reportData.userTotals).map(([user, total], index) => (
            <View
              key={user}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex-row justify-between items-center  mb-2"
            >
              <View className="flex-row items-center">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${index % 2 === 0 ? "bg-orange-100" : "bg-blue-100"}`}
                >
                  <Text
                    className={`font-bold text-lg ${index % 2 === 0 ? "text-orange-500" : "text-blue-500"}`}
                  >
                    {user.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text className="text-gray-900 font-bold text-base">
                    {user}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    {((total / reportData.totalMonth) * 100).toFixed(1)}%
                  </Text>
                </View>
              </View>

              <Text className="text-lg font-bold text-gray-900">
                ৳{total.toLocaleString()}
              </Text>
            </View>
          ))}
          {Object.keys(reportData.userTotals).length === 0 && (
            <View className="items-center justify-center py-10 opacity-50">
              <Text className="text-gray-500">
                No expenses recorded this month.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
