import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { AntDesign, FontAwesome5, FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";
import { setPreviousChats, ChatContact } from "redux/slices/chatSlice";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { Textstyles } from "static/textFontsize";
import { useMutation } from "@tanstack/react-query";
import { getContactListFn } from "services/userService";
import { getInitials } from "utilizes/initialsName";
import { useDebounce } from "hooks/useDebounce";

// Role config colors are applied dynamically from theme in getRoleBadge
const ROLE_CONFIG_KEYS = {
  client: { icon: "person", iconSet: "Ionicons", label: "Client" },
  professional: { icon: "construct", iconSet: "Ionicons", label: "Pro" },
  delivery: { icon: "bicycle", iconSet: "Ionicons", label: "Delivery" },
};

/** Compute which filter tabs to show based on the logged-in user's role.
 *  Client → can chat with professional + delivery
 *  Professional → can chat with client only (no tabs needed)
 *  Delivery → can chat with client only (no tabs needed)
 */
const getRoleFilters = (role?: string): string[] => {
  if (role === 'client') return ['all', 'professional', 'delivery'];
  // professional & delivery only see clients — single audience, no tabs
  return [];
};

const ContactListScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const {
    selectioncardColor,
    primaryColor,
    secondaryTextColor,
    backgroundColor,
    borderColor,
    subText,
    backgroundColortwo,
    successColor,
  } = getColors(theme);

  const ROLE_CONFIG: Record<string, { icon: string; iconSet: string; color: string; label: string }> = {
    client: { icon: "person", iconSet: "Ionicons", color: primaryColor, label: "Client" },
    professional: { icon: "construct", iconSet: "Ionicons", color: backgroundColortwo, label: "Pro" },
    delivery: { icon: "bicycle", iconSet: "Ionicons", color: primaryColor, label: "Delivery" },
  };

  const role = useSelector((state: RootState) => state?.auth?.user?.role);
  const previousChats = useSelector((state: RootState) => state.chat.previousChats);
  const allowedFilters = getRoleFilters(role);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [filterRole, setFilterRole] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const mutation = useMutation({
    mutationFn: getContactListFn,
    onSuccess: (response) => {
      dispatch(setPreviousChats(response.data));
      setRefreshing(false);
    },
    onError: () => setRefreshing(false),
  });

  useEffect(() => {
    mutation.mutate({ search: debouncedSearch, role: filterRole, page: 1, limit: 30 });
  }, [debouncedSearch, filterRole]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    mutation.mutate({ search: debouncedSearch, role: filterRole, page: 1, limit: 30 });
  }, [debouncedSearch, filterRole]);

  const goToChat = (contact: ChatContact) => {
    router.push(`/mainchat/${JSON.stringify({ userId: contact.id, professionalId: "" })}`);
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => new Set(prev).add(id));
  };

  const getRoleBadge = (role?: string) => {
    const config = role ? ROLE_CONFIG[role] : null;
    if (!config) return null;
    return (
      <View
        style={{ backgroundColor: config.color + "18" }}
        className="flex-row items-center px-2 py-0.5 rounded-full"
      >
        <Ionicons name={config.icon as any} size={10} color={config.color} />
        <Text style={{ color: config.color, fontSize: 10, fontWeight: "600", marginLeft: 3 }}>
          {config.label}
        </Text>
      </View>
    );
  };

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  // ── Header ────────────────────────────────────────────────────────────
  const renderHeader = () => (
    <View className="pt-14 pb-2 px-5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-x-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: selectioncardColor }}
          >
            <AntDesign name="left" size={18} color={primaryColor} />
          </TouchableOpacity>
          <View>
            <ThemeText size={Textstyles.text_xmedium}>Messages</ThemeText>
            <Text style={{ color: subText, fontSize: 12 }}>
              {previousChats?.length || 0} contacts
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-x-2">
          <TouchableOpacity
            onPress={() => setShowSearch(!showSearch)}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: showSearch ? primaryColor : selectioncardColor }}
          >
            <Ionicons
              name="search"
              size={18}
              color={showSearch ? "#fff" : primaryColor}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      {showSearch && (
        <View
          className="flex-row items-center mt-3 rounded-xl px-3"
          style={{ backgroundColor: selectioncardColor, height: 44 }}
        >
          <Ionicons name="search" size={16} color={subText} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search contacts..."
            placeholderTextColor={subText}
            style={{ flex: 1, marginLeft: 8, color: secondaryTextColor, fontSize: 14 }}
            autoFocus
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={subText} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  // ── Filter pills (only shown when user has multiple audiences) ─────
  const renderFilters = () => {
    if (allowedFilters.length === 0) return null;
    return (
      <View className="px-5 pt-2 pb-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-x-2">
            {allowedFilters.map((r) => {
              const value = r === "all" ? undefined : r;
              const isActive = filterRole === value;
              return (
                <TouchableOpacity
                  key={r}
                  onPress={() => setFilterRole(value)}
                  style={{
                    backgroundColor: isActive ? primaryColor : selectioncardColor,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      color: isActive ? "#fff" : secondaryTextColor,
                      fontSize: 13,
                      fontWeight: isActive ? "600" : "400",
                      fontFamily: "TTFirsNeue",
                    }}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  // ── Contact card ──────────────────────────────────────────────────────
  const renderContact = (contact: ChatContact, index: number) => {
    const isOnline = contact.onlineUser?.isOnline;
    const hasAvatar = contact.profile?.avatar && !imageErrors.has(contact.id);
    const name = `${contact.profile?.firstName ?? "Unknown"} ${contact.profile?.lastName ?? ""}`.trim();
    const profession = contact.profile?.professional?.profession?.name;
    const lastSeen = contact.onlineUser?.lastActive;

    return (
      <TouchableOpacity
        key={contact.id || index}
        onPress={() => goToChat(contact)}
        activeOpacity={0.7}
        className="mx-5 mb-2"
      >
        <View
          style={{ backgroundColor: selectioncardColor }}
          className="flex-row items-center p-3.5 rounded-2xl"
        >
          {/* Avatar */}
          <View className="relative mr-3">
            <View
              className="w-12 h-12 rounded-full overflow-hidden items-center justify-center"
              style={{ backgroundColor: primaryColor + "15" }}
            >
              {hasAvatar ? (
                <Image
                  source={{ uri: contact.profile!.avatar! }}
                  className="w-full h-full"
                  resizeMode="cover"
                  onError={() => handleImageError(contact.id)}
                />
              ) : (
                <Text style={{ color: primaryColor, fontSize: 18, fontWeight: "700" }}>
                  {getInitials({
                    firstName: contact.profile?.firstName || "",
                    lastName: contact.profile?.lastName || "",
                  })}
                </Text>
              )}
            </View>
            {/* Online indicator */}
            <View
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
              style={{
                backgroundColor: isOnline ? primaryColor : "#9CA3AF",
                borderColor: selectioncardColor,
              }}
            />
          </View>

          {/* Info */}
          <View className="flex-1 mr-2">
            <View className="flex-row items-center gap-x-2 mb-0.5">
              <Text
                style={{ color: secondaryTextColor, fontFamily: "TTFirsNeueMedium" }}
                className="text-[15px]"
                numberOfLines={1}
              >
                {name}
              </Text>
              {getRoleBadge(contact.role)}
            </View>
            <Text style={{ color: subText, fontSize: 12 }} numberOfLines={1}>
              {profession || (isOnline ? "Online" : lastSeen ? `Last seen ${getTimeAgo(lastSeen)}` : "Tap to chat")}
            </Text>
          </View>

          {/* Right side */}
          <View className="items-end gap-y-1">
            {isOnline && (
              <Text style={{ color: primaryColor, fontSize: 10, fontWeight: "600" }}>Online</Text>
            )}
            <Ionicons name="chevron-forward" size={16} color={subText} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Empty state ───────────────────────────────────────────────────────
  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center px-10 py-20">
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-5"
        style={{ backgroundColor: primaryColor + "15" }}
      >
        <Ionicons name="chatbubbles-outline" size={36} color={primaryColor} />
      </View>
      <ThemeText size={Textstyles.text_cmedium}>No contacts yet</ThemeText>
      <Text
        style={{ color: subText, textAlign: "center", marginTop: 8, lineHeight: 20, fontSize: 13 }}
      >
        {search ? `No results for "${search}"` : "Your contacts will appear here once they're available."}
      </Text>
      {search.length > 0 && (
        <TouchableOpacity
          onPress={() => setSearch("")}
          className="mt-4 px-5 py-2.5 rounded-full"
          style={{ backgroundColor: primaryColor }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Clear search</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // ── Loading state ─────────────────────────────────────────────────────
  if (mutation.isPending && !refreshing && (!previousChats || previousChats.length === 0)) {
    return (
      <ContainerTemplate>
        {renderHeader()}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={{ color: subText, marginTop: 12, fontSize: 13 }}>Loading contacts...</Text>
        </View>
      </ContainerTemplate>
    );
  }

  return (
    <ContainerTemplate>
      {renderHeader()}
      {renderFilters()}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        }
      >
        {previousChats && previousChats.length > 0
          ? previousChats.map((contact, index) => renderContact(contact as ChatContact, index))
          : renderEmpty()}
      </ScrollView>
    </ContainerTemplate>
  );
};

export default ContactListScreen;
