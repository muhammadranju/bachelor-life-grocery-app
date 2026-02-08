import Constants from "expo-constants";
import { Platform } from "react-native";

const getBackendBaseUrl = () => {
  if (Platform.OS === "web") {
    return "https://established-outdoor-oem-operations.trycloudflare.com/api/v1";
  }
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];
  if (host) {
    return `http://${host}:5008/api/v1`;
  }
  return "https://established-outdoor-oem-operations.trycloudflare.com/api/v1";
};

export const BACKEND_BASE_URL = getBackendBaseUrl();
