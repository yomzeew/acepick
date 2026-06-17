import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";
import { useDebounce } from "hooks/useDebounce";
import { useDelay } from "hooks/useDelay";
import PasswordComponent from "component/controls/passwordinput";
import ButtonComponent from "component/buttoncomponent";
import { useMutation } from "@tanstack/react-query";
import { registerUser, registerArtisan, registerCorporate, registerRider } from "services/authServices";
import { clearRegistrationData } from "redux/slices/authSlice";
import { useToast } from "context/ToastContext";
import { useRouter } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";

type RoleType = "client" | "artisan" | "corperate" | "delivery";

interface PasswordStepProps {
  role: RoleType;
  onComplete: () => void;
}

// ── Terms content ──────────────────────────────────────────────────────────────
const TERMS_SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing and using Acepick, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree, please do not use our services.",
  },
  {
    title: "2. Use of the Platform",
    body: "Acepick connects clients with skilled professionals and delivery riders. You agree to use the platform only for lawful purposes and in a way that does not infringe the rights of others.",
  },
  {
    title: "3. Account Responsibility",
    body: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
  },
  {
    title: "4. Payments & Transactions",
    body: "All transactions are processed securely through Acepick. Payments are held in escrow and released upon job completion approval. Acepick is not liable for disputes arising from the quality of services rendered.",
  },
  {
    title: "5. Privacy",
    body: "We collect only the information necessary to provide our services. Your data is encrypted, never sold to third parties, and used solely to improve your experience on Acepick.",
  },
  {
    title: "6. Termination",
    body: "We may suspend or terminate your account immediately, without notice, if you breach these Terms. You may also delete your account at any time from the settings page.",
  },
  {
    title: "7. Limitation of Liability",
    body: "Acepick shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform beyond the amount paid by you in the last 30 days.",
  },
  {
    title: "8. Governing Law",
    body: "These terms are governed by and construed in accordance with the laws of Nigeria. Any disputes shall be subject to the exclusive jurisdiction of the courts in Nigeria.",
  },
];

const PRIVACY_SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "We collect your name, email, phone number, location, and profile information when you register and use Acepick.",
  },
  {
    title: "2. How We Use Your Information",
    body: "Your data is used to provide services, process transactions, send notifications, and improve the Acepick platform.",
  },
  {
    title: "3. Information Sharing",
    body: "We do not sell your personal information. We share only what is necessary — for example, your name and rating are visible to clients or professionals you work with.",
  },
  {
    title: "4. Data Security",
    body: "We implement industry-standard encryption and security measures to protect your personal information at rest and in transit.",
  },
  {
    title: "5. Your Rights",
    body: "You may access, update, or delete your personal information at any time from your profile settings. You can also contact support to request data removal.",
  },
  {
    title: "6. Children's Privacy",
    body: "Acepick is not intended for users under 18. We do not knowingly collect personal information from minors.",
  },
];

// ── TermsModal ─────────────────────────────────────────────────────────────────
const TermsModal = ({
  visible,
  onClose,
  onAccept,
  primaryColor,
  isDark,
}: {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  primaryColor: string;
  isDark: boolean;
}) => {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");
  const bg = isDark ? "#111827" : "#F9FAFB";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const border = isDark ? "#374151" : "#E5E7EB";
  const sections = activeTab === "terms" ? TERMS_SECTIONS : PRIVACY_SECTIONS;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.modalSafe, { backgroundColor: bg }]}>
        {/* ── Header ── */}
        <View style={[styles.modalHeader, { borderBottomColor: border }]}>
          <TouchableOpacity onPress={onClose} style={styles.modalClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="x" size={22} color={textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: textPrimary }]}>Terms & Privacy</Text>
          <View style={{ width: 30 }} />
        </View>

        {/* ── Tab switcher ── */}
        <View style={[styles.tabRow, { backgroundColor: cardBg, borderBottomColor: border }]}>
          {(["terms", "privacy"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                activeTab === tab && { borderBottomColor: primaryColor, borderBottomWidth: 2.5 },
              ]}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === tab ? primaryColor : textSecondary },
              ]}>
                {tab === "terms" ? "Terms of Service" : "Privacy Policy"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Content ── */}
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Icon + title */}
          <View style={styles.modalHero}>
            <View style={[styles.modalHeroIcon, { backgroundColor: primaryColor + "18" }]}>
              <MaterialIcons
                name={activeTab === "terms" ? "gavel" : "privacy-tip"}
                size={28}
                color={primaryColor}
              />
            </View>
            <Text style={[styles.modalHeroTitle, { color: textPrimary }]}>
              {activeTab === "terms" ? "Terms of Service" : "Privacy Policy"}
            </Text>
            <Text style={[styles.modalHeroSub, { color: textSecondary }]}>
              Last updated: January 2025
            </Text>
          </View>

          {/* Sections */}
          {sections.map((s, i) => (
            <View key={i} style={[styles.sectionCard, { backgroundColor: cardBg, borderColor: border }]}>
              <Text style={[styles.sectionTitle, { color: primaryColor }]}>{s.title}</Text>
              <Text style={[styles.sectionBody, { color: textSecondary }]}>{s.body}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ── Accept button ── */}
        <View style={[styles.modalFooter, { backgroundColor: bg, borderTopColor: border }]}>
          <TouchableOpacity
            onPress={onAccept}
            style={[styles.acceptBtn, { backgroundColor: primaryColor }]}
            activeOpacity={0.85}
          >
            <Feather name="check-circle" size={18} color="#fff" />
            <Text style={styles.acceptBtnText}>I Accept These Terms</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 10, alignItems: "center" }}>
            <Text style={[styles.declineText, { color: textSecondary }]}>Decline</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// ── PasswordStep ───────────────────────────────────────────────────────────────
const PasswordStep = ({ role, onComplete }: PasswordStepProps) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  const isDark = theme === "dark";
  const toast = useToast();
  const router = useRouter();

  const registerData = useSelector((state: RootState) => state.auth.registrationData);
  const corporateData = useSelector((state: RootState) => state.auth.cooperationData);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [shouldProceed, setShouldProceed] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const dispatch = useDispatch();

  const debouncedConfirmPassword = useDebounce(confirmPassword, 500);

  useEffect(() => {
    if (debouncedConfirmPassword.length > 0 && password !== debouncedConfirmPassword) {
      setPasswordMismatch(true);
    } else {
      setPasswordMismatch(false);
    }
  }, [debouncedConfirmPassword, password]);

  useDelay(
    () => {
      if (shouldProceed) {
        dispatch(clearRegistrationData());
        if (role === "artisan" || role === "corperate") {
          router.replace("/loginprofession");
        } else if (role === "delivery") {
          router.replace("/loginprofession");
        } else {
          router.replace("/loginscreen");
        }
      }
    },
    2000,
    [shouldProceed]
  );

  const getRegisterFn = () => {
    switch (role) {
      case "client": return registerUser;
      case "artisan": return registerArtisan;
      case "corperate": return registerCorporate;
      case "delivery": return registerRider;
      default: return registerUser;
    }
  };

  const mutation = useMutation({
    mutationFn: getRegisterFn(),
    onSuccess: () => {
      toast.success("Account Created", "Your account has been created successfully!");
      setShouldProceed(true);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "An unexpected error occurred";
      toast.error("Registration Failed", msg);
    },
  });

  const handleRegister = () => {
    if (!isChecked) {
      toast.error("Terms Required", "You must agree to the Terms and Conditions");
      return;
    }
    if (!password || !confirmPassword) {
      toast.error("Missing Fields", "Please fill in both password fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Mismatch", "Passwords do not match");
      return;
    }
    if (!registerData?.firstName || !registerData?.lastName || !registerData?.email || !registerData?.phone) {
      toast.error("Incomplete", "Please complete all required fields");
      return;
    }

    let payload: any;
    if (role === "corperate") {
      payload = { ...registerData, password, confirmPassword, role, agreed: isChecked, cooperation: corporateData };
    } else if (role === "delivery") {
      const { vehicleType, licenseNumber, plateNumber, ...rest } = registerData as any;
      payload = { ...rest, password, confirmPassword, agreed: isChecked, rider: { vehicleType, licenseNumber } };
    } else {
      payload = { ...registerData, password, confirmPassword, role, agreed: isChecked };
    }

    mutation.mutate(payload);
  };

  const handleAcceptTerms = () => {
    setIsChecked(true);
    setShowTermsModal(false);
  };

  return (
    <>
      {/* ── Terms Modal ── */}
      <TermsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleAcceptTerms}
        primaryColor={primaryColor}
        isDark={isDark}
      />

      <View className="flex-1 w-full px-2">
        <View className="mt-6 items-center">
          <PasswordComponent
            color={primaryColor}
            placeholder="Create Password"
            placeholdercolor={secondaryTextColor}
            onChange={setPassword}
            value={password}
          />
          <View className="h-3" />
          <PasswordComponent
            color={primaryColor}
            placeholder="Confirm Password"
            placeholdercolor={secondaryTextColor}
            onChange={setConfirmPassword}
            value={confirmPassword}
          />
        </View>

        {/* ── Agreement row ── */}
        <View style={styles.agreementRow}>
          {/* Checkbox */}
          <TouchableOpacity
            onPress={() => {
              if (!isChecked) {
                // Open terms so user can read before accepting
                setShowTermsModal(true);
              } else {
                setIsChecked(false);
              }
            }}
            style={[
              styles.checkbox,
              {
                borderColor: primaryColor,
                backgroundColor: isChecked ? primaryColor : "transparent",
              },
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isChecked && <Feather name="check" size={12} color="#fff" />}
          </TouchableOpacity>

          {/* Label */}
          <Text style={[styles.agreementText, { color: primaryTextColor }]}>
            I have read and agree to the{" "}
            <Text
              style={[styles.agreementLink, { color: primaryColor }]}
              onPress={() => setShowTermsModal(true)}
            >
              Terms & Conditions
            </Text>
            {" "}and{" "}
            <Text
              style={[styles.agreementLink, { color: primaryColor }]}
              onPress={() => setShowTermsModal(true)}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>

      <View className="w-full px-5 pb-6">
        <ButtonComponent
          color={primaryColor}
          text="Register"
          textcolor="#fff"
          onPress={handleRegister}
          isLoading={mutation.isPending}
          disabled={!password || !confirmPassword}
        />
      </View>
    </>
  );
};

export default PasswordStep;

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  agreementRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.8,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  agreementText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  agreementLink: {
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  // Modal
  modalSafe: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalClose: { width: 30, alignItems: "flex-start" },
  modalTitle: { fontSize: 17, fontWeight: "700" },

  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2.5,
    borderBottomColor: "transparent",
  },
  tabText: { fontSize: 13, fontWeight: "600" },

  modalHero: { alignItems: "center", marginBottom: 20 },
  modalHeroIcon: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  modalHeroTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  modalHeroSub: { fontSize: 12 },

  sectionCard: {
    borderRadius: 14, borderWidth: 1,
    padding: 14, marginBottom: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: "700", marginBottom: 6 },
  sectionBody: { fontSize: 13, lineHeight: 20 },

  modalFooter: {
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28,
    borderTopWidth: 1,
  },
  acceptBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 16, paddingVertical: 16,
  },
  acceptBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  declineText: { fontSize: 13 },
});
