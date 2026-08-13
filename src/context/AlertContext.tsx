import React, { createContext, useCallback, useContext, useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "./ThemeContext";

export type AlertType = "info" | "success" | "warning" | "error" | "confirm";

export interface AlertButton {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}

export interface AlertOptions {
  title: string;
  message?: string;
  type?: AlertType;
  buttons?: AlertButton[];
}

interface AlertContextData {
  showAlert: (title: string, message?: string, type?: AlertType) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    isDestructive?: boolean,
    confirmText?: string,
    cancelText?: string
  ) => void;
  showCustomAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextData>({} as AlertContextData);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();

  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AlertOptions>({
    title: "",
    message: "",
    type: "info",
    buttons: [],
  });

  const hideAlert = useCallback(() => {
    setVisible(false);
  }, []);

  const showCustomAlert = useCallback((opts: AlertOptions) => {
    setOptions({
      title: opts.title,
      message: opts.message,
      type: opts.type || "info",
      buttons: opts.buttons && opts.buttons.length > 0
        ? opts.buttons
        : [{ text: "OK", style: "default" }],
    });
    setVisible(true);
  }, []);

  const showAlert = useCallback(
    (title: string, message?: string, type: AlertType = "info") => {
      showCustomAlert({
        title,
        message,
        type,
        buttons: [{ text: "OK", style: "default" }],
      });
    },
    [showCustomAlert]
  );

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      isDestructive: boolean = false,
      confirmText: string = isDestructive ? "Excluir" : "Confirmar",
      cancelText: string = "Cancelar"
    ) => {
      showCustomAlert({
        title,
        message,
        type: isDestructive ? "error" : "confirm",
        buttons: [
          { text: cancelText, style: "cancel" },
          {
            text: confirmText,
            style: isDestructive ? "destructive" : "default",
            onPress: onConfirm,
          },
        ],
      });
    },
    [showCustomAlert]
  );

  const handleButtonPress = (btn: AlertButton) => {
    hideAlert();
    if (btn.onPress) {
      // Small timeout to allow modal animation to complete smoothly
      setTimeout(() => {
        btn.onPress?.();
      }, 100);
    }
  };

  const renderIcon = () => {
    const type = options.type || "info";

    switch (type) {
      case "success":
        return (
          <View style={[styles.iconCircle, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="checkmark-circle" size={36} color={colors.success} />
          </View>
        );
      case "error":
        return (
          <View style={[styles.iconCircle, { backgroundColor: "rgba(239, 68, 68, 0.15)" }]}>
            <Ionicons name="alert-circle" size={36} color={colors.danger} />
          </View>
        );
      case "warning":
        return (
          <View style={[styles.iconCircle, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
            <Ionicons name="warning" size={36} color="#f59e0b" />
          </View>
        );
      case "confirm":
        return (
          <View style={[styles.iconCircle, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="help-circle" size={36} color={colors.accent} />
          </View>
        );
      default:
        return (
          <View style={[styles.iconCircle, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="information-circle" size={36} color={colors.accent} />
          </View>
        );
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm, showCustomAlert, hideAlert }}>
      {children}

      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideAlert}
      >
        <TouchableWithoutFeedback onPress={hideAlert}>
          <View style={[styles.overlay, { backgroundColor: colors.backdrop }]}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                {/* Ícone */}
                {renderIcon()}

                {/* Título */}
                <Text style={[styles.title, { color: colors.text }]}>
                  {options.title}
                </Text>

                {/* Mensagem */}
                {options.message ? (
                  <Text style={[styles.message, { color: colors.textSecondary }]}>
                    {options.message}
                  </Text>
                ) : null}

                {/* Botões de Ação */}
                <View
                  style={[
                    styles.buttonsContainer,
                    options.buttons && options.buttons.length > 1
                      ? styles.buttonsRow
                      : styles.buttonsColumn,
                  ]}
                >
                  {options.buttons?.map((btn, index) => {
                    const isCancel = btn.style === "cancel";
                    const isDestructive = btn.style === "destructive";

                    let btnBg = colors.primary;
                    let textColor = "#fff";
                    let borderWidth = 0;
                    let borderColor = "transparent";

                    if (isCancel) {
                      btnBg = colors.cardSecondary;
                      textColor = colors.textSecondary;
                      borderWidth = 1;
                      borderColor = colors.cardBorder;
                    } else if (isDestructive) {
                      btnBg = colors.danger;
                      textColor = "#fff";
                    }

                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleButtonPress(btn)}
                        style={[
                          styles.button,
                          {
                            backgroundColor: btnBg,
                            borderWidth,
                            borderColor,
                            flex: options.buttons && options.buttons.length > 1 ? 1 : undefined,
                          },
                        ]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.buttonText, { color: textColor }]}>
                          {btn.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 10,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonsContainer: {
    width: "100%",
    gap: 10,
  },
  buttonsRow: {
    flexDirection: "row",
  },
  buttonsColumn: {
    flexDirection: "column",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
