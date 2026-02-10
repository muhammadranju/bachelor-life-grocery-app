import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from "react-native-reanimated";

export type AlertType = "success" | "error" | "warning" | "info" | "confirm";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  type?: AlertType;
  onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [],
  type = "info",
  onClose,
}) => {
  if (!visible) return null;

  // Default button if none provided
  const actionButtons =
    buttons.length > 0
      ? buttons
      : [{ text: "OK", onPress: onClose, style: "default" }];

  const getIcon = () => {
    switch (type) {
      case "success":
        return { name: "checkmark-circle", color: "#10B981" }; // green-500
      case "error":
        return { name: "alert-circle", color: "#EF4444" }; // red-500
      case "warning":
        return { name: "warning", color: "#F59E0B" }; // amber-500
      case "confirm":
        return { name: "help-circle", color: "#3B82F6" }; // blue-500
      default:
        return { name: "information-circle", color: "#3B82F6" }; // blue-500
    }
  };

  const icon = getIcon();

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <TouchableWithoutFeedback>
            <Animated.View
              entering={ZoomIn.duration(300)}
              exiting={ZoomOut.duration(200)}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl items-center"
            >
              {/* Icon Header */}
              <View
                className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
                  type === "success"
                    ? "bg-green-100"
                    : type === "error"
                    ? "bg-red-100"
                    : type === "warning"
                    ? "bg-amber-100"
                    : "bg-blue-100"
                }`}
              >
                <Ionicons name={icon.name as any} size={32} color={icon.color} />
              </View>

              {/* Title & Message */}
              <Text className="text-xl font-bold text-gray-900 text-center mb-2">
                {title}
              </Text>
              {message ? (
                <Text className="text-base text-gray-500 text-center mb-6 leading-6">
                  {message}
                </Text>
              ) : null}

              {/* Buttons */}
              <View className="w-full flex-col gap-3">
                {actionButtons.map((btn, index) => {
                  const isPrimary =
                    btn.style !== "cancel" && btn.style !== "destructive";
                  const isDestructive = btn.style === "destructive";

                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        if (btn.onPress) btn.onPress();
                        // We typically close the alert after press unless specifically prevented,
                        // but usually the caller handles logic.
                        // For this implementation, we rely on the context to close it,
                        // or the button action to eventually trigger close.
                        // Ideally, we just run the action.
                        // If it's a simple "OK", it closes.
                      }}
                      className={`w-full py-3.5 rounded-xl items-center justify-center ${
                        isPrimary
                          ? "bg-[#00B761] shadow-md shadow-green-200"
                          : isDestructive
                          ? "bg-red-50 border border-red-100"
                          : "bg-gray-50 border border-gray-100"
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text
                        className={`font-semibold text-base ${
                          isPrimary
                            ? "text-white"
                            : isDestructive
                            ? "text-red-600"
                            : "text-gray-700"
                        }`}
                      >
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CustomAlert;
