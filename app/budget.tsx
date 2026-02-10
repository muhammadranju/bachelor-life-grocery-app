import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAlert } from "../context/AlertContext";
import { useBudget } from "../context/BudgetContext";
import { AnalyticsData, useGrocery } from "../context/GroceryContext";

export default function BudgetScreen() {
  const router = useRouter();
  const { budgetStatus, isLoading, setLimit, refreshBudget } = useBudget();
  const { getAnalytics } = useGrocery();
  const { showAlert } = useAlert();
  const [newLimit, setNewLimit] = useState("");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );

  const loadAnalytics = async () => {
    const data = await getAnalytics();
    setAnalyticsData(data);
  };

  useFocusEffect(
    useCallback(() => {
      refreshBudget(true);
      loadAnalytics();
    }, []),
  );

  const handleSetLimit = async () => {
    if (!newLimit || isNaN(Number(newLimit))) {
      showAlert("Invalid Input", "Please enter a valid amount", [], "error");
      return;
    }

    try {
      await setLimit(Number(newLimit));
      setNewLimit("");
      Keyboard.dismiss();
      showAlert("Success", "Monthly budget limit updated", [], "success");
    } catch (error: any) {
      showAlert("Error", "Failed to update limit", [], "error");
    }
  };

  const percentage =
    budgetStatus.limit > 0
      ? Math.min((budgetStatus.spent / budgetStatus.limit) * 100, 100)
      : 0;

  const now = new Date();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  const remainingDays = Math.max(1, daysInMonth - now.getDate() + 1);
  const dailyBudget =
    budgetStatus.remaining > 0 ? budgetStatus.remaining / remainingDays : 0;

  const getRandomColor = (index: number) => {
    const colors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
    ];
    return colors[index % colors.length];
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" backgroundColor="#ffffff" />

      {/* Custom Header */}
      <View className="px-6 py-4 flex-row items-center bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 p-2 bg-gray-50 rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Monthly Budget</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#00B761" className="mt-10" />
        ) : (
          <View className="space-y-6">
            {/* Status Card */}
            <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <Text className="text-gray-500 font-medium mb-2">
                Remaining Budget
              </Text>
              <Text className="text-4xl font-bold text-gray-900 mb-6">
                ৳{budgetStatus.remaining.toLocaleString()}
              </Text>

              <View className="space-y-4">
                <View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-600">Spent</Text>
                    <Text className="text-gray-900 font-bold">
                      ৳{budgetStatus.spent.toLocaleString()}
                    </Text>
                  </View>
                  <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <View
                      className={`h-full rounded-full ${
                        percentage > 90 ? "bg-red-500" : "bg-[#00B761]"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </View>
                </View>

                <View className="flex-row justify-between pt-4 border-t border-gray-50">
                  <Text className="text-gray-600">Daily Safe Spend</Text>
                  <Text className="text-[#00B761] font-bold">
                    ৳
                    {dailyBudget.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </Text>
                </View>

                <View className="flex-row justify-between pt-4 border-t border-gray-50">
                  <Text className="text-gray-600">Monthly Limit</Text>
                  <Text className="text-gray-900 font-bold">
                    ৳{budgetStatus.limit.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Set Limit Form */}
            <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                Set New Limit
              </Text>
              <View className="space-y-4">
                <View>
                  <Text className="text-gray-700 font-medium mb-2">
                    Amount (৳)
                  </Text>
                  <TextInput
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-lg"
                    placeholder="e.g.  ৳5000"
                    keyboardType="numeric"
                    value={newLimit}
                    onChangeText={setNewLimit}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSetLimit}
                  className="bg-[#00B761] w-full py-4 rounded-xl items-center active:opacity-90"
                >
                  <Text className="text-white font-bold text-lg">
                    Update Limit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Analytics Charts */}
            {analyticsData &&
              analyticsData.monthlyStats &&
              analyticsData.monthlyStats.length > 0 && (
                <View className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                  <Text className="text-lg font-bold text-gray-900 mb-4">
                    Monthly Items Trend
                  </Text>
                  <LineChart
                    data={{
                      labels: analyticsData.monthlyStats.map(
                        (s) => `${s._id.month}/${s._id.year}`,
                      ),
                      datasets: [
                        {
                          data: analyticsData.monthlyStats.map((s) => s.count),
                        },
                      ],
                    }}
                    width={Dimensions.get("window").width - 80} // Adjusted width
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                      backgroundColor: "#ffffff",
                      backgroundGradientFrom: "#ffffff",
                      backgroundGradientTo: "#ffffff",
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(0, 183, 97, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                      propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: "#00B761",
                      },
                    }}
                    bezier
                    style={{
                      marginVertical: 8,
                      borderRadius: 16,
                    }}
                  />
                </View>
              )}

            {analyticsData &&
              analyticsData.userStats &&
              analyticsData.userStats.length > 0 && (
                <View className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-8">
                  <Text className="text-lg font-bold text-gray-900 mb-4">
                    User Spending Breakdown
                  </Text>
                  <PieChart
                    data={analyticsData.userStats.map((s, i) => ({
                      name: s._id,
                      population: s.totalSpent,
                      color: getRandomColor(i),
                      legendFontColor: "#7F7F7F",
                      legendFontSize: 12,
                    }))}
                    width={Dimensions.get("window").width - 80}
                    height={220}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                    absolute
                  />
                </View>
              )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
