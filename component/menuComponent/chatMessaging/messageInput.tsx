import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState, useCallback } from "react";
import { RootState } from "redux/store";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { useSocket } from "hooks/useSocket";
import { addMessage, ChatMessage } from "redux/slices/chatSlice";
import { uploadChatFileToLocal } from "services/localUploadService";
import { Audio } from "expo-av";
import ChatCacheService from "services/chatCache";

interface MessageInputProps {
  receiverId: string;
  message: string;
  setMessage: (val: string) => void;
  onSend: () => void;
}

const MessageInput = ({ receiverId, message, setMessage, onSend }: MessageInputProps) => {
  const { theme } = useTheme();
  const {
    secondaryTextColor,
    primaryColor,
    selectioncardColor,
    subText,
    backgroundColor,
    backgroundColortwo,
  } = getColors(theme);
  const user = useSelector((state: RootState) => state.auth.user);
  const roomId = useSelector((state: RootState) => state.chat.roomId);
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false);

  // ── Voice recording state ──────────────────────────────────
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startRecording = useCallback(async () => {
    try {
      if (!user?.id || !receiverId || !roomId) return;

      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        console.warn("[VoiceMsg] Microphone permission not granted");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      // Duration timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } catch (error) {
      console.error("[VoiceMsg] Failed to start recording:", error);
    }
  }, [user?.id, receiverId, roomId]);

  const cancelRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);

    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {}
      recordingRef.current = null;
    }
    setIsRecording(false);
    setRecordingDuration(0);
  }, []);

  const stopAndSendRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);

    const recording = recordingRef.current;
    recordingRef.current = null;
    setIsRecording(false);

    if (!recording) return;

    // Capture duration from our timer BEFORE unloading (getStatusAsync fails after unload)
    const capturedDuration = recordingDuration;

    try {
      // Get URI and status BEFORE unloading — after unload the recorder is deallocated
      const uri = recording.getURI();
      let durationSec = capturedDuration;
      try {
        const status = await recording.getStatusAsync();
        if (status.durationMillis) {
          durationSec = Math.round(status.durationMillis / 1000);
        }
      } catch {
        // Fallback to our timer-tracked duration
      }

      console.log("[VoiceMsg] Pre-unload URI:", uri, "duration:", durationSec);

      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      if (!uri) {
        console.warn("[VoiceMsg] No recording URI");
        return;
      }

      // Don't send recordings shorter than 1 second
      if (durationSec < 1) {
        setRecordingDuration(0);
        return;
      }

      setIsUploading(true);

      // Upload using local backend upload
      console.log("[VoiceMsg] Uploading audio file...");
      const audioUrl = await uploadChatFileToLocal(uri);
      console.log("[VoiceMsg] Upload success:", audioUrl);

      // Send as <audio>URL|duration message (like <img>URL for images)
      const payload: ChatMessage = {
        from: user!.id,
        to: receiverId,
        text: `<audio>${audioUrl}|${durationSec}`,
        room: roomId!,
        timestamp: new Date().toISOString(),
      };
      console.log("[VoiceMsg] Sending message:", payload.text.substring(0, 60));
      socket?.emit("send_message", payload);
      // Let server echo back via receive_message to avoid duplication
    } catch (error) {
      console.error("[VoiceMsg] Failed to send voice message:", error);
    } finally {
      setIsUploading(false);
      setRecordingDuration(0);
    }
  }, [user?.id, receiverId, roomId, socket, dispatch]);

  const sendImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      if (!user?.id || !receiverId || !roomId) return;

      setIsUploading(true);
      try {
        const imageUrl = await uploadChatFileToLocal(asset.uri);
        const payload: ChatMessage = {
          from: user.id,
          to: receiverId,
          text: `<img>${imageUrl}`,
          room: roomId,
          timestamp: new Date().toISOString(),
        };
        socket?.emit("send_message", payload);
        // Let server echo back via receive_message to avoid duplication
      } catch (error) {
        console.error("Chat image upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const hasText = message.trim().length > 0;
  const formatDur = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // ── Recording UI ───────────────────────────────────────────
  if (isRecording) {
    return (
      <View
        className="px-4 py-2 flex-row items-center gap-x-3"
        style={{
          backgroundColor: backgroundColor,
          borderTopWidth: 1,
          borderTopColor: selectioncardColor,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
        }}
      >
        {/* Cancel */}
        <TouchableOpacity
          onPress={cancelRecording}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: backgroundColortwo + "20" }}
        >
          <Ionicons name="trash-outline" size={20} color={backgroundColortwo} />
        </TouchableOpacity>

        {/* Recording indicator */}
        <View className="flex-1 flex-row items-center gap-x-2">
          <Animated.View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: backgroundColortwo,
              transform: [{ scale: pulseAnim }],
            }}
          />
          <Text
            style={{
              color: backgroundColortwo,
              fontSize: 15,
              fontFamily: "TTFirsNeueMedium",
            }}
          >
            {formatDur(recordingDuration)}
          </Text>
          <Text style={{ color: subText, fontSize: 13, fontFamily: "TTFirsNeue" }}>
            Recording...
          </Text>
        </View>

        {/* Send */}
        <TouchableOpacity
          onPress={stopAndSendRecording}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: primaryColor }}
        >
          <Ionicons name="send" size={18} color="#fff" style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      </View>
    );
  }

  // ── Normal input UI ────────────────────────────────────────
  return (
    <View
      className="px-4 py-2 flex-row items-end gap-x-2"
      style={{
        backgroundColor: backgroundColor,
        borderTopWidth: 1,
        borderTopColor: selectioncardColor,
        paddingBottom: Platform.OS === "ios" ? 28 : 10,
      }}
    >
      {/* Attach */}
      <TouchableOpacity
        onPress={sendImage}
        disabled={isUploading}
        className="w-10 h-10 rounded-full items-center justify-center mb-0.5"
        style={{ backgroundColor: selectioncardColor }}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color={primaryColor} />
        ) : (
          <Ionicons name="attach" size={20} color={primaryColor} />
        )}
      </TouchableOpacity>

      {/* Text input */}
      <View
        className="flex-1 flex-row items-end rounded-2xl px-4 py-2"
        style={{
          backgroundColor: selectioncardColor,
          minHeight: 42,
          maxHeight: 120,
        }}
      >
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor={subText}
          multiline
          style={{
            flex: 1,
            color: secondaryTextColor,
            fontSize: 14,
            fontFamily: "TTFirsNeue",
            maxHeight: 100,
            paddingTop: Platform.OS === "ios" ? 4 : 0,
            paddingBottom: Platform.OS === "ios" ? 4 : 0,
          }}
        />
      </View>

      {/* Send or Mic */}
      {hasText ? (
        <TouchableOpacity
          onPress={onSend}
          className="w-10 h-10 rounded-full items-center justify-center mb-0.5"
          style={{ backgroundColor: primaryColor }}
        >
          <Ionicons name="send" size={18} color="#fff" style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={startRecording}
          disabled={isUploading}
          className="w-10 h-10 rounded-full items-center justify-center mb-0.5"
          style={{ backgroundColor: primaryColor }}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="mic" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MessageInput;