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
import { AlertProvider } from "../context/AlertContext";
import { AuthProvider } from "../context/AuthContext";

import { BudgetProvider } from "@/context/BudgetContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { GroceryProvider } from "../context/GroceryContext";
import { NeedProvider } from "../context/NeedContext";
import { SocketProvider } from "../context/SocketContext";

// import { useNotifications } from "@/hooks/useNotifications";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // useNotifications();

  return (
    <AuthProvider>
      <SocketProvider>
        <AlertProvider>
          <GroceryProvider>
            <NotificationProvider>
              <NeedProvider>
                <BudgetProvider>
                  <ThemeProvider
                    value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
                  >
                    <Stack>
                      <Stack.Screen
                        name="(tabs)"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="onboarding"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="login"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="signup"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="add-grocery"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="admin/add-user"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="admin/users"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="announcements"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="notifications"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="budget"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="modal"
                        options={{ presentation: "modal", headerShown: false }}
                      />
                    </Stack>
                    <StatusBar style="dark" />
                  </ThemeProvider>
                </BudgetProvider>
              </NeedProvider>
            </NotificationProvider>
          </GroceryProvider>
        </AlertProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
