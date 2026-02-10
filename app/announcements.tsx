import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAlert } from "../context/AlertContext";
import { useAuth } from "../context/AuthContext";
import { NeedItem, useNeed } from "../context/NeedContext";

export default function AnnouncementsScreen() {
  const router = useRouter();
  const { needs, isLoading, addNeed, deleteNeed, refreshNeeds } = useNeed();
  const { user, role } = useAuth();
  const { showAlert } = useAlert();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("pcs");

  const units = ["pcs", "kg", "liter", "packet", "box", "dozen"];

  const isAdmin =
    role === "admin" || role === "ADMIN" || role === "SUPER_ADMIN";

  const handleAddNeed = async () => {
    if (!productName || !quantity) {
      showAlert("Missing Fields", "Please fill in all fields", [], "error");
      return;
    }

    try {
      await addNeed({
        productName,
        quantity: Number(quantity),
        quantityUnit,
        addedByName: user?.name || user?.displayName || "User",
      });
      setIsModalVisible(false);
      setProductName("");
      setQuantity("");
      setQuantityUnit("pcs");
      showAlert("Success", "Item added to list", [], "success");
    } catch (error: any) {
      showAlert("Error", error.message, [], "error");
    }
  };

  const handleDelete = (id: string) => {
    showAlert(
      "Delete Item",
      "Have you bought this item or want to remove it?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteNeed(id);
            } catch (error: any) {
              showAlert("Error", error.message, [], "error");
            }
          },
        },
      ],
      "warning",
    );
  };

  const renderItem = ({ item }: { item: NeedItem }) => (
    <View className="bg-white p-4 mb-3 rounded-2xl shadow-sm border border-gray-100 flex-row items-center justify-between">
      <View className="flex-1 mr-2">
        <Text className="text-base font-bold text-gray-900 mb-1">
          {item.productName}
        </Text>
        <Text className="text-gray-500 text-xs">
          Added by {item.addedByName}
        </Text>
      </View>

      <View className="flex-row items-center">
        <View className="bg-orange-100 px-3 py-1 rounded-lg mr-3">
          <Text className="text-orange-700 font-bold">
            {item.quantity} {item.quantityUnit}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          className="p-2 bg-red-50 rounded-full"
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <View className="px-6 py-4 flex-row items-center bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 p-2 bg-gray-50 rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Announcements</Text>
      </View>

      <FlatList
        data={needs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-6 pb-24"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshNeeds}
            tintColor="#00B761"
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center mt-20 opacity-50">
            <Ionicons name="list-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-lg font-medium">
              No items needed
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              Tap + to add items to buy
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-[#00B761] w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-green-500/30"
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <Modal
        transparent
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center px-6"
          onPress={() => setIsModalVisible(false)}
        >
          <Pressable className="bg-white rounded-3xl p-6" onPress={() => {}}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">
                Add Need Item
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-gray-700 font-medium mb-2">
                  Product Name
                </Text>
                <TextInput
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="e.g. Milk, Eggs, Rice"
                  value={productName}
                  onChangeText={setProductName}
                />
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-gray-700 font-medium mb-2">
                    Quantity
                  </Text>
                  <TextInput
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                    placeholder="0"
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-700 font-medium mb-2">Unit</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {units.map((u) => (
                      <TouchableOpacity
                        key={u}
                        onPress={() => setQuantityUnit(u)}
                        className={`px-3 py-2 rounded-lg border ${
                          quantityUnit === u
                            ? "bg-green-100 border-green-500"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            quantityUnit === u
                              ? "text-green-700"
                              : "text-gray-600"
                          }`}
                        >
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <TouchableOpacity
                className="w-full bg-[#00B761] py-4 rounded-xl items-center mt-4"
                onPress={handleAddNeed}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-lg">
                  Add to List
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
