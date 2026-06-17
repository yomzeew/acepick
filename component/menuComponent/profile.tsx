import { Ionicons } from "@expo/vector-icons";
import FallbackImage from "component/FallbackImage";
import { useRouter } from "expo-router";
import { useTheme } from "hooks/useTheme";
import { useCallback, useState, ReactNode } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "redux/store";
import { getColors } from "static/color";
import { useFocusEffect } from "@react-navigation/native";
import { formatAmount } from "utilizes/amountFormat";
import { logoutAsync } from "redux/slices/authSlice";
import ChatCacheService from "services/chatCache";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ProfileComponent = () => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColortwo, warningColor, errorColor } = getColors(theme);
  const router = useRouter();
  const dispatch = useDispatch();

  const isDark = theme === "dark";
  const bgColor = isDark ? "#111827" : "#F3F4F6";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const dividerColor = isDark ? "#374151" : "#E5E7EB";

  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const user = useSelector((state: RootState) => state?.auth.user);
  const avatar = user?.profile?.avatar || "";
  const fullName = [user?.profile?.firstName, user?.profile?.lastName].filter(Boolean).join(" ") || "User";
  const location = [user?.location?.lga, user?.location?.state].filter(Boolean).join(", ");
  const isVerified = user?.profile?.verified || false;
  const rating = Number(user?.profile?.rate) || 0;
  const walletBalance = user?.wallet?.currentBalance || 0;
  const role = user?.role || "client";

  const completedJobs = user?.profile?.totalJobsCompleted || 0;
  const ongoingJobs = user?.profile?.totalJobsOngoing || 0;
  const pendingJobs = user?.profile?.totalJobsPending || 0;
  const canceledJobs = user?.profile?.totalJobsCanceled || 0;
  const totalDisputes = user?.profile?.totalDisputes || 0;
  const totalReviews = user?.profile?.totalReview || 0;
  const totalExpense = user?.profile?.totalExpense || 0;

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev: number) => prev + 1);
      return () => {};
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await dispatch(logoutAsync() as any);
            router.replace("/loginscreen");
          },
        },
      ]
    );
  };

  // ── Job Stats Config ──
  const jobStats = [
    { label: "Completed", value: completedJobs, icon: "checkmark-circle" as const, color: primaryColor, route: "/jobstatusLayout/COMPLETED" },
    { label: "Ongoing", value: ongoingJobs, icon: "time" as const, color: primaryColor, route: "/jobstatusLayout/ONGOING" },
    { label: "Pending", value: pendingJobs, icon: "hourglass" as const, color: warningColor, route: "/jobstatusLayout/PENDING" },
    { label: "Canceled", value: canceledJobs, icon: "close-circle" as const, color: errorColor, route: "/jobstatusLayout/CANCELLED" },
  ];

  // ── Menu Sections ──
  const menuSections: { title: string; items: { label: string; subtitle: string; icon: string; color: string; onPress: () => void }[] }[] = [
    {
      title: "Account",
      items: [
        { label: "Edit Profile", subtitle: "Update your personal information", icon: "person-outline", color: primaryColor, onPress: () => router.push("/profileeditlayout") },
        { label: "Switch Role", subtitle: "Switch between client, professional, delivery", icon: "swap-horizontal-outline", color: "#6366F1", onPress: () => router.push("/switch-role") },
        { label: "Delete Account", subtitle: "Permanently remove your account", icon: "trash-outline", color: "#DC2626", onPress: () => router.push("/deleteaccountlayout") },
      ],
    },
    {
      title: "Activity",
      items: [
        { label: `Disputes (${totalDisputes})`, subtitle: "View and manage disputes", icon: "warning-outline", color: "#EF4444", onPress: () => router.push("/jobstatusLayout/DISPUTED" as any) },
        { label: `Reviews & Ratings (${totalReviews})`, subtitle: "See what others say about you", icon: "star-outline", color: primaryColor, onPress: () => router.push("/reviewlayout") },
        { label: "Billing History", subtitle: "View transaction history", icon: "receipt-outline", color: primaryColor, onPress: () => router.push("/billhistorylayout") },
      ],
    },
    {
      title: "Settings & Support",
      items: [
        { label: "Settings", subtitle: "App preferences and security", icon: "settings-outline", color: backgroundColortwo, onPress: () => router.push("/profilesettinglayout") },
        { label: "Notifications", subtitle: "Manage app notifications", icon: "notifications-outline", color: primaryColor, onPress: () => router.push("/notificationapplayout") },
        { label: "FAQ", subtitle: "Frequently asked questions", icon: "help-circle-outline", color: primaryColor, onPress: () => router.push("/faqlayout") },
        { label: "Support", subtitle: "Get help from our team", icon: "headset-outline", color: backgroundColortwo, onPress: () => router.push("/supportlayout") },
        { label: "Terms & Privacy", subtitle: "Legal information", icon: "shield-checkmark-outline", color: primaryColor, onPress: () => router.push("/termsandprivacylayout") },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── Profile Header ── */}
        <View style={{
          backgroundColor: primaryColor,
          paddingTop: 56, paddingBottom: 40,
          borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
        }}>
          <View style={{ alignItems: "center", paddingHorizontal: 20 }}>
            {/* Back button */}
            <View style={{ flexDirection: "row", alignItems: "center", width: "100%", marginBottom: 12 }}>
              <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>
              <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700", flex: 1, textAlign: "center", marginRight: 30 }}>
                My Profile
              </Text>
            </View>

            {/* Avatar */}
            <View style={{
              width: 88, height: 88, borderRadius: 44,
              borderWidth: 3, borderColor: "rgba(255,255,255,0.3)",
              backgroundColor: "rgba(255,255,255,0.15)",
              overflow: "hidden",
            }}>
              {avatar ? (
                <FallbackImage key={avatar} source={{ uri: avatar, cache: "reload" }} style={{ width: 88, height: 88 }} resizeMode="cover" />
              ) : (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="person" size={40} color="rgba(255,255,255,0.7)" />
                </View>
              )}
            </View>

            {/* Name & Verified */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 }}>
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>{fullName}</Text>
              {isVerified && (
                <View style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
                  flexDirection: "row", alignItems: "center", gap: 4,
                }}>
                  <Ionicons name="checkmark-circle" size={14} color="#fff" />
                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>Verified</Text>
                </View>
              )}
            </View>

            {/* Location */}
            {location ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{location}</Text>
              </View>
            ) : null}

            {/* Rating */}
            {rating > 0 && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= rating ? "star" : star - 0.5 <= rating ? "star-half" : "star-outline"}
                    size={16}
                    color="#FCD34D"
                  />
                ))}
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginLeft: 4 }}>
                  {rating.toFixed(1)}
                </Text>
              </View>
            )}

            {/* Role Badge */}
            <View style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8,
            }}>
              <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: "600", textTransform: "capitalize" }}>
                {role}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Wallet Card ── */}
        <View style={{
          marginHorizontal: 16, marginTop: -24,
          backgroundColor: cardBg, borderRadius: 20, padding: 16,
          shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 12, elevation: 5,
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        }}>
          <View>
            <Text style={{ color: textSecondary, fontSize: 12, marginBottom: 2 }}>Wallet Balance</Text>
            <Text style={{ color: textPrimary, fontSize: 22, fontWeight: "800" }}>
              {formatAmount(Number(walletBalance))}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={() => router.push("/walletpay")}
              style={{
                backgroundColor: primaryColor,
                paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                flexDirection: "row", alignItems: "center", gap: 6,
              }}
            >
              <Ionicons name="wallet-outline" size={16} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Wallet</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Spending Summary ── */}
        <View style={{
          marginHorizontal: 16, marginTop: 12,
          backgroundColor: cardBg, borderRadius: 16, padding: 14,
          shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.2 : 0.04, shadowRadius: 4, elevation: 2,
          flexDirection: "row", justifyContent: "space-around",
        }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: textSecondary, fontSize: 11 }}>Total Spent</Text>
            <Text style={{ color: textPrimary, fontSize: 16, fontWeight: "700" }}>{formatAmount(totalExpense)}</Text>
          </View>
          <View style={{ width: 1, backgroundColor: dividerColor }} />
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: textSecondary, fontSize: 11 }}>Total Jobs</Text>
            <Text style={{ color: textPrimary, fontSize: 16, fontWeight: "700" }}>
              {completedJobs + ongoingJobs + pendingJobs + canceledJobs}
            </Text>
          </View>
          <View style={{ width: 1, backgroundColor: dividerColor }} />
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: textSecondary, fontSize: 11 }}>Reviews</Text>
            <Text style={{ color: textPrimary, fontSize: 16, fontWeight: "700" }}>{totalReviews}</Text>
          </View>
        </View>

        {/* ── Job Stats Grid ── */}
        <View style={{
          marginHorizontal: 16, marginTop: 12,
          flexDirection: "row", flexWrap: "wrap", gap: 10,
        }}>
          {jobStats.map((stat) => (
            <TouchableOpacity
              key={stat.label}
              onPress={() => router.push(stat.route)}
              activeOpacity={0.7}
              style={{
                width: (SCREEN_WIDTH - 42) / 2,
                backgroundColor: cardBg, borderRadius: 14, padding: 14,
                shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.2 : 0.04, shadowRadius: 4, elevation: 2,
                flexDirection: "row", alignItems: "center", gap: 10,
              }}
            >
              <View style={{
                width: 40, height: 40, borderRadius: 12,
                backgroundColor: stat.color + "15", alignItems: "center", justifyContent: "center",
              }}>
                <Ionicons name={stat.icon} size={20} color={stat.color} />
              </View>
              <View>
                <Text style={{ color: textPrimary, fontSize: 18, fontWeight: "700" }}>{stat.value}</Text>
                <Text style={{ color: textSecondary, fontSize: 11 }}>{stat.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Menu Sections ── */}
        {menuSections.map((section) => (
          <View key={section.title} style={{ marginHorizontal: 16, marginTop: 16 }}>
            <Text style={{ color: textSecondary, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 }}>
              {section.title}
            </Text>
            <View style={{
              backgroundColor: cardBg, borderRadius: 16, overflow: "hidden",
              shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.2 : 0.04, shadowRadius: 4, elevation: 2,
            }}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={item.onPress}
                  activeOpacity={0.6}
                  style={{
                    flexDirection: "row", alignItems: "center", padding: 14, gap: 12,
                    borderBottomWidth: index < section.items.length - 1 ? 1 : 0,
                    borderBottomColor: dividerColor,
                  }}
                >
                  <View style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: item.color + "15", alignItems: "center", justifyContent: "center",
                  }}>
                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: textPrimary, fontSize: 14, fontWeight: "600" }}>{item.label}</Text>
                    <Text style={{ color: textSecondary, fontSize: 11, marginTop: 1 }}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={textSecondary + "60"} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* ── Logout Button ── */}
        <View style={{ marginHorizontal: 16, marginTop: 20 }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: '#DC262615',
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Ionicons name="log-out-outline" size={18} color="#DC2626" />
            <Text style={{ color: '#DC2626', fontSize: 15, fontWeight: "600" }}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* ── App Version ── */}
        <View style={{ alignItems: "center", marginTop: 24, marginBottom: 16 }}>
          <Text style={{ color: textSecondary + "60", fontSize: 11 }}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileComponent;

export const ListTab = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme();
  const { secondaryTextColor } = getColors(theme);
  const isDark = theme === "dark";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  return (
    <View style={{
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: isDark ? "#374151" : "#E5E7EB",
    }}>
      <Text style={{ color: textPrimary, fontSize: 14 }}>{children}</Text>
      <Ionicons name="chevron-forward" size={18} color={secondaryTextColor + "60"} />
    </View>
  );
};
