import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "hooks/useTheme";
import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { getColors } from "static/color";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";
import { logoutAsync } from "redux/slices/authSlice";
import ChatCacheService from "services/chatCache";
import { useSecureAuth } from "hooks/useSecureAuth";
import { useEffect, useState } from "react";

const DeliverySettings = () => {
  const { theme, toggleTheme } = useTheme();
  const { primaryColor, backgroundColortwo } = getColors(theme);
  const router = useRouter();
  const dispatch = useDispatch();
  const { isBiometricAvailable, isBiometricEnabled, setBiometricEnabled } = useSecureAuth();
  const user = useSelector((state: RootState) => state?.auth?.user);
  const profile = user?.profile;
  const totalDisputes = profile?.totalDisputes || 0;
  const totalReviews = profile?.totalReview || 0;

  const isDark = theme === "dark";
  const bgColor = isDark ? "#111827" : "#F3F4F6";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const dividerColor = isDark ? "#374151" : "#E5E7EB";

  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricOn, setBiometricOn] = useState(false);

  useEffect(() => {
    const load = async () => {
      const available = await isBiometricAvailable();
      setBiometricSupported(available);
      if (available) {
        const enabled = await isBiometricEnabled();
        setBiometricOn(enabled);
      }
    };
    load();
  }, []);

  const handleToggleBiometric = async (value: boolean) => {
    await setBiometricEnabled(value);
    setBiometricOn(value);
  };

  const handleLogout = async () => {
    await dispatch(logoutAsync() as any);
    router.replace("/loginscreen");
  };

  type SettingItem = {
    label: string;
    subtitle: string;
    icon: string;
    color: string;
    onPress?: () => void;
    type?: "navigate" | "toggle";
    toggleValue?: boolean;
    onToggle?: () => void;
  };

  const sections: { title: string; items: SettingItem[] }[] = [
    {
      title: "Personal Information",
      items: [
        { label: "Edit Basic Info", subtitle: "Update your personal details", icon: "person-outline", color: primaryColor, onPress: () => router.push("/profileeditlayout") },
      ],
    },
    {
      title: "Activity",
      items: [
        { label: `Disputes (${totalDisputes})`, subtitle: "View and manage your disputes", icon: "warning-outline", color: "#EF4444", onPress: () => router.push("/jobstatusLayout/DISPUTED" as any) },
        { label: `Reviews & Ratings (${totalReviews})`, subtitle: "See what clients say about you", icon: "star-outline", color: "#F59E0B", onPress: () => router.push("/reviewlayout" as any) },
      ],
    },
    {
      title: "Earnings & Payment",
      items: [
        { label: "Wallet & Payment", subtitle: "Manage payment methods", icon: "wallet-outline", color: primaryColor, onPress: () => router.push("/walletpay") },
        { label: "Earnings History", subtitle: "View your delivery earnings", icon: "trending-up-outline", color: primaryColor, onPress: () => router.push("/billhistorylayout") },
      ],
    },
    {
      title: "Help & Support",
      items: [
        { label: "FAQs", subtitle: "Frequently asked questions", icon: "help-circle-outline", color: backgroundColortwo, onPress: () => router.push("/faqlayout") },
        { label: "Support", subtitle: "Get help from our team", icon: "headset-outline", color: backgroundColortwo, onPress: () => router.push("/supportlayout") },
        { label: "Terms & Privacy", subtitle: "Legal information", icon: "shield-checkmark-outline", color: primaryColor, onPress: () => router.push("/termsandprivacylayout") },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "Switch Role", subtitle: "Switch between client, professional, delivery", icon: "swap-horizontal-outline", color: "#6366F1", onPress: () => router.push("/switch-role") },
        { label: "Change Password", subtitle: "Update your password", icon: "lock-closed-outline", color: backgroundColortwo, onPress: () => router.push("/passwordchangelayout") },
        { label: "Delete Account", subtitle: "Permanently remove your account", icon: "trash-outline", color: "#DC2626", onPress: () => router.push("/deleteaccountlayout") },
        ...(biometricSupported ? [{
          label: "Biometric Login",
          subtitle: "Use Face ID or fingerprint to sign in",
          icon: "finger-print-outline",
          color: primaryColor,
          type: "toggle" as const,
          toggleValue: biometricOn,
          onToggle: () => handleToggleBiometric(!biometricOn),
        }] : []),
        {
          label: isDark ? "Dark Mode" : "Light Mode",
          subtitle: "Change app appearance",
          icon: isDark ? "moon-outline" : "sunny-outline",
          color: primaryColor,
          type: "toggle",
          toggleValue: isDark,
          onToggle: toggleTheme,
        },
        { label: "Sign Out", subtitle: "Sign out of your account", icon: "log-out-outline", color: "#DC2626", onPress: handleLogout },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      {/* ── Header ── */}
      <View style={{
        backgroundColor: primaryColor,
        paddingTop: 52, paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 19, fontWeight: "700" }}>Delivery Settings</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
      >
        {sections.map((section) => (
          <View key={section.title} style={{ marginBottom: 16 }}>
            <Text style={{
              color: textSecondary, fontSize: 12, fontWeight: "600",
              textTransform: "uppercase", letterSpacing: 0.5,
              marginBottom: 8, marginLeft: 4,
            }}>
              {section.title}
            </Text>
            <View style={{
              backgroundColor: cardBg, borderRadius: 16, overflow: "hidden",
              shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isDark ? 0.2 : 0.04, shadowRadius: 4, elevation: 2,
            }}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={item.type === "toggle" ? undefined : item.onPress}
                  activeOpacity={item.type === "toggle" ? 1 : 0.6}
                  style={{
                    flexDirection: "row", alignItems: "center",
                    padding: 14, gap: 12,
                    borderBottomWidth: index < section.items.length - 1 ? 1 : 0,
                    borderBottomColor: dividerColor,
                  }}
                >
                  <View style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: item.color + "15",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: textPrimary, fontSize: 14, fontWeight: "600" }}>{item.label}</Text>
                    <Text style={{ color: textSecondary, fontSize: 11, marginTop: 1 }}>{item.subtitle}</Text>
                  </View>
                  {item.type === "toggle" ? (
                    <Switch
                      trackColor={{ false: "#767577", true: primaryColor }}
                      thumbColor={item.toggleValue ? "#f4f3f4" : "#fff"}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={item.onToggle}
                      value={item.toggleValue}
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={textSecondary + "60"} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* ── Logout ── */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: backgroundColortwo + '15', borderRadius: 14,
            paddingVertical: 14, alignItems: "center",
            flexDirection: "row", justifyContent: "center", gap: 8,
            marginTop: 4,
          }}
        >
          <Ionicons name="log-out-outline" size={18} color={backgroundColortwo} />
          <Text style={{ color: backgroundColortwo, fontSize: 15, fontWeight: "600" }}>Logout</Text>
        </TouchableOpacity>

        <View style={{ alignItems: "center", marginTop: 16 }}>
          <Text style={{ color: textSecondary + "60", fontSize: 11 }}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default DeliverySettings;
