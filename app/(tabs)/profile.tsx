import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
  const { user, logout, role } = useAuth();
  const router = useRouter();
  const isAdmin =
    role === "admin" || role === "ADMIN" || role === "SUPER_ADMIN";

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const MenuItem = ({
    icon,
    title,
    onPress,
    color = "#1F2937",
    showChevron = true,
  }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between p-4 bg-white mb-2 rounded-xl shadow-sm border border-gray-100"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3">
          <Ionicons
            name={icon}
            size={20}
            color={color === "#EF4444" ? color : "#00B761"}
          />
        </View>
        <Text className="font-semibold text-base" style={{ color }}>
          {title}
        </Text>
      </View>
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 p-6">
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <View className="px-6 py-4  border-b border-gray-100 mb-4">
        <Text className="text-2xl font-bold text-gray-900">Account</Text>
      </View>
      {/* <StatusBar style="dark" backgroundColor="#f9fafb" />
      <Text className="text-2xl font-bold text-gray-900 mb-6 ">Account</Text> */}

      <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 items-center">
        <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-3">
          <Text className="text-3xl font-bold text-green-600">
            {user?.email?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text className="text-xl font-bold text-gray-900">
          {user?.displayName || "User"}
        </Text>
        <Text className="text-gray-500">{user?.email}</Text>
        <View className="bg-blue-100 px-3 py-1 rounded-full mt-2">
          <Text className="text-blue-600 text-xs font-bold uppercase">
            {role}
          </Text>
        </View>
      </View>

      <View>
        {isAdmin && (
          <>
            <Text className="text-gray-500 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">
              Admin
            </Text>
            <MenuItem
              icon="people"
              title="Manage Users"
              onPress={() => router.push("/admin/users")}
            />
            <MenuItem
              icon="person-add"
              title="Add New User"
              onPress={() => router.push("/admin/add-user")}
            />
            <View className="h-4" />
          </>
        )}

        <Text className="text-gray-500 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">
          Settings
        </Text>
        <MenuItem
          icon="log-out-outline"
          title="Log Out"
          onPress={handleLogout}
          color="#EF4444"
          showChevron={false}
        />
      </View>
    </SafeAreaView>
  );
}
