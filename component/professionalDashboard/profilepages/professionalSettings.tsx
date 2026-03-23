import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "hooks/useTheme";
import { View, Text, ScrollView, TouchableOpacity, Switch, Image, Alert } from "react-native";
import { getColors } from "static/color";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "redux/store";
import { logout } from "redux/slices/authSlice";
import { getInitials } from "utilizes/initialsName";

const ProfessionalsSettingsComp = () => {
  const { theme, toggleTheme } = useTheme();
  const { primaryColor, backgroundColortwo } = getColors(theme);
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state?.auth?.user);
  const profile = user?.profile;
  const professional = profile?.professional;

  const isDark = theme === "dark";
  const bgColor = isDark ? "#111827" : "#F3F4F6";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const dividerColor = isDark ? "#374151" : "#E5E7EB";

  const fullName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Professional';
  const userInitials = getInitials(profile);
  const avatar = profile?.avatar || '';
  const professionTitle = professional?.profession?.title || 'Professional';
  const isVerified = profile?.verified || false;

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: () => {
          dispatch(logout());
          router.replace("/loginscreen");
        }},
      ]
    );
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
        { label: "Professional Settings", subtitle: "Manage your professional profile", icon: "briefcase-outline", color: backgroundColortwo, onPress: () => router.push("/artisanSettingLayout") },
      ],
    },
    {
      title: "Bill & Payment",
      items: [
        { label: "Wallet & Payment", subtitle: "Manage payment methods", icon: "wallet-outline", color: primaryColor, onPress: () => router.push("/walletpay") },
        { label: "Earnings History", subtitle: "View your earnings", icon: "trending-up-outline", color: primaryColor, onPress: () => router.push("/billhistorylayout") },
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
        { label: "Change Password", subtitle: "Update your password", icon: "lock-closed-outline", color: backgroundColortwo, onPress: () => router.push("/passwordchangelayout") },
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
  ];

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      {/* ── Header with Profile Card ── */}
      <View style={{
        backgroundColor: primaryColor,
        paddingTop: 52, paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      }}>
        {/* Back + Title */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginLeft: 12 }}>Settings</Text>
        </View>

        {/* Profile Card */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {avatar && avatar.trim() !== '' && avatar.startsWith('http') ? (
            <Image
              source={{ uri: avatar }}
              style={{
                width: 56, height: 56, borderRadius: 28,
                borderWidth: 2, borderColor: "rgba(255,255,255,0.3)",
              }}
            />
          ) : (
            <View style={{
              width: 56, height: 56, borderRadius: 28,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center", justifyContent: "center",
              borderWidth: 2, borderColor: "rgba(255,255,255,0.3)",
            }}>
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>{userInitials}</Text>
            </View>
          )}
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>{fullName}</Text>
              {isVerified && (
                <View style={{
                  backgroundColor: primaryColor,
                  width: 18, height: 18, borderRadius: 9,
                  alignItems: "center", justifyContent: "center",
                  marginLeft: 6,
                }}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
            </View>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 }}>{professionTitle}</Text>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 1 }}>{user?.email || ''}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/profileeditlayout")}
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              width: 36, height: 36, borderRadius: 12,
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Ionicons name="create-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
      >
        {/* ── Corporate Account Banner ── */}
        {/* <TouchableOpacity
          onPress={() => router.push("/corporateReglayout")}
          activeOpacity={0.8}
          style={{
            backgroundColor: primaryColor, borderRadius: 16, padding: 14,
            flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16,
          }}
        >
          <View style={{
            width: 38, height: 38, borderRadius: 12,
            backgroundColor: "rgba(255,255,255,0.2)",
            alignItems: "center", justifyContent: "center",
          }}>
            <Ionicons name="people-outline" size={18} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>Create Corporate Account</Text>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, marginTop: 1 }}>Manage teams and corporate services</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity> */}

        {/* ── Settings Sections ── */}
        {sections.map((section) => (
          <View key={section.title} style={{ marginBottom: 16 }}>
            <Text style={{
              color: textSecondary, fontSize: 11, fontWeight: "600",
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
                    <Text style={{ color: textPrimary, fontSize: 13, fontWeight: "600" }}>{item.label}</Text>
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
                    <Ionicons name="chevron-forward" size={16} color={textSecondary + "60"} />
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
            backgroundColor: '#DC262615', borderRadius: 14,
            paddingVertical: 14, alignItems: "center",
            flexDirection: "row", justifyContent: "center", gap: 8,
            marginTop: 4,
          }}
        >
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={{ color: '#DC2626', fontSize: 14, fontWeight: "600" }}>Logout</Text>
        </TouchableOpacity>

        <View style={{ alignItems: "center", marginTop: 16 }}>
          <Text style={{ color: textSecondary + "60", fontSize: 11 }}>Acepick v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfessionalsSettingsComp;