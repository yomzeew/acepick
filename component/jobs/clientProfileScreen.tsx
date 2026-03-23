import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { AntDesign, FontAwesome5, FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { Textstyles } from "static/textFontsize";
import RatingStar from "component/rating";
import EmptyView from "component/emptyview";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import HeaderComponent from "component/headerComp";
import { useLocalSearchParams, useRouter } from "expo-router";
import { generalUserDetailFn } from "services/userService";
import { getInitials } from "utilizes/initialsName";

const ClientProfileScreen = () => {
  const { theme } = useTheme();
  const { secondaryTextColor, primaryColor, selectioncardColor, backgroundColortwo } = getColors(theme);
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    generalUserDetailFn(userId)
      .then((data) => setUser(data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <ContainerTemplate>
        <View className="w-full h-full justify-center items-center">
          <ActivityIndicator color={primaryColor} size="large" />
          <EmptyView height={12} />
          <ThemeTextsecond size={Textstyles.text_xsmall}>
            Loading profile...
          </ThemeTextsecond>
        </View>
      </ContainerTemplate>
    );
  }

  if (!user) {
    return (
      <ContainerTemplate>
        <HeaderComponent title="Client Profile" />
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="person-outline" size={56} color={secondaryTextColor + "40"} />
          <EmptyView height={12} />
          <ThemeTextsecond size={Textstyles.text_small}>
            Profile not found
          </ThemeTextsecond>
        </View>
      </ContainerTemplate>
    );
  }

  const profile = user.profile;
  const fullName = profile
    ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
    : "User";
  const initials = getInitials(profile);
  const avatar = profile?.avatar;
  const avgRating = Number(profile?.rate ?? 0);
  const totalJobs = profile?.totalJobs ?? 0;
  const totalJobsCompleted = profile?.totalJobsCompleted ?? 0;
  const totalReviews = profile?.totalReview ?? 0;
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "";

  return (
    <ContainerTemplate>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <HeaderComponent title="Client Profile" />
        <EmptyView height={20} />

        {/* ─── Profile Header Card ─────────────────── */}
        <View
          style={{ backgroundColor: selectioncardColor }}
          className="rounded-2xl px-5 py-6 mb-4 items-center"
        >
          {/* Avatar */}
          {avatar && !imageError ? (
            <Image
              source={{ uri: avatar }}
              className="w-24 h-24 rounded-full mb-4"
              onError={() => setImageError(true)}
            />
          ) : (
            <View
              style={{ backgroundColor: primaryColor + "20" }}
              className="w-24 h-24 rounded-full items-center justify-center mb-4"
            >
              <Text style={{ color: primaryColor, fontSize: 30, fontFamily: "TTFirsNeueMedium" }}>
                {initials}
              </Text>
            </View>
          )}

          {/* Name */}
          <Text style={{ color: primaryColor, fontSize: 20, fontFamily: "TTFirsNeueMedium", marginBottom: 6 }}>
            {fullName}
          </Text>

          {/* Location */}
          {(profile?.position || user.location) && (
            <View className="flex-row items-center mb-3">
              <FontAwesome6 name="location-dot" size={12} color={secondaryTextColor} style={{ marginRight: 6 }} />
              <ThemeTextsecond size={Textstyles.text_xsmall}>
                {profile?.position || user.location || ""}
              </ThemeTextsecond>
            </View>
          )}

          {/* Rating */}
          <View className="flex-row items-center mb-3">
            <RatingStar numberOfStars={avgRating} size={20} />
            {avgRating > 0 && (
              <Text style={{ color: secondaryTextColor, fontSize: 13, marginLeft: 8, fontFamily: "TTFirsNeueMedium" }}>
                {avgRating.toFixed(1)}
              </Text>
            )}
          </View>

          {/* Member since */}
          {memberSince ? (
            <View
              style={{ backgroundColor: primaryColor + "15", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 }}
            >
              <Text style={{ color: primaryColor, fontSize: 12, fontFamily: "TTFirsNeueMedium" }}>
                Member since {memberSince}
              </Text>
            </View>
          ) : null}

          {/* Action buttons */}
          <View className="flex-row gap-x-4 mt-5">
            <TouchableOpacity
              onPress={() => router.push(`/callchat/${JSON.stringify({ userId })}` as any)}
              className="w-12 h-12 items-center justify-center rounded-full"
              style={{ backgroundColor: backgroundColortwo + '20' }}
            >
              <FontAwesome5 color={backgroundColortwo} size={16} name="phone" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/mainchat/${JSON.stringify({ userId })}` as any)}
              className="w-12 h-12 items-center justify-center rounded-full"
              style={{ backgroundColor: primaryColor + "20" }}
            >
              <Ionicons name="chatbubbles-sharp" color={primaryColor} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Stats Cards ──────────────────────────── */}
        <View className="flex-row gap-x-3 mb-4">
          <View
            style={{ backgroundColor: selectioncardColor }}
            className="flex-1 rounded-2xl px-4 py-4 items-center"
          >
            <View
              style={{ backgroundColor: primaryColor + "20" }}
              className="w-10 h-10 rounded-full items-center justify-center mb-2"
            >
              <MaterialIcons name="work" size={18} color={primaryColor} />
            </View>
            <Text style={{ color: primaryColor, fontSize: 22, fontFamily: "TTFirsNeueMedium" }}>
              {totalJobs}
            </Text>
            <ThemeTextsecond size={Textstyles.text_xxxsmall}>
              Total Jobs
            </ThemeTextsecond>
          </View>

          <View
            style={{ backgroundColor: selectioncardColor }}
            className="flex-1 rounded-2xl px-4 py-4 items-center"
          >
            <View
              style={{ backgroundColor: primaryColor + '20' }}
              className="w-10 h-10 rounded-full items-center justify-center mb-2"
            >
              <Ionicons name="checkmark-done" size={18} color={primaryColor} />
            </View>
            <Text style={{ color: primaryColor, fontSize: 22, fontFamily: "TTFirsNeueMedium" }}>
              {totalJobsCompleted}
            </Text>
            <ThemeTextsecond size={Textstyles.text_xxxsmall}>
              Completed
            </ThemeTextsecond>
          </View>

          <View
            style={{ backgroundColor: selectioncardColor }}
            className="flex-1 rounded-2xl px-4 py-4 items-center"
          >
            <View
              style={{ backgroundColor: backgroundColortwo + '20' }}
              className="w-10 h-10 rounded-full items-center justify-center mb-2"
            >
              <AntDesign name="star" size={18} color={backgroundColortwo} />
            </View>
            <Text style={{ color: backgroundColortwo, fontSize: 22, fontFamily: "TTFirsNeueMedium" }}>
              {totalReviews}
            </Text>
            <ThemeTextsecond size={Textstyles.text_xxxsmall}>
              Reviews
            </ThemeTextsecond>
          </View>
        </View>

        {/* ─── About Section ──────────────────────────── */}
        {user.about && (
          <View
            style={{ backgroundColor: selectioncardColor }}
            className="rounded-2xl px-4 py-4 mb-4"
          >
            <View className="flex-row items-center mb-3">
              <View
                style={{ backgroundColor: primaryColor + "20" }}
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
              >
                <Ionicons name="information-circle-outline" size={16} color={primaryColor} />
              </View>
              <ThemeText size={Textstyles.text_small}>About</ThemeText>
            </View>
            <ThemeTextsecond size={Textstyles.text_xsmall}>
              {user.about}
            </ThemeTextsecond>
          </View>
        )}

        {/* ─── Contact Info ───────────────────────────── */}
        <View
          style={{ backgroundColor: selectioncardColor }}
          className="rounded-2xl px-4 py-4 mb-4"
        >
          <View className="flex-row items-center mb-3">
            <View
              style={{ backgroundColor: primaryColor + '20' }}
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
            >
              <Ionicons name="call-outline" size={16} color={primaryColor} />
            </View>
            <ThemeText size={Textstyles.text_small}>Contact Info</ThemeText>
          </View>

          {user.email && (
            <View className="flex-row items-center mb-3">
              <Ionicons name="mail-outline" size={16} color={secondaryTextColor} style={{ marginRight: 10 }} />
              <ThemeTextsecond size={Textstyles.text_xsmall}>
                {user.email}
              </ThemeTextsecond>
            </View>
          )}

          {user.phone && (
            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={16} color={secondaryTextColor} style={{ marginRight: 10 }} />
              <ThemeTextsecond size={Textstyles.text_xsmall}>
                {user.phone}
              </ThemeTextsecond>
            </View>
          )}
        </View>

        <EmptyView height={40} />
      </ScrollView>
    </ContainerTemplate>
  );
};

export default ClientProfileScreen;