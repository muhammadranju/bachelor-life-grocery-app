import { useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

type UserRole =
  | "admin"
  | "user"
  | "ADMIN"
  | "SUPER_ADMIN"
  | "super_admin"
  | null;

interface UserData {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  [key: string]: any;
}

interface AuthContextType {
  user: UserData | null;
  role: UserRole;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  completeOnboarding: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLaunched, setHasLaunched] = useState<boolean>(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const loadToken = async () => {
      // Check onboarding status
      let launched = null;
      if (Platform.OS === "web") {
        launched = localStorage.getItem("hasLaunched");
      } else {
        launched = await SecureStore.getItemAsync("hasLaunched");
      }
      setHasLaunched(!!launched);

      // Check auth token
      let token = null;
      if (Platform.OS === "web") {
        token = localStorage.getItem("accessToken");
      } else {
        token = await SecureStore.getItemAsync("accessToken");
      }

      if (token) {
        try {
          const decoded: any = jwtDecode(token);

          // Check expiry if needed
          if (decoded.exp * 1000 < Date.now()) {
            await logout();
          } else {
            setUser({
              id: decoded.id,
              email: decoded.email,
              name: decoded.name,
              role: decoded.role,
            });
            setRole(decoded.role);
          }
        } catch (error) {
          console.log("Invalid token", error);
          await logout();
        }
      }
      setIsLoading(false);
    };

    loadToken();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "signup";
    const inOnboardingGroup = segments[0] === "onboarding";

    if (!hasLaunched && !inOnboardingGroup) {
      router.replace("/onboarding");
    } else if (hasLaunched && inOnboardingGroup) {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    } else if (!user && !inAuthGroup && !inOnboardingGroup) {
      // Redirect to the login page
      router.replace("/login");
    } else if (user && (inAuthGroup || (segments as string[]).length === 0)) {
      // Redirect away from the login page or root
      router.replace("/(tabs)");
    }
  }, [user, segments, isLoading, hasLaunched]);

  const login = async (token: string) => {
    if (Platform.OS === "web") {
      localStorage.setItem("accessToken", token);
    } else {
      await SecureStore.setItemAsync("accessToken", token);
    }

    const decoded: any = jwtDecode(token);
    setUser({
      id: decoded.id,
      email: decoded.email,
      name: decoded.name || decoded.email?.split("@")[0],
      role: decoded.role,
    });
    setRole(decoded.role);

    // Explicitly navigate to tabs
    router.replace("/(tabs)");
  };

  const logout = async () => {
    if (Platform.OS === "web") {
      localStorage.removeItem("accessToken");
    } else {
      await SecureStore.deleteItemAsync("accessToken");
    }
    setUser(null);
    setRole(null);
  };

  const completeOnboarding = async () => {
    if (Platform.OS === "web") {
      localStorage.setItem("hasLaunched", "true");
    } else {
      await SecureStore.setItemAsync("hasLaunched", "true");
    }
    setHasLaunched(true);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, role, isLoading, login, logout, completeOnboarding }}
    >
      {children}
    </AuthContext.Provider>
  );
}
