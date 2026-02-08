import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../context/AuthContext";
import { GroceryItem, useGrocery } from "../context/GroceryContext";

export default function GroceryListScreen() {
  const router = useRouter();
  const { groceries, isLoading, deleteGrocery } = useGrocery();
  const { role } = useAuth();
  const [selectedItem, setSelectedItem] = useState<GroceryItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const isAdmin =
    role === "admin" || role === "ADMIN" || role === "SUPER_ADMIN";

  const handleDelete = (id: string) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteGrocery(id);
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
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
    <TouchableOpacity onPress={() => openDetails(item)} activeOpacity={0.8}>
    <View className="bg-surface-light dark:bg-surface-dark p-5 mb-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex-row justify-between items-center">
      <View className="flex-1 mr-4">
        <Text className="text-lg font-bold text-text-primary dark:text-gray-100 mb-1">
          {item.itemName}
        </Text>
        <View className="flex-row items-center mb-1">
          <Ionicons
            name="calendar-outline"
            size={14}
            color="#6B7280"
            style={{ marginRight: 4 }}
          />
          <Text className="text-text-secondary dark:text-gray-400 text-xs">
            {item.date}
          </Text>
        </View>
        {item.addedByName && (
          <View className="flex-row items-center">
            <Ionicons
              name="person-outline"
              size={14}
              color="#6B7280"
              style={{ marginRight: 4 }}
            />
            <Text className="text-text-secondary dark:text-gray-400 text-xs">
              {item.addedByName}
            </Text>
          </View>
        )}
        <View className="flex-row items-center mt-1">
          <Ionicons
            name="pricetag-outline"
            size={14}
            color="#6B7280"
            style={{ marginRight: 4 }}
          />
          <Text className="text-text-secondary dark:text-gray-400 text-xs">
            {item.category}
          </Text>
        </View>
      </View>

      <View className="items-end">
        <Text className="text-xl font-bold text-primary dark:text-green-400">
          ৳{item.price * item.quantity}
        </Text>
        <Text className="text-text-secondary dark:text-gray-500 text-xs text-right mt-0.5 font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
          {item.quantity} {item.quantityUnit} x ৳{item.price}
        </Text>

        {isAdmin && (
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-full"
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <View className="flex-row items-center justify-between px-6 py-4 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100"
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">
          Grocery List
        </Text>
        <View className="w-10" />
      </View>

      <FlatList
        data={groceries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} tintColor="#1F7A5A" />
        }
        ListEmptyComponent={
          <View className="items-center justify-center mt-20 opacity-50">
            <Ionicons name="basket-outline" size={64} color="#9CA3AF" />
            <Text className="text-text-secondary dark:text-gray-500 mt-4 text-lg font-medium">
              No groceries added yet.
            </Text>
            <Text className="text-text-secondary dark:text-gray-500 text-sm">
              Tap the + button to add items.
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        className="absolute bottom-8 right-6 bg-primary w-16 h-16 rounded-full items-center justify-center shadow-xl shadow-primary/40"
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
          <Pressable
            className="bg-white rounded-3xl p-6"
            onPress={() => {}}
          >
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
