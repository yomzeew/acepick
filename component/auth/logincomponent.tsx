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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { getColors } from "../../static/color";
import { StatusBar } from "expo-status-bar";
import InputComponent from "../controls/textinput";
import { useRouter } from "expo-router";
import PasswordComponent from "../controls/passwordinput";
import { AntDesign } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { loginUser } from "services/authServices";
import { RootState } from "../../redux/store";
import { setUser, setToken } from "redux/slices/authSlice";
import { useMutation } from "@tanstack/react-query";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import { useSecureAuth } from "hooks/useSecureAuth";
import Checkbox from "../controls/checkbox";

function LoginComponent() {
  const { theme } = useTheme();
  const {
    primaryColor,
    backgroundColor,
    primaryTextColor,
    secondaryTextColor,
  } = getColors(theme);
  const insets = useSafeAreaInsets();
  const { saveAuthData, getRememberedCredentials, saveRememberedCredentials } =
    useSecureAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
  }, [getRememberedCredentials]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async (response) => {
      const { user, token } = response.data;

      await saveRememberedCredentials(email, password, rememberMe);
      await saveAuthData(user, token);
      dispatch(setUser(user));
      dispatch(setToken(token));

      console.log("login success:", user);
      if (user.role === "client") {
        router.replace("/homelayout");
      } else if (user.role === "delivery") {
        router.replace("/deliverydashboardlayout");
      } else {
        router.replace("/homeprofessionalayout");
      }
    },
    onError: (error: any) => {
      let msg = "An unexpected error occurred";

      if (
        error?.code === "ERR_NETWORK" ||
        error?.message === "Network Error"
      ) {
        msg =
          "Unable to connect to server. Please check your internet connection and try again.";
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
          msg =
            "Too many login attempts. Please wait a moment and try again.";
        } else if (status >= 500) {
          msg =
            "Server is temporarily unavailable. Please try again later.";
        } else {
          msg =
            data?.message || data?.error || `Request failed (${status})`;
        }
      } else if (error?.request) {
        msg = "Server is not responding. Please try again later.";
      } else if (error?.message) {
        msg = error.message;
      }

      setErrorMessage(msg);
      console.error("Login failed:", msg);
    },
  });

  const handleSign = () => {
    setErrorMessage(null);
    if (!email) {
      setErrorMessage("Please Enter Email");
      return;
    }
    if (!password) {
      setErrorMessage("Please Enter Password");
      return;
    }
    mutation.mutate({ email, password });
  };

  const pillStyle = (isActive?: boolean) => ({
    backgroundColor: isActive
      ? primaryColor
      : theme === "dark"
      ? "#2a2a2a"
      : "#f5f5f5",
    borderColor: primaryColor,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  });

  return (
    <>
      {errorMessage && (
        <AlertMessageBanner type="error" message={errorMessage} />
      )}

      <View
        style={{
          flex: 1,
          backgroundColor,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <StatusBar style="auto" />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: 24,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {/* ── Back button ─────────────────────────────── */}
              <View style={{ marginTop: 16 }}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: primaryColor + "40",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: theme === "dark" ? "#1a1a1a" : "#fafafa",
                  }}
                >
                  <AntDesign
                    name="left"
                    size={18}
                    color={secondaryTextColor}
                  />
                </TouchableOpacity>
              </View>

              {/* ── Title section ───────────────────────────── */}
              <View style={{ marginTop: 32, marginBottom: 8 }}>
                <Text
                  style={{
                    color: primaryTextColor,
                    fontSize: 28,
                    fontWeight: "700",
                    fontFamily: "TTFirsNeueMedium",
                  }}
                >
                  Welcome Back
                </Text>
                <Text
                  style={{
                    color: secondaryTextColor,
                    fontSize: 15,
                    marginTop: 6,
                    lineHeight: 22,
                    fontFamily: "TTFirsNeue",
                  }}
                >
                  Sign in to your client account
                </Text>
              </View>

              {/* ── Form ────────────────────────────────────── */}
              <View style={{ marginTop: 28, gap: 16 }}>
                <InputComponent
                  value={email}
                  onChange={(text) => setEmail(text)}
                  color={primaryColor}
                  placeholder="Email"
                  placeholdercolor={secondaryTextColor}
                  keyboardType="email-address"
                />
                <PasswordComponent
                  value={password}
                  onChange={(text) => setPassword(text)}
                  color={primaryColor}
                  placeholder="Password"
                  placeholdercolor={secondaryTextColor}
                />
              </View>

              {/* ── Forgot password + Remember me ────────────── */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Checkbox isChecked={rememberMe} onToggle={setRememberMe} />
                  <Text
                    style={{
                      color: secondaryTextColor,
                      fontSize: 14,
                      marginLeft: 8,
                      fontFamily: "TTFirsNeue",
                    }}
                  >
                    Remember Me
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.navigate("/recoverpasswordscreen")}
                >
                  <Text
                    style={{
                      color: primaryColor,
                      fontSize: 14,
                      fontWeight: "500",
                      fontFamily: "TTFirsNeueMedium",
                    }}
                  >
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ── Login button ────────────────────────────── */}
              <TouchableOpacity
                disabled={!email || !password || mutation.isPending}
                style={{
                  backgroundColor: primaryColor,
                  opacity:
                    !email || !password || mutation.isPending ? 0.55 : 1,
                  height: 56,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 28,
                  shadowColor: primaryColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={handleSign}
              >
                {mutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 17,
                      fontWeight: "700",
                      fontFamily: "TTFirsNeueMedium",
                    }}
                  >
                    Login
                  </Text>
                )}
              </TouchableOpacity>

              {/* ── Spacer to push bottom content down ─────── */}
              <View style={{ flex: 1, minHeight: 32 }} />

              {/* ── Register link ───────────────────────────── */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <Text
                  style={{
                    color: secondaryTextColor,
                    fontSize: 14,
                    fontFamily: "TTFirsNeue",
                  }}
                >
                  Don't have an account?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => router.navigate("/onboarding-client")}
                >
                  <Text
                    style={{
                      color: primaryColor,
                      fontSize: 14,
                      fontWeight: "700",
                      fontFamily: "TTFirsNeueMedium",
                    }}
                  >
                    Register Now
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ── Switch account ──────────────────────────── */}
              <View
                style={{
                  alignItems: "center",
                  marginTop: 24,
                  paddingBottom: 24,
                }}
              >
                <Text
                  style={{
                    color: secondaryTextColor,
                    fontSize: 13,
                    marginBottom: 12,
                    fontFamily: "TTFirsNeue",
                  }}
                >
                  Switch to:
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 12,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => router.navigate("/loginprofession")}
                    style={pillStyle()}
                  >
                    <Text
                      style={{
                        color: primaryColor,
                        fontSize: 13,
                        fontWeight: "600",
                        fontFamily: "TTFirsNeueMedium",
                      }}
                    >
                      Professional
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.navigate("/loginprofession")}
                    style={pillStyle()}
                  >
                    <Text
                      style={{
                        color: primaryColor,
                        fontSize: 13,
                        fontWeight: "600",
                        fontFamily: "TTFirsNeueMedium",
                      }}
                    >
                      Delivery
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

export default LoginComponent;
