import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useGrocery } from "../context/GroceryContext";

export default function ModalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { groceries } = useGrocery();

  const item = groceries.find((g) => g.id === id);

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-gray-500 text-lg mb-4">Item not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gray-100 px-6 py-3 rounded-full"
        >
          <Text className="text-gray-900 font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" backgroundColor="white" />

      {/* Header */}
      <View className="bg-[#00B761] px-6 pt-6 pb-8 rounded-b-[32px] shadow-sm border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center bg-gray-100 rounded-full mt-10"
          >
            <Ionicons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-gray-50 text-lg font-bold">Item Details</Text>
          <View className="w-10" />
        </View>

        <View className="items-center">
          <View className="w-20 h-20 bg-green-50 rounded-full items-center justify-center mb-4 shadow-sm">
            <Ionicons name="cart" size={40} color="#00B761" />
          </View>
          <Text className="text-gray-50 text-3xl font-bold text-center mb-1">
            {item.itemName}
          </Text>
          <Text className="text-gray-50 text-lg font-medium">
            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerClassName="p-6">
        <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          {/* Price & Quantity Row */}
          <View className="flex-row justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                Price
              </Text>
              <Text className="text-2xl font-bold text-gray-900">
                ৳{item.price}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                Quantity
              </Text>
              <Text className="text-2xl font-bold text-gray-900">
                {item.quantity}{" "}
                <Text className="text-base text-gray-500 font-normal">
                  {item.quantityUnit}
                </Text>
              </Text>
            </View>
          </View>

          <View className="h-[1px] bg-gray-100" />

          {/* Total Cost */}
          <View>
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
              Total Cost
            </Text>
            <Text className="text-4xl font-bold text-[#00B761]">
              ৳{(item.price * item.quantity).toLocaleString()}
            </Text>
          </View>

          <View className="h-[1px] bg-gray-100" />

          {/* Added By & Date */}
          <View className="space-y-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="person" size={20} color="#3B82F6" />
              </View>
              <View>
                <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                  Added By
                </Text>
                <Text className="text-gray-900 font-semibold text-lg">
                  {item.addedByName}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="calendar" size={20} color="#F97316" />
              </View>
              <View>
                <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                  Date Added
                </Text>
                <Text className="text-gray-900 font-semibold text-lg">
                  {item.date}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
