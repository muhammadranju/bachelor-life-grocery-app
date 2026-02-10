import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAlert } from "../../context/AlertContext";
import { useAuth } from "../../context/AuthContext";
import { useBudget } from "../../context/BudgetContext";
import { GroceryItem, useGrocery } from "../../context/GroceryContext";

export default function GroceryListScreen() {
  const router = useRouter();
  const { groceries, isLoading, deleteGrocery, refreshGroceries } =
    useGrocery();
  const { refreshBudget } = useBudget();
  const { role } = useAuth();
  const { showAlert } = useAlert();
  const [selectedItem, setSelectedItem] = useState<GroceryItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshGroceries(true);
    }, []),
  );

  const isAdmin =
    role === "admin" || role === "ADMIN" || role === "SUPER_ADMIN";

  const handleDelete = (id: string) => {
    showAlert(
      "Delete Item",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGrocery(id);
              await refreshBudget();
            } catch (error: any) {
              showAlert("Error", error.message, [], "error");
            }
          },
        },
      ],
      "warning",
    );
  };

  const openDetails = (item: GroceryItem) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const closeDetails = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  const renderItem = ({ item }: { item: GroceryItem }) => (
    <TouchableOpacity
      onPress={() => openDetails(item)}
      activeOpacity={0.8}
      className="bg-white p-4 mb-3 rounded-2xl shadow-sm border border-gray-100 flex-row items-center"
    >
      {/* Icon Placeholder or Category Icon */}
      <View className="w-12 h-12 bg-green-50 rounded-full items-center justify-center mr-4">
        <Ionicons name="basket" size={20} color="#00B761" />
      </View>

      <View className="flex-1 mr-2">
        <Text
          className="text-base font-bold text-gray-900 mb-0.5"
          numberOfLines={1}
        >
          {item.itemName}
        </Text>
        <Text className="text-gray-400 text-xs">
          {item.date} • {item.addedByName} • {item.category}
        </Text>
      </View>

      <View className="items-end">
        <Text className="text-base font-bold text-[#00B761]">
          ৳{item.price * item.quantity}
        </Text>
        <Text className="text-gray-400 text-xs">
          {item.quantity} {item.quantityUnit} x ৳{item.price}
        </Text>
      </View>

      {isAdmin && (
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          className="ml-3 p-2 bg-red-50 rounded-full"
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 edges={['top']}">
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <View className="px-6 py-4 flex-row justify-between items-center bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Grocery List</Text>
        <View className="bg-gray-100 px-3 py-1 rounded-full">
          <Text className="text-gray-900 font-bold text-xs">
            {groceries.length} Items
          </Text>
        </View>
      </View>

      <FlatList
        data={groceries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-6 pb-24"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshGroceries}
            tintColor="#00B761"
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center mt-20 opacity-50">
            <Ionicons name="cart-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-lg font-medium">
              No items yet
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-[#00B761] w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-green-500/30"
        onPress={() => router.push("/add-grocery")}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <Modal
        transparent
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={closeDetails}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center px-6"
          onPress={closeDetails}
        >
          <Pressable className="bg-white rounded-3xl p-6" onPress={() => {}}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">
                {selectedItem?.itemName}
              </Text>
              <TouchableOpacity onPress={closeDetails} activeOpacity={0.7}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Category</Text>
                <Text className="text-gray-900 font-semibold">
                  {selectedItem?.category}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Quantity</Text>
                <Text className="text-gray-900 font-semibold">
                  {selectedItem?.quantity} {selectedItem?.quantityUnit}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Price</Text>
                <Text className="text-gray-900 font-semibold">
                  ৳{selectedItem?.price}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Total</Text>
                <Text className="text-gray-900 font-semibold">
                  ৳
                  {selectedItem
                    ? selectedItem.price * selectedItem.quantity
                    : 0}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Added By</Text>
                <Text className="text-gray-900 font-semibold">
                  {selectedItem?.addedByName || "Unknown"}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Date</Text>
                <Text className="text-gray-900 font-semibold">
                  {selectedItem?.date}
                </Text>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
