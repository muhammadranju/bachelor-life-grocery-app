import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { BACKEND_BASE_URL } from "../constants/Config";
import { useAlert } from "../context/AlertContext";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { showAlert } = useAlert();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      showAlert("Error", "Please fill in all fields", [], "error");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Error", "Passwords do not match", [], "error");
      return;
    }

    if (password.length < 8) {
      showAlert(
        "Error",
        "Password must be at least 8 characters long",
        [],
        "error",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Registration failed");
      }

      showAlert(
        "Success",
        "Account created successfully. Please login.",
        [{ text: "OK", onPress: () => router.replace("/login") }],
        "success",
      );
    } catch (error: any) {
      showAlert("Registration Failed", error.message, [], "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Green Hero Background */}
      <View className="bg-[#00B761] h-[40%] items-center justify-center rounded-b-[40px] absolute top-0 left-0 right-0 z-0">
        <View className="mb-4 bg-white/20 p-4 rounded-full">
          <Ionicons name="person-add" size={48} color="white" />
        </View>
        <Text className="text-3xl font-bold text-white tracking-tight">
          Join Grocery<Text className="text-green-100">Life</Text>
        </Text>
        <Text className="text-green-100 mt-2 text-base">
          Start sharing expenses today
        </Text>
      </View>

      <KeyboardAwareScrollView
        enableOnAndroid={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingTop: "35%",
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, paddingHorizontal: 24 }}
      >
        <View className="bg-white p-8 rounded-3xl shadow-xl shadow-green-900/10 border border-gray-100">
          <Text className="text-xl font-bold text-gray-900 mb-6 text-center">
            Create Account
          </Text>

          <View className="mb-4">
            <Text className="font-bold text-gray-500 mb-2 ml-1 uppercase text-xs">
              Full Name
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:border-[#00B761]">
              <Ionicons name="person-outline" size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-900"
                placeholder="John Doe"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View className="mb-4">
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

          <View className="mb-4">
            <Text className="font-bold text-gray-500 mb-2 ml-1 uppercase text-xs">
              Password
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:border-[#00B761]">
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-900"
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="p-1"
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-8">
            <Text className="font-bold text-gray-500 mb-2 ml-1 uppercase text-xs">
              Confirm Password
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:border-[#00B761]">
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-900"
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="p-1"
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            className={`py-4 rounded-2xl shadow-lg shadow-green-500/30 ${
              loading ? "bg-gray-400" : "bg-[#00B761]"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                Sign Up
              </Text>
            )}
          </TouchableOpacity>

          <View className="mt-6 flex-row justify-center">
            <Text className="text-gray-500">Already have an account? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text className="text-[#00B761] font-bold">Log In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
        <View className="h-10" />
      </KeyboardAwareScrollView>
    </View>
  );
}
