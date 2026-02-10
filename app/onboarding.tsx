import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    title: "Track Your Grocery Spending",
    description:
      "Keep track of your daily grocery expenses easily and efficiently. Never lose sight of your budget.",
    icon: "cart-outline" as const,
  },
  {
    id: "2",
    title: "Collaborate with Roommates",
    description:
      "Manage shared grocery lists with your roommates or family members. Everyone stays on the same page.",
    icon: "people-outline" as const,
  },
  {
    id: "3",
    title: "Get Monthly Reports",
    description:
      "Visualize your spending habits with detailed monthly reports and category breakdowns.",
    icon: "pie-chart-outline" as const,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Finish onboarding
      try {
        await completeOnboarding();
      } catch (error) {
        console.error("Error saving onboarding status:", error);
        router.replace("/login");
      }
    }
  };

  const handleSkip = async () => {
    try {
      await completeOnboarding();
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      router.replace("/login");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Skip Button */}
      <View className="flex-row justify-end px-6 pt-2">
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-[#00B761] text-base font-semibold">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={{ width }} className="items-center px-8 pt-20">
            <View className="w-64 h-64 bg-green-50 rounded-full items-center justify-center mb-10 shadow-sm">
              <Ionicons name={item.icon} size={100} color="#00B761" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
              {item.title}
            </Text>
            <Text className="text-gray-500 text-center text-lg leading-7">
              {item.description}
            </Text>
          </View>
        )}
      />

      {/* Footer (Indicators + Button) */}
      <View className="px-8 pb-12 pt-6">
        {/* Indicators */}
        <View className="flex-row justify-center space-x-2 mb-10">
          {SLIDES.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? "w-8 bg-[#00B761]"
                  : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </View>

        {/* Next/Get Started Button */}
        <TouchableOpacity
          onPress={handleNext}
          className="bg-[#00B761] py-4 rounded-2xl items-center shadow-lg shadow-green-500/30"
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-bold">
            {currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
