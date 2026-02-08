import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "./global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "../context/AuthContext";

import { GroceryProvider } from "../context/GroceryContext";

// import { useNotifications } from "@/hooks/useNotifications";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // useNotifications();

  return (
    <AuthProvider>
      <GroceryProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="add-grocery" options={{ headerShown: false }} />
            <Stack.Screen
              name="admin/add-user"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="admin/users" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", headerShown: false }}
            />
          </Stack>
          <StatusBar style="dark" />
        </ThemeProvider>
      </GroceryProvider>
    </AuthProvider>
  );
}
