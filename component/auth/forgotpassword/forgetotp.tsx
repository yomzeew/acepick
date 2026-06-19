import {
  View, Text, TouchableOpacity, StyleSheet,
} from "react-native";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import OtpComponent from "component/controls/otpcomponent";
import { useEffect, useState, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ButtonComponent from "component/buttoncomponent";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import SliderModal from "component/SlideUpModal";
import { useSelector } from "react-redux";
import type { RootState } from "redux/store";
import { useMutation } from "@tanstack/react-query";
import { sendOtp, verifyOtp } from "services/authServices";
import { useDelay } from "hooks/useDelay";

function ForgetOtp() {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor, subText, borderColor } = getColors(theme);
  const insets = useSafeAreaInsets();
  const isDark  = theme === "dark";
  const router  = useRouter();

  const cardBg   = isDark ? "#1F2937" : "#FFFFFF";
  const border   = isDark ? "#374151" : "#E5E7EB";
  const textMain = isDark ? "#F9FAFB" : "#111827";

  const email = useSelector((s: RootState) => s.auth.registrationData?.email ?? "");
  const maskedEmail = email.length > 4
    ? email.slice(0, 2) + "***" + email.slice(email.indexOf("@"))
    : email;

  const RESEND_TIMER = 60;
  const [countdown, setCountdown]     = useState(RESEND_TIMER);
  const [canResend, setCanResend]     = useState(false);
  const [otpEmail, setOtpEmail]       = useState("");
  const [showModal, setShowModal]     = useState(false);
  const [errorMessage, setErrorMessage]   = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shouldProceed, setShouldProceed]  = useState(false);
  const endTimeRef = useRef<number>(Date.now() + RESEND_TIMER * 1000);

  useEffect(() => {
    if (errorMessage) {
      const t = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) setCanResend(true);
    };
    const interval = setInterval(tick, 1000);
    tick();
    const sub = AppState.addEventListener("change", (s: AppStateStatus) => { if (s === "active") tick(); });
    return () => { clearInterval(interval); sub.remove(); };
  }, [endTimeRef.current]);

  useDelay(() => { if (shouldProceed) setShowModal(true); }, 2000, [shouldProceed]);

  const mutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      if (data.status) setShouldProceed(true);
      else setErrorMessage(data.message || "Incorrect code. Please try again.");
    },
    onError: (error: any) => {
      setErrorMessage(error?.response?.data?.message || error?.message || "An unexpected error occurred");
    },
  });

  const resendMutation = useMutation({
    mutationFn: sendOtp,
    onSuccess: (data) => {
      if (data.status) setSuccessMessage("A new code has been sent to your email");
      else setErrorMessage("Could not resend OTP. Please try again.");
    },
    onError: (error: any) => {
      setErrorMessage(error?.response?.data?.message || error?.message || "An unexpected error occurred");
    },
  });

  const handleResend = () => {
    endTimeRef.current = Date.now() + RESEND_TIMER * 1000;
    setCountdown(RESEND_TIMER);
    setCanResend(false);
    if (!email) { setErrorMessage("Email not found. Please go back."); return; }
    resendMutation.mutate({ email, type: "EMAIL", reason: "forgot_password" });
  };

  const handleVerify = () => {
    if (!otpEmail) { setErrorMessage("Please enter the verification code"); return; }
    mutation.mutate({ emailCode: { email, code: otpEmail } });
  };

  return (
    <>
      {successMessage && <AlertMessageBanner type="success" message={successMessage} />}
      {errorMessage   && <AlertMessageBanner type="error"   message={errorMessage}   />}

      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={[styles.root, { backgroundColor }]}>
        {/* Top accent strip */}
        <View style={[styles.strip, { backgroundColor: primaryColor }]} />

        {showModal && (
          <SliderModal
            setshowmodal={setShowModal}
            showmodal={showModal}
            route="/createnewpasswordscreen"
            title="Email Verified ✓"
          />
        )}

        <View style={[styles.content, { paddingTop: insets.top + 20 }]}>
          {/* Back */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={primaryTextColor} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.headerSection}>
            <View style={[styles.iconRing, { backgroundColor: primaryColor + "15", borderColor: primaryColor + "30" }]}>
              <Ionicons name="mail-open-outline" size={32} color={primaryColor} />
            </View>
            <Text style={[styles.heading, { color: primaryTextColor }]}>Check Your Email</Text>
            <Text style={[styles.subheading, { color: subText }]}>
              We sent a 4-digit code to
            </Text>
            <Text style={[styles.emailText, { color: primaryColor }]}>{maskedEmail}</Text>
          </View>

          {/* Steps */}
          <View style={styles.stepsRow}>
            {["Enter Email", "Verify OTP", "New Password"].map((s, i) => (
              <View key={i} style={styles.stepItem}>
                <View style={[styles.stepDot, {
                  backgroundColor: i <= 1 ? primaryColor : isDark ? "#374151" : "#E5E7EB",
                }]}>
                  {i < 1
                    ? <Ionicons name="checkmark" size={12} color="#fff" />
                    : <Text style={[styles.stepNum, { color: i === 1 ? "#fff" : subText }]}>{i + 1}</Text>
                  }
                </View>
                <Text style={[styles.stepLabel, { color: i === 1 ? primaryColor : subText }]}>{s}</Text>
                {i < 2 && <View style={[styles.stepLine, { backgroundColor: i < 1 ? primaryColor : isDark ? "#374151" : "#E5E7EB" }]} />}
              </View>
            ))}
          </View>

          {/* OTP card */}
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
            <Text style={[styles.otpHint, { color: subText }]}>Enter the 4-digit code below</Text>

            <OtpComponent
              onOtpComplete={(v: string) => setOtpEmail(v)}
              textcolor={subText}
              text=""
            />

            {/* Resend row */}
            <View style={styles.resendRow}>
              {canResend ? (
                <TouchableOpacity onPress={handleResend} disabled={resendMutation.isPending}>
                  <Text style={[styles.resendLink, { color: primaryColor }]}>
                    {resendMutation.isPending ? "Sending…" : "Resend Code"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.countdownRow}>
                  <Ionicons name="time-outline" size={14} color={subText} />
                  <Text style={[styles.countdownText, { color: subText }]}>
                    Resend in {countdown}s
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={{ marginTop: 24 }}>
            <ButtonComponent
              color={primaryColor}
              text={mutation.isPending ? "Verifying…" : "Verify Code"}
              textcolor="#fff"
              onPress={handleVerify}
              isLoading={mutation.isPending}
              disabled={!otpEmail || mutation.isPending}
            />
          </View>

          <TouchableOpacity onPress={() => router.back()} style={styles.loginRow}>
            <Ionicons name="arrow-back-outline" size={14} color={primaryColor} />
            <Text style={[styles.loginLink, { color: primaryColor }]}>Back to Email Step</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1 },
  strip:   { height: 4, width: "100%" },
  content: { flex: 1, paddingHorizontal: 24 },

  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", marginBottom: 8 },

  headerSection: { alignItems: "center", marginBottom: 24 },
  iconRing: {
    width: 88, height: 88, borderRadius: 24, borderWidth: 1.5,
    justifyContent: "center", alignItems: "center", marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 4,
  },
  heading:    { fontSize: 22, fontWeight: "700", fontFamily: "TTFirsNeueMedium" },
  subheading: { fontSize: 13, fontFamily: "TTFirsNeue", marginTop: 6 },
  emailText:  { fontSize: 15, fontWeight: "700", fontFamily: "TTFirsNeueMedium", marginTop: 4 },

  stepsRow:  { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  stepItem:  { flexDirection: "row", alignItems: "center" },
  stepDot:   { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  stepNum:   { fontSize: 11, fontWeight: "700" },
  stepLabel: { fontSize: 11, fontFamily: "TTFirsNeue", marginHorizontal: 6 },
  stepLine:  { width: 20, height: 2, borderRadius: 1 },

  card: {
    borderRadius: 20, borderWidth: 1, padding: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    alignItems: "center",
  },
  otpHint:      { fontSize: 13, fontFamily: "TTFirsNeue", marginBottom: 16 },
  resendRow:    { marginTop: 20, alignItems: "center" },
  countdownRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  countdownText: { fontSize: 13, fontFamily: "TTFirsNeue" },
  resendLink:    { fontSize: 14, fontWeight: "700", fontFamily: "TTFirsNeueMedium" },

  loginRow:  { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 20 },
  loginLink: { fontSize: 14, fontWeight: "600", fontFamily: "TTFirsNeueMedium" },
});

export default ForgetOtp;
