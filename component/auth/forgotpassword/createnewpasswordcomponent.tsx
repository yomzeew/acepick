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
import PasswordComponent from "component/controls/passwordinput";
import ButtonComponent from "component/buttoncomponent";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import SliderModal from "component/SlideUpModal";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { useDebounce } from "hooks/useDebounce";
import { useDelay } from "hooks/useDelay";
import { useMutation } from "@tanstack/react-query";
import { forgetUser } from "services/authServices";
import { useRouter } from "expo-router";

function CreateNewPasswordcomponent() {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor, subText } = getColors(theme);
  const insets = useSafeAreaInsets();
  const isDark  = theme === "dark";
  const router  = useRouter();

  const cardBg   = isDark ? "#1F2937" : "#FFFFFF";
  const border   = isDark ? "#374151" : "#E5E7EB";
  const textMain = isDark ? "#F9FAFB" : "#111827";

  const registerData = useSelector((s: RootState) => s.auth.registrationData);

  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage,    setErrorMessage]    = useState<string | null>(null);
  const [successMessage,  setSuccessMessage]  = useState<string | null>(null);
  const [showModal,       setShowModal]       = useState(false);
  const [shouldProceed,   setShouldProceed]   = useState(false);

  const debouncedConfirm = useDebounce(confirmPassword, 500);

  useEffect(() => {
    if (debouncedConfirm.length > 0 && password !== debouncedConfirm) {
      setErrorMessage("Passwords do not match");
    } else {
      setErrorMessage(null);
    }
  }, [debouncedConfirm, password]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  useDelay(() => { if (shouldProceed) setShowModal(true); }, 2000, [shouldProceed]);

  // Password strength
  const hasLength  = password.length >= 8;
  const hasUpper   = /[A-Z]/.test(password);
  const hasNumber  = /[0-9]/.test(password);
  const strength   = [hasLength, hasUpper, hasNumber].filter(Boolean).length;
  const strengthLabel = strength === 0 ? "" : strength === 1 ? "Weak" : strength === 2 ? "Fair" : "Strong";
  const strengthColor = strength === 1 ? "#EF4444" : strength === 2 ? "#F59E0B" : "#10B981";

  const mutation = useMutation({
    mutationFn: forgetUser,
    onSuccess: () => {
      setSuccessMessage("Password changed successfully!");
      setShouldProceed(true);
    },
    onError: (error: any) => {
      setErrorMessage(error?.response?.data?.message || error?.message || "An unexpected error occurred");
    },
  });

  const handleSubmit = () => {
    if (!password || !confirmPassword) { setErrorMessage("Please fill in both fields"); return; }
    if (password !== confirmPassword)   { setErrorMessage("Passwords do not match");       return; }
    if (password.length < 8)            { setErrorMessage("Password must be at least 8 characters"); return; }
    const email = registerData?.email || "";
    mutation.mutate({ email, password, confirmPassword });
  };

  return (
    <>
      {successMessage && <AlertMessageBanner type="success" message={successMessage} />}
      {errorMessage   && <AlertMessageBanner type="error"   message={errorMessage}   />}

      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={[styles.root, { backgroundColor }]}>
        <View style={[styles.strip, { backgroundColor: primaryColor }]} />

        {showModal && (
          <SliderModal
            setshowmodal={setShowModal}
            showmodal={showModal}
            route="/loginscreen"
            title="Password Changed!"
          />
        )}

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={20}>
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color={primaryTextColor} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.headerSection}>
              <View style={[styles.iconRing, { backgroundColor: primaryColor + "15", borderColor: primaryColor + "30" }]}>
                <Ionicons name="lock-closed-outline" size={32} color={primaryColor} />
              </View>
              <Text style={[styles.heading, { color: primaryTextColor }]}>Create New Password</Text>
              <Text style={[styles.subheading, { color: subText }]}>
                Your new password must be different from your previous one
              </Text>
            </View>

            {/* Steps */}
            <View style={styles.stepsRow}>
              {["Enter Email", "Verify OTP", "New Password"].map((s, i) => (
                <View key={i} style={styles.stepItem}>
                  <View style={[styles.stepDot, { backgroundColor: primaryColor }]}>
                    {i < 2
                      ? <Ionicons name="checkmark" size={12} color="#fff" />
                      : <Text style={[styles.stepNum, { color: "#fff" }]}>{i + 1}</Text>
                    }
                  </View>
                  <Text style={[styles.stepLabel, { color: i === 2 ? primaryColor : subText }]}>{s}</Text>
                  {i < 2 && <View style={[styles.stepLine, { backgroundColor: primaryColor }]} />}
                </View>
              ))}
            </View>

            {/* Card */}
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
              <PasswordComponent
                color={primaryColor}
                placeholder="New Password"
                placeholdercolor={subText}
                onChange={setPassword}
                value={password}
              />

              {/* Strength indicator */}
              {password.length > 0 && (
                <View style={styles.strengthSection}>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3].map((lvl) => (
                      <View
                        key={lvl}
                        style={[styles.strengthBar, {
                          backgroundColor: lvl <= strength ? strengthColor : isDark ? "#374151" : "#E5E7EB",
                        }]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthLabel, { color: strengthColor }]}>{strengthLabel}</Text>
                </View>
              )}

              {/* Requirements */}
              <View style={styles.reqList}>
                {[
                  { ok: hasLength, text: "At least 8 characters" },
                  { ok: hasUpper,  text: "One uppercase letter" },
                  { ok: hasNumber, text: "One number" },
                ].map(({ ok, text }) => (
                  <View key={text} style={styles.reqRow}>
                    <Ionicons
                      name={ok ? "checkmark-circle" : "ellipse-outline"}
                      size={14}
                      color={ok ? "#10B981" : subText}
                    />
                    <Text style={[styles.reqText, { color: ok ? "#10B981" : subText }]}>{text}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.divider, { backgroundColor: border }]} />

              <PasswordComponent
                color={primaryColor}
                placeholder="Confirm Password"
                placeholdercolor={subText}
                onChange={setConfirmPassword}
                value={confirmPassword}
              />

              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <View style={styles.matchRow}>
                  <Ionicons
                    name={password === confirmPassword ? "checkmark-circle" : "close-circle"}
                    size={14}
                    color={password === confirmPassword ? "#10B981" : "#EF4444"}
                  />
                  <Text style={[styles.matchText, { color: password === confirmPassword ? "#10B981" : "#EF4444" }]}>
                    {password === confirmPassword ? "Passwords match" : "Passwords don't match"}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ marginTop: 24 }}>
              <ButtonComponent
                color={primaryColor}
                text={mutation.isPending ? "Saving…" : "Save New Password"}
                textcolor="#fff"
                onPress={handleSubmit}
                isLoading={mutation.isPending}
                disabled={!password || !confirmPassword || password !== confirmPassword || mutation.isPending}
              />
            </View>
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

  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", marginBottom: 8 },

  headerSection: { alignItems: "center", marginBottom: 24 },
  iconRing: {
    width: 88, height: 88, borderRadius: 24, borderWidth: 1.5,
    justifyContent: "center", alignItems: "center", marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 4,
  },
  heading:    { fontSize: 22, fontWeight: "700", fontFamily: "TTFirsNeueMedium" },
  subheading: { fontSize: 13, fontFamily: "TTFirsNeue", textAlign: "center", marginTop: 6, paddingHorizontal: 20 },

  stepsRow:  { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  stepItem:  { flexDirection: "row", alignItems: "center" },
  stepDot:   { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  stepNum:   { fontSize: 11, fontWeight: "700" },
  stepLabel: { fontSize: 11, fontFamily: "TTFirsNeue", marginHorizontal: 6 },
  stepLine:  { width: 20, height: 2, borderRadius: 1 },

  card: {
    borderRadius: 20, borderWidth: 1, padding: 20, gap: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  strengthSection: { flexDirection: "row", alignItems: "center", gap: 10 },
  strengthBars:    { flexDirection: "row", gap: 4, flex: 1 },
  strengthBar:     { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel:   { fontSize: 12, fontWeight: "600", fontFamily: "TTFirsNeueMedium", width: 40 },

  reqList: { gap: 6 },
  reqRow:  { flexDirection: "row", alignItems: "center", gap: 8 },
  reqText: { fontSize: 12, fontFamily: "TTFirsNeue" },

  divider:   { height: 1 },
  matchRow:  { flexDirection: "row", alignItems: "center", gap: 6 },
  matchText: { fontSize: 12, fontFamily: "TTFirsNeue" },
});

export default CreateNewPasswordcomponent;
