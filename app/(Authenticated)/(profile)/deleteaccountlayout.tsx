import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "hooks/useTheme";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { getColors } from "static/color";
import { useDispatch } from "react-redux";
import { logoutAsync } from "redux/slices/authSlice";
import { deleteAccountFn } from "services/authServices";
import { useState } from "react";

const CONFIRM_PHRASE = "DELETE MY ACCOUNT";

export default function DeleteAccountLayout() {
  const { theme } = useTheme();
  const { primaryColor } = getColors(theme);
  const router = useRouter();
  const dispatch = useDispatch();

  const isDark = theme === "dark";
  const bgColor = isDark ? "#111827" : "#F3F4F6";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const inputBorder = isDark ? "#374151" : "#E5E7EB";

  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const isConfirmed = confirmText === CONFIRM_PHRASE;

  const handleDelete = () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent and cannot be undone. All your data will be erased. Are you absolutely sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAccountFn();
              await dispatch(logoutAsync() as any);
              router.replace("/loginscreen");
            } catch (err: any) {
              setLoading(false);
              Alert.alert(
                "Error",
                err?.message || "Failed to delete account. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bgColor }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: "#DC2626",
          paddingTop: 52,
          paddingBottom: 20,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 19, fontWeight: "700" }}>
            Delete Account
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 60,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Warning card */}
        <View
          style={{
            backgroundColor: "#DC262610",
            borderWidth: 1,
            borderColor: "#DC262630",
            borderRadius: 16,
            padding: 18,
            marginBottom: 24,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="warning-outline" size={22} color="#DC2626" />
            <Text
              style={{ color: "#DC2626", fontSize: 15, fontWeight: "700" }}
            >
              This cannot be undone
            </Text>
          </View>
          {[
            "Your account and profile will be permanently removed",
            "All your bookings, orders, and history will be deleted",
            "Your wallet balance and earnings will be forfeited",
            "You will not be able to recover your account",
          ].map((item) => (
            <View
              key={item}
              style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}
            >
              <Ionicons
                name="close-circle"
                size={16}
                color="#DC2626"
                style={{ marginTop: 2 }}
              />
              <Text
                style={{
                  color: textSecondary,
                  fontSize: 13,
                  flex: 1,
                  lineHeight: 19,
                }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* Confirmation input */}
        <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 18, marginBottom: 28 }}>
          <Text
            style={{
              color: textPrimary,
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 6,
            }}
          >
            Type{" "}
            <Text style={{ color: "#DC2626", fontWeight: "700" }}>
              {CONFIRM_PHRASE}
            </Text>{" "}
            to confirm
          </Text>
          <TextInput
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder={CONFIRM_PHRASE}
            placeholderTextColor={textSecondary + "80"}
            autoCapitalize="characters"
            style={{
              marginTop: 8,
              borderWidth: 1,
              borderColor: isConfirmed ? "#DC2626" : inputBorder,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: textPrimary,
              fontSize: 14,
              backgroundColor: isDark ? "#111827" : "#F9FAFB",
            }}
          />
        </View>

        {/* Delete button */}
        <TouchableOpacity
          disabled={!isConfirmed || loading}
          onPress={handleDelete}
          style={{
            backgroundColor: "#DC2626",
            opacity: !isConfirmed || loading ? 0.4 : 1,
            height: 54,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 8,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color="#fff" />
              <Text
                style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}
              >
                Permanently Delete Account
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{ alignItems: "center", marginTop: 16 }}
        >
          <Text
            style={{ color: textSecondary, fontSize: 14, fontWeight: "500" }}
          >
            Cancel, keep my account
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
