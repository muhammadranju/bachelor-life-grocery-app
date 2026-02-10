import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnalyticsData, useGrocery } from "../../context/GroceryContext";

export default function ReportsScreen() {
  const { groceries, refreshGroceries, getAnalytics } = useGrocery();
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );

  const loadAnalytics = async () => {
    const data = await getAnalytics();
    setAnalyticsData(data);
  };

  useFocusEffect(
    useCallback(() => {
      refreshGroceries(true);
      loadAnalytics();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshGroceries(), loadAnalytics()]);
    setRefreshing(false);
  }, []);

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
      <View className="px-6 py-4 bg-white border-b border-gray-100 mb-4">
        <Text className="text-2xl font-bold text-gray-900">Monthly Report</Text>
      </View>

      <ScrollView
        contentContainerClassName="px-6 pb-24"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00B761"
          />
        }
      >
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

        {/* Analytics Charts */}
        {analyticsData &&
          analyticsData.monthlyStats &&
          analyticsData.monthlyStats.length > 0 && (
            <View className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-8">
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
                width={Dimensions.get("window").width - 48} // Adjusted width for padding
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
                width={Dimensions.get("window").width - 48}
                height={220}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
              />
            </View>
          )}

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
