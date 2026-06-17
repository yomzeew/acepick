import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  StatusBar,
  Dimensions,
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { generalUserDetailFn } from "services/userService";
import { useMutation } from "@tanstack/react-query";
import { getInitials } from "utilizes/initialsName";
import { useRouter } from "expo-router";
import { useCall } from "context/WebRtcContext";
import { useVideoCallContext } from "context/VideoCallContext";
import { useActiveCall } from "context/ActiveCallContext";

const { width: SCREEN_W } = Dimensions.get("window");
const AVATAR_SIZE = 120;
const RING_GAP = 30;

const IncomingCallModal = () => {
  const { startCall: registerCall } = useActiveCall();

  // Voice call context
  const {
    incomingCall: voiceIncoming,
    acceptCall: acceptVoice,
    rejectCall: rejectVoice,
    isCalling: voiceCalling,
    modalVisible: voiceModalVisible,
    partnerId: voicePartnerId,
    hangUp: hangUpVoice,
    setIsCalling: setVoiceCalling,
  } = useCall();

  // Video call context
  const {
    incomingCall: videoIncoming,
    acceptCall: acceptVideo,
    rejectCall: rejectVideo,
    isCalling: videoCalling,
    modalVisible: videoModalVisible,
    partnerId: videoPartnerId,
    hangUp: hangUpVideo,
    setIsCalling: setVideoCalling,
  } = useVideoCallContext();

  const isVideoCall = !!videoIncoming && videoModalVisible;
  const isVoiceCall = !!voiceIncoming && voiceModalVisible;
  const showModal = isVideoCall || isVoiceCall;

  const partnerId = isVideoCall ? videoPartnerId : voicePartnerId;

  const [data, setData] = useState<any>(null);
  const [imageError, setImageError] = useState(false);

  const user = useSelector((state: RootState) => state?.auth.user);
  const { theme } = useTheme();
  const { primaryColor, backgroundColortwo, successColor } = getColors(theme);
  const router = useRouter();

  // ── Animations ──────────────────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse1Opacity = useRef(new Animated.Value(0.6)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const pulse2Opacity = useRef(new Animated.Value(0.4)).current;
  const btnBounce = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (showModal) {
      // Entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 9,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse rings
      const ring1 = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulse1, {
              toValue: 1.5,
              duration: 1500,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulse1, {
              toValue: 1,
              duration: 1500,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(pulse1Opacity, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(pulse1Opacity, {
              toValue: 0.6,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      const ring2 = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulse2, {
              toValue: 1.8,
              duration: 2000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulse2, {
              toValue: 1,
              duration: 2000,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(pulse2Opacity, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(pulse2Opacity, {
              toValue: 0.4,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      // Button bounce
      const bounce = Animated.loop(
        Animated.sequence([
          Animated.timing(btnBounce, {
            toValue: 1.1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(btnBounce, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      ring1.start();
      ring2.start();
      bounce.start();

      return () => {
        ring1.stop();
        ring2.stop();
        bounce.stop();
      };
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(60);
    }
  }, [showModal]);

  // ── Fetch partner profile ──────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: generalUserDetailFn,
    onSuccess: (response) => setData(response.data),
    onError: (error: any) => {
      console.error("IncomingCallModal fetch failed:", error?.message);
    },
  });

  useEffect(() => {
    if (partnerId) {
      setData(null);
      setImageError(false);
      mutation.mutate(partnerId);
    }
  }, [partnerId]);

  const profile = data?.profile || data;
  const displayName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
    : "Unknown Caller";

  // ── Handlers ──────────────────────────────────────────────────────
  const handleReject = () => {
    if (isVideoCall) rejectVideo();
    else rejectVoice();
  };

  const handleAnswer = async () => {
    if (isVideoCall) {
      try {
        // Set isCalling state immediately for callee UI
        setVideoCalling(true);
        
        await acceptVideo();
        const route = `/videoCallAnswer/${JSON.stringify(videoPartnerId)}`;
        registerCall('video', route, videoPartnerId);
        router.push(route as any);
      } catch (error) {
        console.error("Error accepting video call:", error);
        hangUpVideo();
      }
    } else {
      try {
        // Set isCalling state immediately for callee UI
        setVoiceCalling(true);
        
        await acceptVoice();
        const route = `/callchat/${JSON.stringify({ userId: voicePartnerId })}`;
        registerCall('voice', route, voicePartnerId);
        router.push(route as any);
      } catch (error) {
        console.error("Error accepting call:", error);
        hangUpVoice();
      }
    }
  };

  if (!showModal) return null;

  return (
    <Modal transparent animationType="none" visible={showModal}>
      <StatusBar barStyle="light-content" />
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "#0F172A",
          opacity: fadeAnim,
        }}
      >
        {/* ── Top section ─────────────────────────────────── */}
        <Animated.View
          style={{
            alignItems: "center",
            paddingTop: 80,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.08)",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              marginBottom: 12,
            }}
          >
            <Ionicons
              name={isVideoCall ? "videocam" : "call"}
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
              {isVideoCall ? "VIDEO CALL" : "VOICE CALL"}
            </Text>
          </View>

          <Text
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 14,
              fontFamily: "TTFirsNeue",
            }}
          >
            Incoming call from
          </Text>
        </Animated.View>

        {/* ── Center: avatar + pulse rings ─────────────────── */}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          {/* Pulse ring 1 */}
          <Animated.View
            style={{
              position: "absolute",
              width: AVATAR_SIZE + RING_GAP,
              height: AVATAR_SIZE + RING_GAP,
              borderRadius: (AVATAR_SIZE + RING_GAP) / 2,
              borderWidth: 2,
              borderColor: primaryColor,
              opacity: pulse1Opacity,
              transform: [{ scale: pulse1 }],
            }}
          />
          {/* Pulse ring 2 */}
          <Animated.View
            style={{
              position: "absolute",
              width: AVATAR_SIZE + RING_GAP * 2,
              height: AVATAR_SIZE + RING_GAP * 2,
              borderRadius: (AVATAR_SIZE + RING_GAP * 2) / 2,
              borderWidth: 1.5,
              borderColor: primaryColor,
              opacity: pulse2Opacity,
              transform: [{ scale: pulse2 }],
            }}
          />

          {/* Avatar */}
          <View
            style={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              borderRadius: AVATAR_SIZE / 2,
              overflow: "hidden",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderWidth: 3,
              borderColor: primaryColor + "60",
              alignItems: "center",
              justifyContent: "center",
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
              <Text
                style={{
                  color: "#fff",
                  fontSize: 44,
                  fontWeight: "700",
                }}
              >
                {getInitials({
                  firstName: profile?.firstName || "",
                  lastName: profile?.lastName || "",
                })}
              </Text>
            )}
          </View>

          {/* Caller name */}
          <Text
            style={{
              color: "#fff",
              fontSize: 26,
              fontFamily: "TTFirsNeueMedium",
              marginTop: 24,
              textAlign: "center",
            }}
          >
            {displayName}
          </Text>

          {/* Subtitle */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: backgroundColortwo,
                marginRight: 8,
              }}
            />
            <Text
              style={{
                color: backgroundColortwo,
                fontSize: 14,
                fontFamily: "TTFirsNeue",
              }}
            >
              Ringing...
            </Text>
          </View>
        </View>

        {/* ── Bottom: action buttons ──────────────────────── */}
        <View
          style={{
            paddingBottom: 60,
            paddingTop: 24,
            paddingHorizontal: 40,
            backgroundColor: "rgba(255,255,255,0.05)",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            {/* Reject */}
            <View style={{ alignItems: "center" }}>
              <TouchableOpacity
                onPress={handleReject}
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
                <FontAwesome5 name="phone-slash" size={22} color="#fff" />
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

            {/* Accept */}
            <View style={{ alignItems: "center" }}>
              <Animated.View style={{ transform: [{ scale: btnBounce }] }}>
                <TouchableOpacity
                  onPress={handleAnswer}
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
                  <FontAwesome5
                    name={isVideoCall ? "video" : "phone"}
                    size={26}
                    color="#fff"
                  />
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
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default IncomingCallModal;
