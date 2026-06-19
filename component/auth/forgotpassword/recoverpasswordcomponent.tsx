import {
  View, Text, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import InputComponent from "component/controls/textinput";
import ButtonComponent from "component/buttoncomponent";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import { useDelay } from "hooks/useDelay";
import { useMutation } from "@tanstack/react-query";
import { sendOtp } from "services/authServices";
import { useDispatch } from "react-redux";
import { setRegistrationData } from "redux/slices/authSlice";
import { useRouter } from "expo-router";
import AcePick from "../../../assets/acepick.svg";

function RecoverPassword() {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor, subText, borderColor } = getColors(theme);
  const insets = useSafeAreaInsets();
  const isDark  = theme === "dark";
  const dispatch = useDispatch();
  const router   = useRouter();

  const cardBg   = isDark ? "#1F2937" : "#FFFFFF";
  const border   = isDark ? "#374151" : "#E5E7EB";
  const textMain = isDark ? "#F9FAFB" : "#111827";

  const [email, setEmail]           = useState("");
  const [errorMessage, setErrorMessage]   = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shouldProceed, setShouldProceed]  = useState(false);

  useEffect(() => {
    if (errorMessage) {
      const t = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [errorMessage]);

  useDelay(() => {
    if (shouldProceed) {
      dispatch(setRegistrationData({ email }));
      router.push("/verifyotpscreen");
    }
  }, 2000, [shouldProceed]);

  const mutation = useMutation({
    mutationFn: sendOtp,
    onSuccess: (data) => {
      if (data.status) {
        setSuccessMessage("OTP sent to your email");
        setShouldProceed(true);
      } else {
        setErrorMessage("Could not send OTP. Please check your email address.");
      }
    },
    onError: (error: any) => {
      setErrorMessage(
        error?.response?.data?.message || error?.message || "An unexpected error occurred"
      );
    },
  });

  const handleSubmit = () => {
    if (!email) { setErrorMessage("Please enter your email address"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    mutation.mutate({ email, type: "EMAIL", reason: "forgot_password" });
  };

  return (
    <>
      {successMessage && <AlertMessageBanner type="success" message={successMessage} />}
      {errorMessage   && <AlertMessageBanner type="error"   message={errorMessage}   />}

      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={[styles.root, { backgroundColor }]}>
        {/* Top accent strip */}
        <View style={[styles.strip, { backgroundColor: primaryColor }]} />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Back button */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color={primaryTextColor} />
            </TouchableOpacity>

            {/* Logo + heading */}
            <View style={styles.logoSection}>
              <View style={[styles.iconRing, { backgroundColor: primaryColor + "15", borderColor: primaryColor + "30" }]}>
                <AcePick width={52} height={52} />
              </View>
              <Text style={[styles.heading, { color: primaryTextColor }]}>Forgot Password?</Text>
              <Text style={[styles.subheading, { color: subText }]}>
                No worries — we'll send a reset code to your email
              </Text>
            </View>

            {/* Steps hint */}
            <View style={styles.stepsRow}>
              {["Enter Email", "Verify OTP", "New Password"].map((s, i) => (
                <View key={i} style={styles.stepItem}>
                  <View style={[styles.stepDot, {
                    backgroundColor: i === 0 ? primaryColor : isDark ? "#374151" : "#E5E7EB",
                  }]}>
                    <Text style={[styles.stepNum, { color: i === 0 ? "#fff" : subText }]}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.stepLabel, { color: i === 0 ? primaryColor : subText }]}>{s}</Text>
                  {i < 2 && <View style={[styles.stepLine, { backgroundColor: isDark ? "#374151" : "#E5E7EB" }]} />}
                </View>
              ))}
            </View>

            {/* Card */}
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
              <View style={styles.fieldLabel}>
                <Ionicons name="mail-outline" size={15} color={primaryColor} />
                <Text style={[styles.label, { color: textMain }]}>Email Address</Text>
              </View>
              <InputComponent
                value={email}
                onChange={setEmail}
                color={primaryColor}
                placeholder="yourname@email.com"
                placeholdercolor={subText}
                keyboardType="email-address"
                editable
              />
              <Text style={[styles.hint, { color: subText }]}>
                Enter the email linked to your AcePick account
              </Text>
            </View>

            <View style={{ marginTop: 24 }}>
              <ButtonComponent
                color={primaryColor}
                text={mutation.isPending ? "Sending Code…" : "Send Reset Code"}
                textcolor="#fff"
                onPress={handleSubmit}
                isLoading={mutation.isPending}
                disabled={!email || mutation.isPending}
              />
            </View>

            {/* Back to login */}
            <TouchableOpacity onPress={() => router.back()} style={styles.loginRow}>
              <Ionicons name="arrow-back-outline" size={14} color={primaryColor} />
              <Text style={[styles.loginLink, { color: primaryColor }]}>Back to Login</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1 },
  strip: { height: 4, width: "100%" },
  scroll: { paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 },

  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
    marginBottom: 8,
  },

  logoSection: { alignItems: "center", marginBottom: 28 },
  iconRing: {
    width: 88, height: 88, borderRadius: 24,
    borderWidth: 1.5, justifyContent: "center", alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 4,
  },
  heading:    { fontSize: 22, fontWeight: "700", fontFamily: "TTFirsNeueMedium" },
  subheading: { fontSize: 13, fontFamily: "TTFirsNeue", textAlign: "center", marginTop: 6, paddingHorizontal: 20 },

  stepsRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", marginBottom: 24,
  },
  stepItem:  { flexDirection: "row", alignItems: "center" },
  stepDot:   { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  stepNum:   { fontSize: 11, fontWeight: "700" },
  stepLabel: { fontSize: 11, fontFamily: "TTFirsNeue", marginHorizontal: 6 },
  stepLine:  { width: 20, height: 2, borderRadius: 1 },

  card: {
    borderRadius: 20, borderWidth: 1, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    gap: 10,
  },
  fieldLabel: { flexDirection: "row", alignItems: "center", gap: 6 },
  label:      { fontSize: 13, fontWeight: "600", fontFamily: "TTFirsNeueMedium" },
  hint:       { fontSize: 11, fontFamily: "TTFirsNeue", marginTop: 2 },

  loginRow:  { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 24 },
  loginLink: { fontSize: 14, fontWeight: "600", fontFamily: "TTFirsNeueMedium" },
});

export default RecoverPassword;
