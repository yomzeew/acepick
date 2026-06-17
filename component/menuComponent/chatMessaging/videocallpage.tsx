import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useVideoCallContext } from "context/VideoCallContext";
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
  Dimensions,
} from "react-native";
import { RTCView } from "react-native-webrtc";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { generalUserDetailFn } from "services/userService";
import { getColors } from "static/color";
import { Profile } from "types/userDetailsType";
import { getInitials } from "utilizes/initialsName";
import { useRouter } from "expo-router";
import { useActiveCall } from "context/ActiveCallContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface MainProps {
  userDetails?: string;
}

const VideoCallPage = ({ userDetails = "{}" }: MainProps) => {
  const router = useRouter();
  const { startCall: registerCall, endCall: unregisterCall, activeCall, updateElapsed } = useActiveCall();
  const {
    isCalling,
    incomingCall,
    callUser,
    acceptCall,
    rejectCall,
    hangUp,
    setModalVisible,
    localStream,
    remoteStream,
    hasRemoteStream,
    toggleCamera,
    toggleVideo,
    toggleMute,
    isFrontCamera,
  } = useVideoCallContext();

  useEffect(() => {
    setModalVisible(false);
  }, []);

  const user = useSelector((state: RootState) => state?.auth.user);
  
  // Handle both JSON string and plain string for userDetails
  let partnerId: string;
  try {
    const ids = JSON.parse(userDetails);
    partnerId = ids?.userId;
    if (!partnerId) {
      console.error('❌ No userId found in userDetails:', userDetails);
      return;
    }
  } catch (error) {
    // If userDetails is not valid JSON, treat it as a plain userId string
    partnerId = userDetails;
    if (!partnerId) {
      console.error('❌ Empty userDetails provided');
      return;
    }
  }

  // Register active call route for the global banner
  useEffect(() => {
    if (isCalling && partnerId) {
      registerCall('video', `/videocall/${JSON.stringify({ userId: partnerId })}`, partnerId);
    }
  }, [isCalling, partnerId]);

  const [data, setData] = useState<Profile | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [callStatus, setCallStatus] = useState<
    "idle" | "ringing" | "connecting" | "connected" | "failed"
  >("idle");

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;
  const controlsOpacity = useRef(new Animated.Value(1)).current;

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
    onSuccess: (response) => {
      // Guard against null response
      if (response && response.data) {
        setData(response.data);
      }
    },
    onError: (error: any) => console.error("Failed to fetch user:", error?.message),
  });

  useEffect(() => {
    if (partnerId) mutation.mutate(partnerId);
  }, []);

  // Update global elapsed time when call is active
  useEffect(() => {
    if (isCalling && activeCall) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - activeCall.startTime) / 1000);
        updateElapsed(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isCalling, activeCall?.startTime, updateElapsed]);

  useEffect(() => {
    if (isCalling) {
      if (activeCall && activeCall.elapsed === 0) setCallStatus("connecting");
      else if (activeCall && activeCall.elapsed < 5) setCallStatus("ringing");
      else setCallStatus("connected");

      // Update status based on elapsed time
      const checkStatus = () => {
        if (activeCall && activeCall.elapsed === 0) setCallStatus("connecting");
        else if (activeCall && activeCall.elapsed < 5) setCallStatus("ringing");
        else setCallStatus("connected");
      };
      
      const statusInterval = setInterval(checkStatus, 1000);
      checkStatus(); // Check immediately
      
      return () => clearInterval(statusInterval);
    } else {
      if (activeCall && activeCall.elapsed > 0) setCallStatus("idle");
    }
  }, [isCalling, activeCall?.elapsed]);

  // Set callStatus based on actual connection state, not elapsed time
  useEffect(() => {
    if (isCalling) {
      setCallStatus('connected'); // answer-made fired → truly connected
    } else if (incomingCall) {
      setCallStatus('ringing');
    } else {
      setCallStatus('idle');
    }
  }, [isCalling, incomingCall]);

  // Set 'connecting' when callUser is called (handled in callUser function)
  // Set 'idle' on hangUp (handled in hangUp function)

  const statusConfig: Record<string, { text: string; color: string }> = {
    idle: { text: "Tap to call", color: "#9CA3AF" },
    ringing: {
      text: incomingCall ? "Incoming video call..." : "Ringing...",
      color: backgroundColortwo,
    },
    connecting: { text: "Connecting...", color: backgroundColortwo },
    connected: { text: formatTime(activeCall?.elapsed || 0), color: primaryColor },
    failed: { text: "Call failed", color: backgroundColortwo },
  };

  const currentStatus = statusConfig[callStatus];
  const displayName = data
    ? `${data.firstName || ""} ${data.lastName || ""}`.trim()
    : "Loading...";

  const hasLocalStream = localStream.current && localStream.current.toURL();

  const handleToggleControls = () => {
    if (callStatus === "connected") {
      setShowControls((prev) => !prev);
    }
  };

  const ActionButton = ({
    icon,
    color,
    bg,
    size = 52,
    iconSize = 20,
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
        <Text style={{ color: "#fff", fontSize: 11, marginTop: 6, fontFamily: "TTFirsNeue" }}>
          {label}
        </Text>
      )}
    </View>
  );

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handleToggleControls}
      style={{ flex: 1, backgroundColor: "#000" }}
    >
      <StatusBar barStyle="light-content" />

      {/* Remote video (full screen) */}
      {hasRemoteStream && callStatus === "connected" ? (
        <RTCView
          streamURL={remoteStream.current!.toURL()}
          style={{ flex: 1, width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
          objectFit="cover"
          mirror={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "#0F172A" }}>
          {/* Pulse rings when connecting */}
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
            </>
          )}

          {/* Avatar */}
          <View
            className="w-36 h-36 rounded-full overflow-hidden items-center justify-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              borderWidth: 3,
              borderColor: primaryColor + "60",
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
        </View>
      )}

      {/* Local video (picture-in-picture) */}
      {hasLocalStream && isCalling && (
        <View
          style={{
            position: "absolute",
            top: 60,
            right: 16,
            width: 120,
            height: 160,
            borderRadius: 12,
            overflow: "hidden",
            borderWidth: 2,
            borderColor: "rgba(255,255,255,0.3)",
            elevation: 10,
          }}
        >
          <RTCView
            streamURL={localStream.current!.toURL()}
            style={{ flex: 1 }}
            objectFit="cover"
            mirror={isFrontCamera}
            zOrder={1}
          />
        </View>
      )}

      {/* Top bar */}
      {showControls && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            paddingTop: 56,
            paddingHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              // Minimize — navigate away but keep call alive
              router.back();
            }}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <Ionicons name={isCalling ? "chevron-down" : "chevron-back"} size={20} color="#fff" />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Ionicons name="videocam" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={{ color: "#fff", fontSize: 16, fontFamily: "TTFirsNeueMedium" }}>
              Video Call
            </Text>
          </View>
          {callStatus === "connected" ? (
            <TouchableOpacity
              onPress={toggleCamera}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <Ionicons name="camera-reverse-outline" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      )}

      {/* Connected status overlay */}
      {callStatus === "connected" && showControls && (
        <View
          style={{
            position: "absolute",
            top: 110,
            left: 0,
            right: 0,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontFamily: "TTFirsNeueMedium" }}>
            {displayName}
          </Text>
          <Text style={{ color: primaryColor, fontSize: 14, marginTop: 4 }}>
            {formatTime(activeCall?.elapsed || 0)}
          </Text>
        </View>
      )}

      {/* Bottom actions */}
      {showControls && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: 48,
            paddingTop: 24,
            paddingHorizontal: 32,
            backgroundColor: "rgba(0,0,0,0.6)",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
          }}
        >
          {/* Idle state */}
          {!isCalling && !incomingCall && callStatus !== "connecting" && callStatus !== "ringing" && (
            <View className="items-center">
              <ActionButton
                icon="video"
                color="#fff"
                bg={primaryColor}
                size={68}
                iconSize={26}
                onPress={() => {
                  setCallStatus("connecting");
                  callUser(partnerId || "");
                }}
                label="Video Call"
              />
            </View>
          )}

          {/* Connecting/Ringing state - show End Call button */}
          {(callStatus === "connecting" || callStatus === "ringing") && !isCalling && (
            <View className="items-center">
              <ActionButton
                icon="phone-slash"
                color="#fff"
                bg={backgroundColortwo}
                size={68}
                iconSize={24}
                onPress={async () => {
                  setCallStatus("idle");
                  unregisterCall();
                  await hangUp();
                  router.back();
                }}
                label="End Call"
              />
            </View>
          )}

          {/* In-call controls */}
          {isCalling && (
            <View className="flex-row items-start justify-evenly">
              <ActionButton
                icon={isMuted ? "microphone-slash" : "microphone"}
                color="#fff"
                bg={isMuted ? backgroundColortwo : "rgba(255,255,255,0.2)"}
                onPress={() => {
                  const muted = toggleMute();
                  setIsMuted(muted);
                }}
                label={isMuted ? "Unmute" : "Mute"}
              />
              <ActionButton
                icon={isVideoOff ? "video-slash" : "video"}
                color="#fff"
                bg={isVideoOff ? backgroundColortwo : "rgba(255,255,255,0.2)"}
                onPress={() => {
                  toggleVideo();
                  setIsVideoOff(!isVideoOff);
                }}
                label={isVideoOff ? "Camera On" : "Camera Off"}
              />
              <ActionButton
                icon="phone-slash"
                color="#fff"
                bg={backgroundColortwo}
                size={64}
                iconSize={24}
                onPress={async () => {
                  setCallStatus("idle");
                  unregisterCall();
                  await hangUp();
                  router.back();
                }}
                label="End"
              />
              <ActionButton
                icon="camera"
                color="#fff"
                bg="rgba(255,255,255,0.2)"
                onPress={toggleCamera}
                label="Flip"
              />
            </View>
          )}

          {/* Incoming call controls - REMOVED */}
          {/* Incoming calls should only be handled in modal, not on active call screen */}
          {incomingCall && !isCalling && (
            <View className="flex-row items-start justify-evenly">
              {/* Empty view - incoming calls handled by modal */}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default VideoCallPage;
