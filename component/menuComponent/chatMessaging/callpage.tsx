import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useCall } from "context/WebRtcContext";
import { useSocket } from "hooks/useSocket";
import { useTheme } from "hooks/useTheme";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
  StatusBar,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { generalUserDetailFn } from "services/userService";
import { getColors } from "static/color";
import { Profile } from "types/userDetailsType";
import { getInitials } from "utilizes/initialsName";
import { useRouter } from "expo-router";

interface MainProps {
  userDetails?: string;
}

const CallChat = ({ userDetails = "{}" }: MainProps) => {
  const { socket } = useSocket();
  const router = useRouter();
  const {
    isCalling,
    incomingCall,
    callUser,
    acceptCall,
    rejectCall,
    hangUp,
    setModalVisible,
    toggleMute,
    toggleSpeaker,
  } = useCall();

  useEffect(() => {
    setModalVisible(false);
  }, []);

  const user = useSelector((state: RootState) => state?.auth.user);
  const ids = JSON.parse(userDetails);
  const partnerId = ids?.userId;

  const [data, setData] = useState<Profile | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callStatus, setCallStatus] = useState<
    "idle" | "ringing" | "connecting" | "connected" | "failed"
  >("idle");
  const [callDuration, setCallDuration] = useState(0);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Pulse animation for ringing
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (callStatus === "ringing" || callStatus === "connecting") {
      const pulse = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.3,
              duration: 1000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(pulseOpacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity, {
              toValue: 0.6,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [callStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const { theme } = useTheme();
  const { primaryColor, selectioncardColor, backgroundColortwo } = getColors(theme);

  const mutation = useMutation({
    mutationFn: generalUserDetailFn,
    onSuccess: (response) => setData(response.data),
    onError: (error: any) => console.error("Failed to fetch user:", error?.message),
  });

  useEffect(() => {
    if (partnerId) mutation.mutate(partnerId);
  }, []);

  useEffect(() => {
    if (isCalling) {
      setCallStatus("connecting");
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => {
          const next = prev + 1;
          if (next < 5) setCallStatus("ringing");
          else setCallStatus("connected");
          return next;
        });
      }, 1000);
    } else {
      setCallDuration((prev) => {
        if (prev > 0) setCallStatus("idle");
        return 0;
      });
      clearInterval(callTimerRef.current!);
    }
    return () => clearInterval(callTimerRef.current!);
  }, [isCalling]);

  useEffect(() => {
    if (incomingCall) setCallStatus("ringing");
    else if (!isCalling && !incomingCall) setCallStatus("idle");
  }, [incomingCall, isCalling]);

  const statusConfig: Record<string, { text: string; color: string }> = {
    idle: { text: "Tap to call", color: "#9CA3AF" },
    ringing: {
      text: incomingCall ? "Incoming call..." : "Ringing...",
      color: backgroundColortwo,
    },
    connecting: { text: "Connecting...", color: backgroundColortwo },
    connected: { text: formatTime(callDuration), color: primaryColor },
    failed: { text: "Call failed", color: backgroundColortwo },
  };

  const currentStatus = statusConfig[callStatus];
  const displayName = data
    ? `${data.firstName || ""} ${data.lastName || ""}`.trim()
    : "Loading...";

  // ── Action button helper ──────────────────────────────────────────────
  const ActionButton = ({
    icon,
    color,
    bg,
    size = 56,
    iconSize = 22,
    onPress,
    label,
  }: {
    icon: string;
    color: string;
    bg: string;
    size?: number;
    iconSize?: number;
    onPress: () => void;
    label?: string;
  }) => (
    <View className="items-center">
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: bg,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <FontAwesome5 name={icon} size={iconSize} color={color} />
      </TouchableOpacity>
      {label && (
        <Text style={{ color: "#9CA3AF", fontSize: 11, marginTop: 8, fontFamily: "TTFirsNeue" }}>
          {label}
        </Text>
      )}
    </View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: "#0F172A" }}>
      <StatusBar barStyle="light-content" />

      {/* Top bar */}
      <View className="pt-14 px-5 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: "#fff", fontSize: 16, fontFamily: "TTFirsNeueMedium" }}>
          Voice Call
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Center content */}
      <View className="flex-1 items-center justify-center">
        {/* Pulse rings */}
        {(callStatus === "ringing" || callStatus === "connecting") && (
          <>
            <Animated.View
              style={{
                position: "absolute",
                width: 180,
                height: 180,
                borderRadius: 90,
                borderWidth: 2,
                borderColor: primaryColor,
                opacity: pulseOpacity,
                transform: [{ scale: pulseAnim }],
              }}
            />
            <Animated.View
              style={{
                position: "absolute",
                width: 220,
                height: 220,
                borderRadius: 110,
                borderWidth: 1,
                borderColor: primaryColor,
                opacity: Animated.multiply(pulseOpacity, 0.5),
                transform: [{ scale: pulseAnim }],
              }}
            />
          </>
        )}

        {/* Connected ring */}
        {callStatus === "connected" && (
          <View
            style={{
              position: "absolute",
              width: 170,
              height: 170,
              borderRadius: 85,
              borderWidth: 3,
              borderColor: primaryColor + "40",
            }}
          />
        )}

        {/* Avatar */}
        <View
          className="w-36 h-36 rounded-full overflow-hidden items-center justify-center"
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            borderWidth: 3,
            borderColor: callStatus === "connected" ? primaryColor : primaryColor + "60",
          }}
        >
          {data?.avatar && !imageError ? (
            <Image
              resizeMode="cover"
              source={{ uri: data.avatar }}
              className="h-full w-full"
              onError={() => setImageError(true)}
            />
          ) : (
            <Text style={{ color: "#fff", fontSize: 48, fontWeight: "700" }}>
              {getInitials({
                firstName: data?.firstName || "",
                lastName: data?.lastName || "",
              })}
            </Text>
          )}
        </View>

        {/* Name */}
        <Text
          style={{
            color: "#fff",
            fontSize: 24,
            fontFamily: "TTFirsNeueMedium",
            marginTop: 24,
          }}
        >
          {displayName}
        </Text>

        {/* Status */}
        <View className="flex-row items-center mt-2">
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: currentStatus.color,
              marginRight: 8,
            }}
          />
          <Text
            style={{
              color: currentStatus.color,
              fontSize: 14,
              fontFamily: "TTFirsNeue",
            }}
          >
            {currentStatus.text}
          </Text>
        </View>

        {/* Duration (large) for connected state */}
        {callStatus === "connected" && (
          <Text
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 40,
              fontWeight: "200",
              marginTop: 16,
              letterSpacing: 4,
            }}
          >
            {formatTime(callDuration)}
          </Text>
        )}
      </View>

      {/* Bottom actions */}
      <View
        className="pb-12 pt-6 px-8"
        style={{
          backgroundColor: "rgba(255,255,255,0.05)",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
        }}
      >
        {/* Idle state - single call button */}
        {!isCalling && !incomingCall && (
          <View className="items-center">
            <ActionButton
              icon="phone"
              color="#fff"
              bg={primaryColor}
              size={68}
              iconSize={26}
              onPress={() => {
                setCallStatus("connecting");
                callUser(partnerId || "");
              }}
              label="Call"
            />
          </View>
        )}

        {/* In-call controls */}
        {isCalling && (
          <View className="flex-row items-start justify-evenly">
            <ActionButton
              icon={isMuted ? "microphone-slash" : "microphone"}
              color={isMuted ? "#fff" : "#fff"}
              bg={isMuted ? backgroundColortwo : "rgba(255,255,255,0.15)"}
              onPress={() => {
                const muted = toggleMute();
                setIsMuted(muted);
              }}
              label={isMuted ? "Unmute" : "Mute"}
            />
            <ActionButton
              icon="phone-slash"
              color="#fff"
              bg={backgroundColortwo}
              size={68}
              iconSize={24}
              onPress={async () => {
                setCallStatus("idle");
                await hangUp();
              }}
              label="End"
            />
            <ActionButton
              icon="volume-up"
              color={isSpeaker ? "#fff" : "#fff"}
              bg={isSpeaker ? primaryColor : "rgba(255,255,255,0.15)"}
              onPress={async () => {
                const newSpeaker = !isSpeaker;
                setIsSpeaker(newSpeaker);
                await toggleSpeaker(newSpeaker);
              }}
              label="Speaker"
            />
          </View>
        )}

        {/* Incoming call controls */}
        {incomingCall && !isCalling && (
          <View className="flex-row items-start justify-evenly">
            <ActionButton
              icon="phone-slash"
              color="#fff"
              bg={backgroundColortwo}
              size={64}
              iconSize={24}
              onPress={async () => {
                setCallStatus("idle");
                await rejectCall();
              }}
              label="Decline"
            />
            <ActionButton
              icon="phone"
              color="#fff"
              bg={primaryColor}
              size={64}
              iconSize={24}
              onPress={async () => {
                setCallStatus("connecting");
                await acceptCall();
              }}
              label="Accept"
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default CallChat;
