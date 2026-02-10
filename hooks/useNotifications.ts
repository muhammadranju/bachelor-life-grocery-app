import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { BACKEND_BASE_URL } from "../constants/Config";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const getProjectId = () =>
  Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>("");
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    const shouldRegister =
      Platform.OS === "web" || Constants.appOwnership !== "expo";
    if (shouldRegister) {
      registerForPushNotificationsAsync().then((token) => {
        if (token) {
          setExpoPushToken(token);
          fetch(`${BACKEND_BASE_URL}/notification-tokens`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token,
              platform: Platform.OS,
            }),
          }).catch(() => {});
        }
      });
    }

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return { expoPushToken, notification };
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }

    // Handle Web specifically
    const projectId = getProjectId();
    if (!projectId) {
      return;
    }

    if (Platform.OS === "web") {
      try {
        const response = await Notifications.getExpoPushTokenAsync({
          vapidPublicKey:
            "BHNE8yvlQ-KS7m2G4pOZWqudbKCfBzIPtiFdSYkUloLLWjifsD0pg49Kxfos4d7HYbDfJ_R-VQgs4HVmSR0P07E",
          projectId,
        } as any);
        token = response.data;
      } catch (error) {
        console.log(
          "Error getting push token on web (VAPID key likely missing):",
          error,
        );
        return undefined;
      }
    } else {
      const response = await Notifications.getExpoPushTokenAsync({ projectId });
      token = response.data;
    }
  } else {
    // console.log('Must use physical device for Push Notifications');
  }

  return token;
}
