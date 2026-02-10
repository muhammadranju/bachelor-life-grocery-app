import Constants from "expo-constants";
import { Platform } from "react-native";

const getBackendBaseUrl = () => {
  if (Platform.OS === "web") {
    return "http://localhost:5008/api/v1";
  }
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];
  if (host) {
    const url = `http://${host}:5008/api/v1`;
    console.log("Backend URL (Device):", url);
    return url;
  }
  console.log("Backend URL (Localhost):", "http://localhost:5008/api/v1");
  return "http://localhost:5008/api/v1";
};

export const BACKEND_BASE_URL = getBackendBaseUrl();
