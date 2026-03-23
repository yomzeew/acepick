import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "hooks/useTheme";
import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { getColors } from "static/color";
import { useDispatch } from "react-redux";
import { logout } from "redux/slices/authSlice";

const ProfileSetting = () => {
  const { theme, toggleTheme } = useTheme();
  const { primaryColor, backgroundColortwo } = getColors(theme);
  const router = useRouter();
  const dispatch = useDispatch();

  const isDark = theme === "dark";
  const bgColor = isDark ? "#111827" : "#F3F4F6";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const dividerColor = isDark ? "#374151" : "#E5E7EB";

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/loginscreen");
  };

  // ── Settings Sections ──
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
        { label: "Edit Profile", subtitle: "Update your personal information", icon: "person-outline", color: primaryColor, onPress: () => router.push("/profileeditlayout") },
        { label: "Switch to Professional", subtitle: "Access professional features", icon: "swap-horizontal-outline", color: backgroundColortwo, onPress: () => router.push("/switchtoprofessionallayout") },
      ],
    },
    {
      title: "Preferences",
      items: [
        { label: "Notifications", subtitle: "Manage app notifications", icon: "notifications-outline", color: primaryColor, onPress: () => router.push("/notificationapplayout") },
        {
          label: isDark ? "Dark Mode" : "Light Mode",
          subtitle: "Change app appearance",
          icon: isDark ? "moon-outline" : "sunny-outline",
          color: primaryColor,
          type: "toggle",
          toggleValue: isDark,
          onToggle: toggleTheme,
        },
      ],
    },
    {
      title: "Security",
      items: [
        { label: "Change Password", subtitle: "Update your password", icon: "lock-closed-outline", color: backgroundColortwo, onPress: () => router.push("/passwordchangelayout") },
        { label: "Transaction PIN", subtitle: "Reset your transaction PIN", icon: "key-outline", color: backgroundColortwo, onPress: () => router.push("/resetpinlayout") },
      ],
    },
    {
      title: "Payment & Billing",
      items: [
        { label: "Wallet", subtitle: "Manage payment methods", icon: "wallet-outline", color: primaryColor, onPress: () => router.push("/walletpay") },
        { label: "Billing History", subtitle: "View transaction history", icon: "receipt-outline", color: primaryColor, onPress: () => router.push("/billhistorylayout") },
      ],
    },
    {
      title: "Support",
      items: [
        { label: "FAQs", subtitle: "Frequently asked questions", icon: "help-circle-outline", color: backgroundColortwo, onPress: () => router.push("/faqlayout") },
        { label: "Customer Support", subtitle: "Get help from our team", icon: "headset-outline", color: backgroundColortwo, onPress: () => router.push("/supportlayout") },
        { label: "Terms & Privacy", subtitle: "Legal information", icon: "shield-checkmark-outline", color: primaryColor, onPress: () => router.push("/termsandprivacylayout") },
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
          <Text style={{ color: "#fff", fontSize: 19, fontWeight: "700" }}>Settings</Text>
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

        {/* ── Logout Button ── */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: '#DC262615', borderRadius: 14,
            paddingVertical: 14, alignItems: "center",
            flexDirection: "row", justifyContent: "center", gap: 8,
            marginTop: 4,
          }}
        >
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={{ color: '#DC2626', fontSize: 15, fontWeight: "600" }}>Logout</Text>
        </TouchableOpacity>

        {/* ── Version ── */}
        <View style={{ alignItems: "center", marginTop: 16 }}>
          <Text style={{ color: textSecondary + "60", fontSize: 11 }}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileSetting;