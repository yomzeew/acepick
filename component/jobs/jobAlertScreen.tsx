import { FontAwesome5, FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useTheme } from "hooks/useTheme";
import { useEffect, useRef, useState } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  Animated,
  Easing,
  StatusBar,
  Dimensions,
} from "react-native";
import { generalUserDetailFn, jobAcceptDelineFn } from "services/userService";
import { getColors } from "static/color";
import { JobLatest } from "types/type";
import { getInitials } from "utilizes/initialsName";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");

interface JobAlertScreenProps {
  setshowalertModal: (value: boolean) => void;
  showalertModal: boolean;
  item: JobLatest | null;
}

const JobAlertScreen = ({
  setshowalertModal,
  showalertModal,
  item,
}: JobAlertScreenProps) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColortwo } = getColors(theme);
  const router = useRouter();
  const [showFullDetails, setShowFullDetails] = useState(false);

  const [clientData, setClientData] = useState<any>(null);
  const [imageError, setImageError] = useState(false);

  // ── Animations ────────────────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(80)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (item && showalertModal) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(80);
      cardScale.setValue(0.9);
    }
  }, [item, showalertModal]);

  // ── Fetch client profile ──────────────────────────────────────────
  const profileMutation = useMutation({
    mutationFn: generalUserDetailFn,
    onSuccess: (response) => setClientData(response.data),
    onError: (error: any) => {
      console.error("JobAlert fetch client failed:", error?.message);
    },
  });

  useEffect(() => {
    if (item?.clientId) {
      setClientData(null);
      setImageError(false);
      profileMutation.mutate(item.clientId);
    }
  }, [item?.clientId]);

  // ── Accept / Decline mutation ─────────────────────────────────────
  const mutation = useMutation({
    mutationFn: jobAcceptDelineFn,
    onSuccess: async () => {},
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "An unexpected error occurred";
      console.error("JobAlert action failed:", msg);
    },
  });

  const updateStatus = (accepted: boolean) => {
    setshowalertModal(false);
    mutation.mutate({ id: item?.id, accepted });
    if (accepted) {
      router.push('/myjobAPLayout');
    }
  };

  if (!item || !showalertModal) return null;

  const profile = clientData?.profile || clientData;
  const clientName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
    : "Client";

  const isPhysical = item.mode === "PHYSICAL";

  return (
    <>
      <StatusBar barStyle="light-content" />

      {/* ── Background overlay ───────────────────────────────── */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          backgroundColor: "#0F172A",
          opacity: Animated.multiply(fadeAnim, 0.95),
        }}
      />

      {/* ── Content ─────────────────────────────────────────── */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          opacity: fadeAnim,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        {/* ── Top badge ─────────────────────────────────────── */}
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: primaryColor + "20",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: primaryColor + "40",
            }}
          >
            <MaterialIcons
              name="work"
              size={16}
              color={primaryColor}
              style={{ marginRight: 6 }}
            />
            <Text
              style={{
                color: primaryColor,
                fontSize: 13,
                fontFamily: "TTFirsNeueMedium",
                letterSpacing: 1,
              }}
            >
              NEW JOB REQUEST
            </Text>
          </View>
        </Animated.View>

        {/* ── Main card ─────────────────────────────────────── */}
        <Animated.View
          style={{
            width: "100%",
            maxWidth: 380,
            backgroundColor: "rgba(255,255,255,0.07)",
            borderRadius: 24,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
            overflow: "hidden",
            transform: [{ scale: cardScale }, { translateY: slideAnim }],
          }}
        >
          {/* Client section */}
          <View
            style={{
              alignItems: "center",
              paddingTop: 28,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255,255,255,0.08)",
            }}
          >
            {/* Avatar */}
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                overflow: "hidden",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderWidth: 2.5,
                borderColor: primaryColor + "60",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              {profile?.avatar && !imageError ? (
                <Image
                  resizeMode="cover"
                  source={{ uri: profile.avatar }}
                  style={{ width: "100%", height: "100%" }}
                  onError={() => setImageError(true)}
                />
              ) : (
                <Text style={{ color: "#fff", fontSize: 26, fontWeight: "700" }}>
                  {getInitials({
                    firstName: profile?.firstName || "",
                    lastName: profile?.lastName || "",
                  })}
                </Text>
              )}
            </View>

            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontFamily: "TTFirsNeueMedium",
              }}
            >
              {clientName}
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 13,
                fontFamily: "TTFirsNeue",
                marginTop: 2,
              }}
            >
              Needs your service
            </Text>
          </View>

          {/* Job details */}
          <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
            {/* Title */}
            <Text
              style={{
                color: "#fff",
                fontSize: 20,
                fontFamily: "TTFirsNeueMedium",
                marginBottom: 8,
              }}
              numberOfLines={2}
            >
              {item.title}
            </Text>

            {/* Description */}
            {item.description ? (
              <Text
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 14,
                  fontFamily: "TTFirsNeue",
                  lineHeight: 20,
                  marginBottom: 16,
                }}
                numberOfLines={3}
              >
                {item.description}
              </Text>
            ) : null}

            {/* Info pills */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {/* Location */}
              {item.fullAddress ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: backgroundColortwo + '25',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                    flexShrink: 1,
                  }}
                >
                  <FontAwesome6
                    name="location-dot"
                    size={12}
                    color={backgroundColortwo}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      color: backgroundColortwo,
                      fontSize: 12,
                      fontFamily: "TTFirsNeue",
                    }}
                    numberOfLines={1}
                  >
                    {item.fullAddress}
                  </Text>
                </View>
              ) : null}

              {/* Mode */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: primaryColor + '25',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                }}
              >
                <Ionicons
                  name={isPhysical ? "location" : "globe-outline"}
                  size={13}
                  color={primaryColor}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={{
                    color: primaryColor,
                    fontSize: 12,
                    fontFamily: "TTFirsNeue",
                  }}
                >
                  {isPhysical ? "Physical" : "Virtual"}
                </Text>
              </View>

              {/* Duration */}
              {item.durationValue && item.durationUnit ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: primaryColor + '25',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                  }}
                >
                  <Ionicons
                    name="time-outline"
                    size={13}
                    color={primaryColor}
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    style={{
                      color: primaryColor,
                      fontSize: 12,
                      fontFamily: "TTFirsNeue",
                    }}
                  >
                    {item.durationValue} {item.durationUnit}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Expanded details section */}
            {showFullDetails && (
              <View style={{ paddingHorizontal: 20, paddingBottom: 20, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" }}>
                <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                  {item.description ? (
                    <View style={{ marginTop: 12 }}>
                      <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "TTFirsNeue", marginBottom: 4, letterSpacing: 0.5 }}>
                        FULL DESCRIPTION
                      </Text>
                      <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "TTFirsNeue", lineHeight: 20 }}>
                        {item.description}
                      </Text>
                    </View>
                  ) : null}

                  {item.state || item.lga ? (
                    <View style={{ marginTop: 12 }}>
                      <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "TTFirsNeue", marginBottom: 4, letterSpacing: 0.5 }}>
                        LOCATION
                      </Text>
                      <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "TTFirsNeue" }}>
                        {[item.lga, item.state].filter(Boolean).join(', ')}
                      </Text>
                    </View>
                  ) : null}

                  {item.durationValue && item.durationUnit ? (
                    <View style={{ marginTop: 12 }}>
                      <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "TTFirsNeue", marginBottom: 4, letterSpacing: 0.5 }}>
                        ESTIMATED DURATION
                      </Text>
                      <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "TTFirsNeue" }}>
                        {item.durationValue} {item.durationUnit}
                      </Text>
                    </View>
                  ) : null}

                  {item.numOfJobs > 1 ? (
                    <View style={{ marginTop: 12 }}>
                      <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "TTFirsNeue", marginBottom: 4, letterSpacing: 0.5 }}>
                        NUMBER OF JOBS
                      </Text>
                      <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "TTFirsNeue" }}>
                        {item.numOfJobs}
                      </Text>
                    </View>
                  ) : null}

                  <View style={{ marginTop: 12 }}>
                    <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "TTFirsNeue", marginBottom: 4, letterSpacing: 0.5 }}>
                      POSTED
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "TTFirsNeue" }}>
                      {new Date(item.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                  </View>
                </ScrollView>
              </View>
            )}
          </View>
        </Animated.View>

        {/* ── Action buttons ────────────────────────────────── */}
        <Animated.View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 32,
            gap: 24,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Decline */}
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => updateStatus(false)}
              activeOpacity={0.8}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: backgroundColortwo,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: backgroundColortwo,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
                elevation: 8,
              }}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text
              style={{
                color: "#9CA3AF",
                fontSize: 12,
                fontFamily: "TTFirsNeue",
                marginTop: 10,
              }}
            >
              Decline
            </Text>
          </View>

          {/* View Details */}
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => setShowFullDetails(!showFullDetails)}
              activeOpacity={0.8}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1.5,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              <Ionicons name={showFullDetails ? "chevron-up" : "document-text-outline"} size={24} color="#fff" />
            </TouchableOpacity>
            <Text
              style={{
                color: "#9CA3AF",
                fontSize: 12,
                fontFamily: "TTFirsNeue",
                marginTop: 10,
              }}
            >
              Details
            </Text>
          </View>

          {/* Accept */}
          <View style={{ alignItems: "center" }}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                onPress={() => updateStatus(true)}
                activeOpacity={0.8}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: primaryColor,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: primaryColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.5,
                  shadowRadius: 12,
                  elevation: 10,
                }}
              >
                <Ionicons name="checkmark" size={32} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
            <Text
              style={{
                color: "#9CA3AF",
                fontSize: 12,
                fontFamily: "TTFirsNeue",
                marginTop: 10,
              }}
            >
              Accept
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </>
  );
};

export default JobAlertScreen;