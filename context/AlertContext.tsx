import React, { createContext, useContext, useState, useCallback } from "react";
import CustomAlert, { AlertButton, AlertType } from "../components/CustomAlert";

interface AlertState {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  type: AlertType;
}

interface AlertContextType {
  showAlert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    type?: AlertType
  ) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: "",
    message: "",
    buttons: [],
    type: "info",
  });

  const hideAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  }, []);

  const showAlert = useCallback(
    (
      title: string,
      message?: string,
      buttons: AlertButton[] = [],
      type: AlertType = "info"
    ) => {
      // If no buttons provided, add a default OK button that closes the alert
      const finalButtons =
        buttons.length > 0
          ? buttons.map((btn) => ({
              ...btn,
              onPress: () => {
                if (btn.onPress) {
                  btn.onPress();
                }
                hideAlert();
              },
            }))
          : [
              {
                text: "OK",
                onPress: hideAlert,
                style: "default" as const,
              },
            ];

      setAlertState({
        visible: true,
        title,
        message,
        buttons: finalButtons,
        type,
      });
    },
    [hideAlert]
  );

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        type={alertState.type}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};
