import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useGrocery } from "../context/GroceryContext";

export default function AddGroceryScreen() {
  const router = useRouter();
  const { addGrocery } = useGrocery();
  const { user } = useAuth();

  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [category, setCategory] = useState("count");
  const [quantityUnit, setQuantityUnit] = useState("pcs");
  const [pieces, setPieces] = useState("");
  const [addedByName, setAddedByName] = useState("");
  const [loading, setLoading] = useState(false);
  const hasSetDefaultName = useRef(false);
  const hasEdited = useRef(false);

  const categoryOptions = [
    { key: "count", label: "Count", units: ["pcs"] },
    { key: "weight", label: "Weight", units: ["kg", "grams", "mg"] },
    { key: "volume", label: "Volume", units: ["liters", "ml"] },
  ];

  useEffect(() => {
    if (hasEdited.current || hasSetDefaultName.current) {
      return;
    }
    const name = user?.displayName || user?.email?.split("@")[0] || "";
    if (name) {
      setAddedByName(name);
      hasSetDefaultName.current = true;
    }
  }, [user]);

  useEffect(() => {
    const selected = categoryOptions.find((opt) => opt.key === category);
    if (selected && !selected.units.includes(quantityUnit)) {
      setQuantityUnit(selected.units[0]);
    }
  }, [category, quantityUnit]);

  const handleAdd = async () => {
    if (!itemName || !price || !quantity || !category || !quantityUnit) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const isFish = itemName.toLowerCase().includes("fish");
    if (isFish && !pieces) {
      Alert.alert("Error", "Please enter the number of pieces for the fish");
      return;
    }

    if (!addedByName) {
      Alert.alert("Error", "Please enter the name of who added the item");
      return;
    }

    setLoading(true);
    try {
      await addGrocery({
        itemName,
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        quantityUnit,
        category,
        addedByName,
        pieces: pieces ? parseInt(pieces) : undefined,
        date: new Date().toISOString().split("T")[0],
      });
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900 ml-4">
            Add Item
          </Text>
        </View>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="p-6">
          <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            {/* Item Name Input */}
            <View className="mb-4">
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wider opacity-70">
                Item Name
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 focus:border-[#00B761] transition-colors">
                <Ionicons name="cart-outline" size={22} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="e.g. Rice, Oil, Eggs"
                  placeholderTextColor="#9CA3AF"
                  value={itemName}
                  onChangeText={setItemName}
                  autoFocus
                />
              </View>
            </View>

            {itemName.toLowerCase().includes("fish") && (
              <View className="mb-4">
                <Text className="text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wider opacity-70">
                  Number of Pieces
                </Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 focus:border-[#00B761] transition-colors">
                  <Ionicons name="cut-outline" size={22} color="#6B7280" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder="e.g. 5"
                    placeholderTextColor="#9CA3AF"
                    value={pieces}
                    onChangeText={setPieces}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}

            <View className="mb-4">
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wider opacity-70">
                Added By
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 focus:border-[#00B761] transition-colors">
                <Ionicons name="person-outline" size={22} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="e.g. Ranju"
                  placeholderTextColor="#9CA3AF"
                  value={addedByName}
                  onChangeText={setAddedByName}
                  // onChangeText={(text) => {
                  //   setAddedByName(text);
                  //   hasEdited.current = true;
                  // }}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wider opacity-70">
                Category
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {categoryOptions.map((option) => {
                  const selected = category === option.key;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      onPress={() => setCategory(option.key)}
                      className={`px-4 py-2 rounded-full border ${
                        selected
                          ? "bg-[#00B761] border-[#00B761]"
                          : "bg-white border-gray-200"
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          selected ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View className="flex-row gap-4 mb-4">
              {/* Price Input */}
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wider opacity-70">
                  Price (৳)
                </Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 focus:border-[#00B761] transition-colors">
                  <Text className="text-gray-400 font-bold text-lg mr-1 ml-1">
                    ৳
                  </Text>
                  <TextInput
                    className="flex-1 ml-1 text-base text-gray-900"
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>
              </View>

              {/* Quantity Input */}
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wider opacity-70">
                  Quantity ({quantityUnit})
                </Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 focus:border-[#00B761] transition-colors justify-between">
                  <TouchableOpacity
                    onPress={() => {
                      const current = parseInt(quantity) || 0;
                      if (current > 1) setQuantity((current - 1).toString());
                    }}
                    className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center"
                  >
                    <Ionicons name="remove" size={16} color="#4B5563" />
                  </TouchableOpacity>

                  <TextInput
                    className="flex-1 text-center text-base text-gray-900 font-bold"
                    placeholder="1"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                  />

                  <TouchableOpacity
                    onPress={() => {
                      const current = parseInt(quantity) || 0;
                      setQuantity((current + 1).toString());
                    }}
                    className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center"
                  >
                    <Ionicons name="add" size={16} color="#4B5563" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View>
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wider opacity-70">
                Unit
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {categoryOptions
                  .find((opt) => opt.key === category)
                  ?.units.map((unit) => {
                    const selected = unit === quantityUnit;
                    return (
                      <TouchableOpacity
                        key={unit}
                        onPress={() => setQuantityUnit(unit)}
                        className={`px-4 py-2 rounded-full border ${
                          selected
                            ? "bg-[#00B761] border-[#00B761]"
                            : "bg-white border-gray-200"
                        }`}
                        activeOpacity={0.8}
                      >
                        <Text
                          className={`text-sm font-semibold ${
                            selected ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            </View>

            <TouchableOpacity
              className={`w-full py-5 rounded-2xl flex-row justify-center items-center shadow-lg shadow-green-500/30 mt-4 ${
                loading ? "bg-[#00B761]/70" : "bg-[#00B761]"
              }`}
              onPress={handleAdd}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={24}
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-white font-bold text-xl tracking-wide">
                    Save Item
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
