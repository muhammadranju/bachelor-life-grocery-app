import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function TabLayout() {
  const { user, isLoading } = useAuth();

  // If loading, maybe show a spinner or nothing?
  // But usually layout renders children.
  // Auth protection is handled at a higher level or per screen.
  // But let's add a safe check here too.
  if (!isLoading && !user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#00B761", // Vibrant Green
        tabBarInactiveTintColor: "#9CA3AF", // Gray 400
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#F3F4F6",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: "List",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />

      {/* 
        We can put a central ADD button here as a fake tab that opens a modal, 
        but for simplicity let's stick to standard tabs for now and use FABs on screens.
      */}

      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pie-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
