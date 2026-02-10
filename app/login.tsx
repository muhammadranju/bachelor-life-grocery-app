import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";

import React, { useState } from "react";
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
import { BACKEND_BASE_URL } from "../constants/Config";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Login failed");
      }

      const token =
        typeof json.data === "string" ? json.data : json.data?.accessToken;
      if (!token) {
        throw new Error("Invalid login response");
      }
      await login(token);
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Green Hero Background */}
      <View className="bg-[#00B761] h-[40%] items-center justify-center rounded-b-[40px] absolute top-0 left-0 right-0 z-0">
        <View className="mb-4 bg-white/20 p-4 rounded-full">
          <Ionicons name="basket" size={48} color="white" />
        </View>
        <Text className="text-3xl font-bold text-white tracking-tight">
          Grocery<Text className="text-green-100">Life</Text>
        </Text>
        <Text className="text-green-100 mt-2 text-base">
          Smart shared expenses
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-6"
      >
        <ScrollView contentContainerClassName="flex-grow justify-center pt-[30%]">
          <View className="bg-white p-8 rounded-3xl shadow-xl shadow-green-900/10 border border-gray-100">
            <Text className="text-xl font-bold text-gray-900 mb-6 text-center">
              Welcome Back
            </Text>

            <View className="mb-6">
              <Text className="font-bold text-gray-500 mb-2 ml-1 uppercase text-xs">
                Email
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:border-[#00B761]">
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="name@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View className="mb-8">
              <Text className="font-bold text-gray-500 mb-2 ml-1 uppercase text-xs">
                Password
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:border-[#00B761]">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#9CA3AF"
                />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className={`py-4 rounded-2xl shadow-lg shadow-green-500/30 ${
                loading ? "bg-gray-400" : "bg-[#00B761]"
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">
                  Log In
                </Text>
              )}
            </TouchableOpacity>

            <View className="mt-6 flex-row justify-center">
              <Text className="text-gray-500">Don't have an account? </Text>
              <Link href="/signup" asChild>
                <TouchableOpacity>
                  <Text className="text-[#00B761] font-bold">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
