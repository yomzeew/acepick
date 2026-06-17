import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useVideoCallContext } from "context/VideoCallContext";
import { router } from "expo-router";
import { useTheme } from "hooks/useTheme";
import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { RTCView } from "react-native-webrtc";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { generalUserDetailFn } from "services/userService";
import { getColors } from "static/color";
import { getInitials } from "utilizes/initialsName";
import { useActiveCall } from "context/ActiveCallContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface VideoCallAnswerProps {
  userId: any;
}

const VideoCallAnswer = ({ userId, route }: VideoCallAnswerProps & { route?: any }) => {
  const { startCall: registerCall, endCall: unregisterCall } = useActiveCall();
  const {
    isCalling,
    incomingCall,
    hangUp,
    remoteStream,
    localStream,
    partnerId,
    toggleCamera,
    toggleVideo,
    toggleMute,
    isFrontCamera,
  } = useVideoCallContext();

  // Register active call route for the global banner
  useEffect(() => {
    if (isCalling && partnerId) {
      registerCall('video', `/videoCallAnswer/${JSON.stringify(partnerId)}`, partnerId);
    }
  }, [isCalling, partnerId]);

  const { theme } = useTheme();
  const { primaryColor, selectioncardColor, backgroundColortwo } = getColors(theme);
  const [data, setData] = useState<any>(null);
  const [imageError, setImageError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const user = useSelector((state: RootState) => state?.auth?.user);

  const [callDuration, setCallDuration] = useState(0);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const mutation = useMutation({
    mutationFn: generalUserDetailFn,
    onSuccess: (response) => setData(response.data),
    onError: (error: any) => {
      let msg = "An unexpected error occurred";
      if (error?.response?.data) {
        msg =
          error.response.data.message ||
          error.response.data.error ||
          JSON.stringify(error.response.data);
      } else if (error?.message) {
        msg = error.message;
      }
      console.error("failed:", msg);
    },
  });

  useEffect(() => {
    mutation.mutate(partnerId);
  }, []);

  useEffect(() => {
    if (isCalling) {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(callTimerRef.current!);
      setCallDuration(0);
    }

    return () => {
      clearInterval(callTimerRef.current!);
    };
  }, [isCalling]);

  const handleHangUp = async () => {
    try {
      unregisterCall();
      await hangUp();
      router.back();
    } catch (error) {
      console.error("Failed to hang up:", error);
      router.back();
    }
  };

  const hasRemoteStream = remoteStream.current && remoteStream.current.toURL();
  const hasLocalStream = localStream.current && localStream.current.toURL();

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => setShowControls((prev) => !prev)}
      style={{ flex: 1, backgroundColor: "#000" }}
    >
      <StatusBar barStyle="light-content" />

      {/* Remote video (full screen) */}
      {hasRemoteStream ? (
        <RTCView
          streamURL={remoteStream.current!.toURL()}
          style={{ flex: 1, width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
          objectFit="cover"
          mirror={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "#0F172A" }}>
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
              <Text style={{ color: primaryColor }} className="text-6xl font-bold">
                {getInitials({ firstName: data?.firstName, lastName: data?.lastName })}
              </Text>
            )}
          </View>
          <Text
            style={{
              color: "#fff",
              fontSize: 22,
              fontFamily: "TTFirsNeueMedium",
              marginTop: 20,
            }}
          >
            {data?.firstName} {data?.lastName}
          </Text>
          <Text style={{ color: primaryColor, fontSize: 14, marginTop: 8 }}>
            {isCalling ? `Video Call - ${formatTime(callDuration)}` : "Connecting..."}
          </Text>
        </View>
      )}

      {/* Local video PiP */}
      {hasLocalStream && (
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
            <Ionicons name="videocam" size={16} color={primaryColor} style={{ marginRight: 6 }} />
            <Text style={{ color: "#fff", fontSize: 14 }}>
              {isCalling ? formatTime(callDuration) : "Connecting..."}
            </Text>
          </View>
          <TouchableOpacity
            onPress={toggleCamera}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <Ionicons name="camera-reverse-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom controls */}
      {showControls && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: 48,
            paddingTop: 20,
            paddingHorizontal: 24,
            backgroundColor: "rgba(0,0,0,0.6)",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-evenly",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              toggleMute();
              setIsMuted(!isMuted);
            }}
            style={{
              backgroundColor: isMuted ? backgroundColortwo : "rgba(255,255,255,0.2)",
              borderRadius: 28,
              width: 56,
              height: 56,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FontAwesome5
              name={isMuted ? "microphone-slash" : "microphone"}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              toggleVideo();
              setIsVideoOff(!isVideoOff);
            }}
            style={{
              backgroundColor: isVideoOff ? backgroundColortwo : "rgba(255,255,255,0.2)",
              borderRadius: 28,
              width: 56,
              height: 56,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FontAwesome5
              name={isVideoOff ? "video-slash" : "video"}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleHangUp}
            style={{
              backgroundColor: backgroundColortwo,
              borderRadius: 34,
              width: 68,
              height: 68,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: backgroundColortwo,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <FontAwesome5 name="phone-slash" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default VideoCallAnswer;
