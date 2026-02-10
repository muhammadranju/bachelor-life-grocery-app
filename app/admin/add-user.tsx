import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
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
import { BACKEND_BASE_URL } from "../../constants/Config";

export default function AddUserScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async () => {
    if (!email || !password || !name) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    Alert.alert("Confirm", "Are you sure you want to create this user?", [
      { text: "Cancel", style: "cancel" },
      { text: "Create", onPress: performCreation },
    ]);
  };

  const performCreation = async () => {
    setLoading(true);
    try {
      let token = null;
      if (Platform.OS === "web") {
        token = localStorage.getItem("accessToken");
      } else {
        token = await SecureStore.getItemAsync("accessToken");
      }

      const response = await fetch(`${BACKEND_BASE_URL}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: role.toUpperCase(),
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Failed to create user");
      }

      Alert.alert("Success", "User created successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
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
            Add New User
          </Text>
        </View>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="p-6">
          <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5">
            <View className="mb-4">
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wider opacity-70">
                Full Name
              </Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 py-4">
                <Ionicons name="person-outline" size={22} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="User's Full Name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wider opacity-70">
                Email Address
              </Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 py-4">
                <Ionicons name="mail-outline" size={22} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="email@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wider opacity-70">
                Password
              </Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 py-4">
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color="#6B7280"
                />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="Min 6 characters"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-bold text-gray-700 mb-3 ml-1 uppercase tracking-wider opacity-70">
                Role Assignment
              </Text>
              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={() => setRole("user")}
                  className={`flex-1 p-4 rounded-2xl border-2 flex-row items-center justify-center ${
                    role === "user"
                      ? "bg-green-50 border-green-500"
                      : "bg-white border-gray-200"
                  }`}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="person"
                    size={20}
                    color={role === "user" ? "#00B761" : "#9CA3AF"}
                  />
                  <Text
                    className={`ml-2 font-bold ${role === "user" ? "text-green-700" : "text-gray-500"}`}
                  >
                    User
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setRole("admin")}
                  className={`flex-1 p-4 rounded-2xl border-2 flex-row items-center justify-center ${
                    role === "admin"
                      ? "bg-green-50 border-green-500"
                      : "bg-white border-gray-200"
                  }`}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={20}
                    color={role === "admin" ? "#00B761" : "#9CA3AF"}
                  />
                  <Text
                    className={`ml-2 font-bold ${role === "admin" ? "text-green-700" : "text-gray-500"}`}
                  >
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              className={`w-full py-5 rounded-2xl flex-row justify-center items-center shadow-lg shadow-primary/30 mt-4 ${
                loading ? "bg-primary/70" : "bg-primary"
              }`}
              onPress={handleCreateUser}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-xl tracking-wide">
                  Create User
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
