import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { getColors } from "../../static/color";
import { StatusBar } from "expo-status-bar";
import InputComponent from "../controls/textinput";
import { useRouter } from "expo-router";
import PasswordComponent from "../controls/passwordinput";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useCallback } from "react";
import { loginUser } from "services/authServices";
import { RootState } from "../../redux/store";
import { setUser, setToken } from "redux/slices/authSlice";
import { useMutation } from "@tanstack/react-query";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import { useSecureAuth } from "hooks/useSecureAuth";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "../controls/checkbox";
import RolePickerModal from "./RolePickerModal";
import { getAvailableRolesFn, RoleOption } from "services/roleSwitchService";
import AcePick from "../../assets/acepick.svg";

function LoginComponent() {
  const { theme } = useTheme();
  const {
    primaryColor,
    backgroundColor,
    primaryTextColor,
    secondaryTextColor,
    subText,
    borderColor,
  } = getColors(theme);
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";

  const {
    saveAuthData,
    getAuthData,
    getRememberedCredentials,
    saveRememberedCredentials,
    isBiometricAvailable,
    getBiometricType,
    authenticateWithBiometrics,
    isBiometricEnabled,
    setBiometricEnabled,
  } = useSecureAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<RoleOption[]>([]);
  const [pendingAuth, setPendingAuth] = useState<{ user: any; token: string } | null>(null);
  const [biometricType, setBiometricType] = useState<"fingerprint" | "face" | "iris" | null>(null);
  const [biometricReady, setBiometricReady] = useState(false);

  useEffect(() => {
    const loadCredentials = async () => {
      const credentials = await getRememberedCredentials();
      if (credentials.rememberMe) {
        setEmail(credentials.email);
        setPassword(credentials.password);
        setRememberMe(true);
      }
    };
    loadCredentials();
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    const checkBiometrics = async () => {
      const available = await isBiometricAvailable();
      const enabled = await isBiometricEnabled();
      if (available && enabled) {
        const type = await getBiometricType();
        setBiometricType(type);
        setBiometricReady(true);
      }
    };
    checkBiometrics();
  }, []);

  const router = useRouter();
  const dispatch = useDispatch();

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async (response) => {
      const { user, token } = response.data;
      await saveRememberedCredentials(email, password, rememberMe);
      await saveAuthData(user, token);

      const available = await isBiometricAvailable();
      const alreadyEnabled = await isBiometricEnabled();
      if (available && !alreadyEnabled) {
        const type = await getBiometricType();
        const label = type === "face" ? "Face ID" : "Fingerprint";
        Alert.alert(
          `Enable ${label}`,
          `Would you like to use ${label} to sign in faster next time?`,
          [
            { text: "Not Now", style: "cancel" },
            {
              text: "Enable",
              onPress: async () => {
                await setBiometricEnabled(true);
                setBiometricType(type);
                setBiometricReady(true);
              },
            },
          ]
        );
      }
      await navigateAfterLogin(user, token);
    },
    onError: (error: any) => {
      let msg = "An unexpected error occurred";
      if (error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
        msg = "Unable to connect to server. Please check your internet connection and try again.";
      } else if (error?.response) {
        const status = error.response.status;
        const data = error.response.data;
        if (status === 401 || status === 400) {
          const backendMsg = data?.message || data?.error || "";
          const normalized = backendMsg.toLowerCase();
          if (
            normalized.includes("user does not exist") ||
            normalized.includes("invalid password") ||
            normalized.includes("wrong password") ||
            normalized.includes("not found") ||
            normalized.includes("invalid credentials") ||
            normalized.includes("unauthorized")
          ) {
            msg = "Invalid email or password";
          } else {
            msg = backendMsg || "Invalid email or password";
          }
        } else if (status === 429) {
          msg = "Too many login attempts. Please wait a moment and try again.";
        } else if (status >= 500) {
          msg = "Server is temporarily unavailable. Please try again later.";
        } else {
          msg = data?.message || data?.error || `Request failed (${status})`;
        }
      } else if (error?.request) {
        msg = "Server is not responding. Please try again later.";
      } else if (error?.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    },
  });

  const navigateAfterLogin = useCallback(async (user: any, token: string) => {
    try {
      const rolesData = await getAvailableRolesFn(token);
      const active = rolesData.roles.filter(
        (r: any) => r.available && r.role !== "corperate"
      );
      if (active.length > 1) {
        setPendingAuth({ user, token });
        setAvailableRoles(rolesData.roles);
        setShowRolePicker(true);
        return;
      }
    } catch {}
    await saveAuthData(user, token);
    dispatch(setUser(user));
    dispatch(setToken(token));
    const dest =
      user.role === "professional"
        ? "/(Authenticated)/(professionalLayout)/(professionaldashboard)/homeprofessionalayout"
        : user.role === "delivery"
        ? "/(Authenticated)/(delivery)/deliverydashboardlayout"
        : "/(Authenticated)/(dashboard)/homelayout";
    router.replace(dest as any);
  }, []);

  const handleBiometricLogin = async () => {
    try {
      const label = biometricType === "face" ? "Face ID" : "Fingerprint";
      const passed = await authenticateWithBiometrics(`Sign in with ${label}`);
      if (!passed) return;
      const stored = await getAuthData();
      if (!stored) {
        Alert.alert("Session Expired", "Please sign in with your email and password.");
        return;
      }
      dispatch(setUser(stored.user));
      dispatch(setToken(stored.token));
      const dest =
        stored.user.role === "professional"
          ? "/(Authenticated)/(professionalLayout)/(professionaldashboard)/homeprofessionalayout"
          : stored.user.role === "delivery"
          ? "/(Authenticated)/(delivery)/deliverydashboardlayout"
          : "/(Authenticated)/(dashboard)/homelayout";
      router.replace(dest as any);
    } catch {
      setErrorMessage("Biometric authentication failed. Please try again.");
    }
  };

  const handleSign = () => {
    setErrorMessage(null);
    if (!email) { setErrorMessage("Please enter your email"); return; }
    if (!password) { setErrorMessage("Please enter your password"); return; }
    mutation.mutate({ email, password });
  };

  const cardBg = isDark ? "#1F2937" : "#FFFFFF";

  return (
    <>
      {errorMessage && <AlertMessageBanner type="error" message={errorMessage} />}

      {pendingAuth && (
        <RolePickerModal
          visible={showRolePicker}
          roles={availableRoles}
          currentRole={pendingAuth.user.role}
          pendingUser={pendingAuth.user}
          pendingToken={pendingAuth.token}
          onClose={() => setShowRolePicker(false)}
        />
      )}

      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={[styles.root, { backgroundColor }]}>
        {/* ── Top accent strip ── */}
        <View style={[styles.topStrip, { backgroundColor: primaryColor }]} />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={[
                styles.scroll,
                { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {/* ── Logo + brand ── */}
              <View style={styles.logoSection}>
                <View style={[styles.logoRing, { borderColor: primaryColor + "30", backgroundColor: isDark ? "#111827" : "#fff" }]}>
                  <AcePick width={64} height={64} />
                </View>
                <Text style={[styles.brandName, { color: primaryColor }]}>AcePick</Text>
                <Text style={[styles.tagline, { color: subText }]}>
                  Your gateway to skilled professionals
                </Text>
              </View>

              {/* ── Form card ── */}
              <View style={[styles.card, {
                backgroundColor: cardBg,
                shadowColor: isDark ? "#000" : primaryColor,
                borderColor: isDark ? "#374151" : "#E5E7EB",
              }]}>
                <Text style={[styles.cardTitle, { color: primaryTextColor }]}>
                  Welcome Back 👋
                </Text>
                <Text style={[styles.cardSubtitle, { color: subText }]}>
                  Sign in to your client account
                </Text>

                {/* Inputs */}
                <View style={{ marginTop: 24, gap: 14 }}>
                  <InputComponent
                    value={email}
                    onChange={setEmail}
                    color={primaryColor}
                    placeholder="Email address"
                    placeholdercolor={subText}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={true}
                  />
                  <PasswordComponent
                    value={password}
                    onChange={setPassword}
                    color={primaryColor}
                    placeholder="Password"
                    placeholdercolor={subText}
                  />
                </View>

                {/* Remember me + Forgot */}
                <View style={styles.rememberRow}>
                  <View style={styles.rememberLeft}>
                    <Checkbox isChecked={rememberMe} onToggle={setRememberMe} />
                    <Text style={[styles.rememberText, { color: secondaryTextColor }]}>
                      Remember me
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => router.navigate("/recoverpasswordscreen")}>
                    <Text style={[styles.forgotText, { color: primaryColor }]}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Login button */}
                <TouchableOpacity
                  disabled={!email || !password || mutation.isPending}
                  onPress={handleSign}
                  style={[
                    styles.loginBtn,
                    {
                      backgroundColor: primaryColor,
                      opacity: !email || !password || mutation.isPending ? 0.5 : 1,
                      shadowColor: primaryColor,
                    },
                  ]}
                >
                  {mutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.loginBtnText}>Sign In</Text>
                  )}
                </TouchableOpacity>

                {/* Biometric */}
                {biometricReady && (
                  <>
                    <View style={[styles.dividerRow, { marginTop: 16 }]}>
                      <View style={[styles.divider, { backgroundColor: borderColor }]} />
                      <Text style={[styles.dividerText, { color: subText }]}>or</Text>
                      <View style={[styles.divider, { backgroundColor: borderColor }]} />
                    </View>
                    <TouchableOpacity
                      onPress={handleBiometricLogin}
                      style={[styles.biometricBtn, {
                        borderColor: primaryColor + "50",
                        backgroundColor: isDark ? "#111827" : primaryColor + "08",
                      }]}
                    >
                      <Ionicons
                        name={biometricType === "face" ? "scan-outline" : "finger-print-outline"}
                        size={22}
                        color={primaryColor}
                      />
                      <Text style={[styles.biometricText, { color: primaryColor }]}>
                        Sign in with {biometricType === "face" ? "Face ID" : "Fingerprint"}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* ── Register link ── */}
              <View style={styles.registerRow}>
                <Text style={[styles.registerText, { color: subText }]}>
                  Don't have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.navigate("/onboarding-client")}>
                  <Text style={[styles.registerLink, { color: primaryColor }]}>
                    Register Now
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ── Switch role pills ── */}
              <View style={styles.switchSection}>
                <Text style={[styles.switchLabel, { color: subText }]}>Switch to:</Text>
                <View style={styles.pillRow}>
                  {[
                    { label: "Professional", route: "/loginprofession" },
                    { label: "Delivery", route: "/loginprofession" },
                  ].map(({ label, route }) => (
                    <TouchableOpacity
                      key={label}
                      onPress={() => router.navigate(route as any)}
                      style={[styles.pill, {
                        borderColor: primaryColor + "60",
                        backgroundColor: isDark ? "#111827" : "#fff",
                      }]}
                    >
                      <Text style={[styles.pillText, { color: primaryColor }]}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topStrip: { height: 4, width: "100%" },
  scroll: { paddingHorizontal: 24, flexGrow: 1 },

  logoSection: { alignItems: "center", marginBottom: 28 },
  logoRing: {
    width: 96, height: 96, borderRadius: 28,
    borderWidth: 1.5, alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  brandName: { fontSize: 22, fontWeight: "800", marginTop: 12, fontFamily: "TTFirsNeueMedium" },
  tagline: { fontSize: 13, marginTop: 4, fontFamily: "TTFirsNeue" },

  card: {
    borderRadius: 24, padding: 24, borderWidth: 1,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  cardTitle: { fontSize: 22, fontWeight: "700", fontFamily: "TTFirsNeueMedium" },
  cardSubtitle: { fontSize: 14, marginTop: 4, fontFamily: "TTFirsNeue" },

  rememberRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: 14,
  },
  rememberLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  rememberText: { fontSize: 13, fontFamily: "TTFirsNeue" },
  forgotText: { fontSize: 13, fontWeight: "600", fontFamily: "TTFirsNeueMedium" },

  loginBtn: {
    height: 54, borderRadius: 14, alignItems: "center",
    justifyContent: "center", marginTop: 24,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "TTFirsNeueMedium" },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  divider: { flex: 1, height: 1 },
  dividerText: { fontSize: 12, fontFamily: "TTFirsNeue" },

  biometricBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 13, borderRadius: 14, borderWidth: 1,
  },
  biometricText: { fontSize: 14, fontWeight: "600", fontFamily: "TTFirsNeueMedium" },

  registerRow: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", marginTop: 28,
  },
  registerText: { fontSize: 14, fontFamily: "TTFirsNeue" },
  registerLink: { fontSize: 14, fontWeight: "700", fontFamily: "TTFirsNeueMedium" },

  switchSection: { alignItems: "center", marginTop: 24 },
  switchLabel: { fontSize: 12, fontFamily: "TTFirsNeue", marginBottom: 10 },
  pillRow: { flexDirection: "row", gap: 10 },
  pill: {
    paddingHorizontal: 20, paddingVertical: 9,
    borderRadius: 50, borderWidth: 1,
  },
  pillText: { fontSize: 13, fontWeight: "600", fontFamily: "TTFirsNeueMedium" },
});

export default LoginComponent;
