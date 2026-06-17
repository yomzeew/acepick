import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";
import { addMessage, setRoom, setMessages, clearRoom, loadCachedMessages, ChatMessage } from "redux/slices/chatSlice";
import ChatCacheService from "services/chatCache";
import { useSocket } from "hooks/useSocket";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useMutation } from "@tanstack/react-query";
import { generalUserDetailFn } from "services/userService";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { findTime } from "utilizes/findtime";
import MessageInput from "component/menuComponent/chatMessaging/messageInput";
import AudioMessageBubble from "component/menuComponent/chatMessaging/voiceRecord";
import { Profile } from "types/userDetailsType";
import { getInitials } from "utilizes/initialsName";

const ROLE_CONFIG_KEYS = {
  client: { icon: "person", label: "Client" },
  professional: { icon: "construct", label: "Professional" },
  delivery: { icon: "bicycle", label: "Delivery" },
};

interface MainProps {
  userDetails?: string;
}

const MainChatScreen = ({ userDetails = "{}" }: MainProps) => {
  const user = useSelector((state: RootState) => state?.auth.user);

  let ids: { userId: string };
  try {
    ids = JSON.parse(userDetails || "{}");
  } catch (error) {
    ids = { userId: userDetails };
  }

  const partnerId = ids.userId;

  const scrollRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState("");
  const [data, setData] = useState<Profile | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const isNearBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);
  // Track whether we've done the initial scroll
  const hasInitialScrolled = useRef(false);

  const { socket } = useSocket();
  const dispatch = useDispatch();
  const router = useRouter();

  const userId = user?.id!;
  const roomId = useSelector((state: RootState) => state.chat.roomId);
  const messages = useSelector((state: RootState) => state.chat.messages);

  const { theme } = useTheme();
  const {
    selectioncardColor,
    primaryColor,
    backgroundColor,
    secondaryTextColor,
    subText,
    borderColor,
    backgroundColortwo,
  } = getColors(theme);

  const ROLE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
    client: { icon: "person", color: primaryColor, label: "Client" },
    professional: { icon: "construct", color: backgroundColortwo, label: "Professional" },
    delivery: { icon: "bicycle", color: primaryColor, label: "Delivery" },
  };

  const mutation = useMutation({
    mutationFn: generalUserDetailFn,
    onSuccess: (response) => {
      if (response && response.data) {
        setData(response.data);
        
        // Console log partner details when loaded in chat
        console.log('=== Chat Partner Details (Main Chat) ===', {
          partnerId: partnerId,
          name: `${response.data.firstName || ""} ${response.data.lastName || ""}`.trim(),
          avatar: response.data.avatar,
          role: response.data.role,
          email: response.data.email,
          phone: response.data.phone,
          profession: response.data.professional?.profession?.name,
          isVerified: response.data.verified,
          userId: response.data.userId,
          fullData: response.data
        });
      }
    },
    onError: (error: any) => console.error("Failed to load user:", error?.message),
  });

  useEffect(() => {
    mutation.mutate(partnerId);
  }, []);

  // ── Keyboard listeners ───────────────────────────────────────────────
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        // When keyboard opens, scroll to bottom if user was near bottom
        if (isNearBottomRef.current) {
          setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        }
      }
    );
    return () => showSub.remove();
  }, []);

  // ── Socket setup ────────────────────────────────────────────────────
  const roomRef = useRef<string>("");

  useEffect(() => {
    if (!socket || !partnerId || !userId) return;

    const handleError = (error: any) => console.log(error);
    const handleConnected = () => socket.emit("previous_chats");
    const handleReconnect = () => console.log("reconnect");

    socket.io.on("error", handleError);
    socket.on("connected", handleConnected);
    socket.on("reconnect", handleReconnect);

    const handleJoinedRoom = async (backendRoomId: string) => {
      roomRef.current = backendRoomId;
      dispatch(setRoom(backendRoomId));

      const cached = await ChatCacheService.getMessages(backendRoomId);
      if (cached.length > 0) {
        dispatch(loadCachedMessages(cached));
        // Scroll to bottom for cached messages
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 200);
      }

      const lastTs = await ChatCacheService.getLastTimestamp(backendRoomId);
      socket.emit("get_messages", { room: backendRoomId, ...(lastTs ? { since: lastTs } : {}) });
    };

    const handleReceiveMessages = async (msgs: ChatMessage[]) => {
      if (msgs.length > 0) {
        const cached = await ChatCacheService.getMessages(roomRef.current);
        if (cached.length > 0) {
          const cacheSet = new Set(cached.map(m => `${m.from}|${m.text}|${m.timestamp}`));
          const newMsgs = msgs.filter(m => !cacheSet.has(`${m.from}|${m.text}|${m.timestamp}`));
          const merged = [...cached, ...newMsgs];
          dispatch(setMessages(merged));
          ChatCacheService.setMessages(roomRef.current, merged);
        } else {
          dispatch(setMessages(msgs));
          ChatCacheService.setMessages(roomRef.current, msgs);
        }
        // Scroll to bottom after receiving messages
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 200);
      } else {
        const cached = await ChatCacheService.getMessages(roomRef.current);
        if (cached.length > 0) {
          dispatch(setMessages(cached));
          // Scroll to bottom for cached messages
          setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 200);
        }
      }
    };

    const handleReceiveMessage = (msg: ChatMessage) => {
      if (msg.room === roomRef.current) {
        dispatch(addMessage(msg));
        ChatCacheService.addMessage(roomRef.current, msg);
      }
    };

    const handleUploadFile = (msg: ChatMessage) => {
      if (msg.room === roomRef.current) {
        dispatch(addMessage(msg));
        ChatCacheService.addMessage(roomRef.current, msg);
      }
    };

    socket.once("joined_room", handleJoinedRoom);
    socket.on("receive_messages", handleReceiveMessages);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("receive_file", handleUploadFile);

    socket.emit("join_room", { contactId: partnerId });

    return () => {
      if (roomRef.current) socket.emit("leave_room", { room: roomRef.current });
      dispatch(clearRoom());
      socket.io.off("error", handleError);
      socket.off("connected", handleConnected);
      socket.off("reconnect", handleReconnect);
      socket.off("joined_room", handleJoinedRoom);
      socket.off("receive_messages", handleReceiveMessages);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("receive_file", handleUploadFile);
    };
  }, [socket, partnerId, userId, dispatch]);

  // ── Handlers ────────────────────────────────────────────────────────
  const handleSend = () => {
    if (!message.trim() || !userId || !partnerId || !roomId) return;
    const msgPayload: ChatMessage = {
      from: userId,
      to: partnerId,
      text: message,
      room: roomId,
      timestamp: new Date().toISOString(),
    };
    socket?.emit("send_message", msgPayload);
    setMessage("");
    // Always scroll to bottom when user sends a message
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // ── Auto-scroll when new messages arrive ────────────────────────────
  useEffect(() => {
    if (messages.length === 0) return;

    const isNewMessage = messages.length > prevMessageCountRef.current;
    const isInitialLoad = !hasInitialScrolled.current;

    if (isInitialLoad) {
      // Always scroll to bottom on first load — no animation so it's instant
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: false });
        hasInitialScrolled.current = true;
        // Set near bottom to true after initial load
        isNearBottomRef.current = true;
      }, 150);
    } else if (isNewMessage) {
      // Always scroll to bottom for new messages (not just when near bottom)
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      // Update near bottom state after scrolling
      isNearBottomRef.current = true;
    }

    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  const handleVideoCall = useCallback(() => {
    router.push(`/videocall/${JSON.stringify({ userId: partnerId })}`);
  }, [router, partnerId]);

  const handleVoiceCall = useCallback(() => {
    router.push(`/callchat/${JSON.stringify({ userId: partnerId })}`);
  }, [router, partnerId]);

  const handleOpenAttachment = async (data: string, fileName?: string) => {
    try {
      const name = fileName || "attachment.jpg";
      const fileUri = `${FileSystem.cacheDirectory}${name}`;

      if (data.startsWith("http://") || data.startsWith("https://")) {
        const download = await FileSystem.downloadAsync(data, fileUri);
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(download.uri);
      } else {
        await FileSystem.writeAsStringAsync(fileUri, data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(fileUri);
      }
    } catch (err) {
      console.error("Failed to open attachment:", err);
    }
  };

  const scrollToBottom = () => scrollRef.current?.scrollToEnd({ animated: true });

  // ── Helpers ─────────────────────────────────────────────────────────
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a: ChatMessage, b: ChatMessage) => {
      return new Date(a.timestamp || "").getTime() - new Date(b.timestamp || "").getTime();
    });
  }, [messages]);

  const renderMessageContent = (msg: ChatMessage, isMine: boolean, time: string) => {
    const text = (msg.text || "").trim();

    if (text.startsWith("<missedcall>")) {
      const callType = text.replace("<missedcall>", "").trim();
      const isVideo = callType === "video";
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: isMine ? primaryColor + "20" : selectioncardColor + "20",
            borderRadius: 12,
            gap: 8,
          }}
        >
          <View
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: isMine ? primaryColor + "30" : selectioncardColor }}
          >
            <Ionicons
              name={isVideo ? "videocam-outline" : "call-outline"}
              size={16}
              color={isMine ? primaryColor : subText}
            />
          </View>
          <View>
            <Text
              style={{
                color: isMine ? primaryColor : secondaryTextColor,
                fontSize: 13,
                fontFamily: "TTFirsNeueMedium",
              }}
            >
              {isMine ? "Outgoing" : "Missed"}{" "}
              {isVideo ? "video" : "voice"} call
            </Text>
            <Text style={{ color: subText, fontSize: 10, marginTop: 2 }}>
              {time}
            </Text>
          </View>
        </View>
      );
    }

    if (text.startsWith("<completedcall>")) {
      const callData = text.replace("<completedcall>", "").trim();
      const [callType, durationStr] = callData.split(":");
      const durationSeconds = parseInt(durationStr || "0", 10);
      const isVideo = callType === "video";
      
      // Format duration as MM:SS
      const minutes = Math.floor(durationSeconds / 60);
      const seconds = durationSeconds % 60;
      const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: isMine ? primaryColor + "20" : selectioncardColor + "20",
            borderRadius: 12,
            gap: 8,
          }}
        >
          <View
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: isMine ? primaryColor + "30" : selectioncardColor }}
          >
            <Ionicons
              name={isVideo ? "videocam" : "call"}
              size={16}
              color={isMine ? primaryColor : subText}
            />
          </View>
          <View>
            <Text
              style={{
                color: isMine ? primaryColor : secondaryTextColor,
                fontSize: 13,
                fontFamily: "TTFirsNeueMedium",
              }}
            >
              {isMine ? "Outgoing" : "Incoming"}{" "}
              {isVideo ? "video" : "voice"} call
            </Text>
            <Text style={{ color: subText, fontSize: 10, marginTop: 2 }}>
              {formattedDuration} • {time}
            </Text>
          </View>
        </View>
      );
    }

    if (text.startsWith("<audio>")) {
      const audioData = text.replace("<audio>", "");
      const [audioUrl, durStr] = audioData.split("|");
      const duration = parseFloat(durStr) || 0;
      return (
        <AudioMessageBubble
          url={audioUrl}
          duration={duration}
          isMine={isMine}
          primaryColor={primaryColor}
          subText={subText}
          time={time}
        />
      );
    }

    if (text.startsWith("<img>")) {
      return (
        <TouchableOpacity
          onPress={() => handleOpenAttachment(text.replace("<img>", ""))}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: text.replace("<img>", "") }}
            style={{ width: 200, height: 200, borderRadius: 14 }}
            resizeMode="cover"
          />
          <Text
            style={{
              color: isMine ? "rgba(255,255,255,0.6)" : subText,
              fontSize: 10,
              textAlign: "right",
              paddingHorizontal: 4,
              paddingBottom: 2,
              marginTop: 2,
            }}
          >
            {time}
          </Text>
        </TouchableOpacity>
      );
    }

    if (msg.image) {
      return (
        <TouchableOpacity
          onPress={() => handleOpenAttachment(msg.image!, msg.fileName)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: msg.image }}
            style={{ width: 200, height: 200, borderRadius: 14 }}
            resizeMode="cover"
          />
          {msg.fileName ? (
            <Text
              style={{
                color: isMine ? "rgba(255,255,255,0.7)" : subText,
                fontSize: 10,
                paddingHorizontal: 4,
                paddingBottom: 2,
                marginTop: 2,
              }}
            >
              {msg.fileName}
            </Text>
          ) : null}
          <Text
            style={{
              color: isMine ? "rgba(255,255,255,0.6)" : subText,
              fontSize: 10,
              textAlign: "right",
              paddingHorizontal: 4,
              paddingBottom: 2,
              marginTop: 2,
            }}
          >
            {time}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View
        style={{
          backgroundColor: isMine ? "#1a365d" : selectioncardColor, // Darker blue for better contrast
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 20,
          borderTopRightRadius: isMine ? 6 : 20,
          borderTopLeftRadius: isMine ? 20 : 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 3,
          elevation: 1,
        }}
      >
        <Text
          style={{
            color: isMine ? "#ffffff" : secondaryTextColor, // Pure white for better contrast on dark blue
            fontSize: 14,
            lineHeight: 20,
            fontFamily: "TTFirsNeue",
          }}
        >
          {text}
        </Text>
        <View className="flex-row items-center justify-end mt-1 gap-x-1">
          <Text
            style={{
              color: isMine ? "rgba(255,255,255,0.8)" : subText, // Better contrast for timestamps
              fontSize: 10,
            }}
          >
            {time}
          </Text>
          {isMine ? (
            <Ionicons
              name="checkmark-done"
              size={12}
              color="rgba(255,255,255,0.8)" // Better contrast for checkmarks
            />
          ) : null}
        </View>
      </View>
    );
  };

  const getDateLabel = (timestamp: string) => {
    if (!timestamp) return "Today";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const shouldShowDate = (index: number) => {
    if (index === 0) return true;
    
    // Safety checks for undefined messages
    const currMsg = sortedMessages[index];
    const prevMsg = sortedMessages[index - 1];
    
    if (!currMsg || !prevMsg) return false;
    
    const curr = currMsg.timestamp || "";
    const prev = prevMsg.timestamp || "";
    return new Date(curr).toDateString() !== new Date(prev).toDateString();
  };

  // ── Message Item Component (memoized to prevent flickering) ─────────────
  const MessageItem = useCallback(({ msg, index }: { msg: ChatMessage; index: number }) => {
    // Safety check for undefined message
    if (!msg) {
      return null;
    }
    
    const isMine = msg.from === userId;
    const time = findTime(msg.timestamp || new Date().toISOString());
    const showDate = shouldShowDate(index);

    return (
      <React.Fragment key={`${msg.from || 'unknown'}-${msg.timestamp || Date.now()}-${index}`}>
        {/* Date separator */}
        {showDate ? (
          <View className="items-center my-4">
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: primaryColor + "12" }}
            >
              <Text
                style={{
                  color: subText,
                  fontSize: 11,
                  fontFamily: "TTFirsNeue",
                }}
              >
                {getDateLabel(msg.timestamp || "")}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Message bubble */}
        <View
          style={{
            flexDirection: isMine ? "row-reverse" : "row",
            marginBottom: 12,
            alignItems: "flex-end",
          }}
          className="mx-2"
        >
          <View
            style={{
              backgroundColor: isMine ? "#1a365d" : selectioncardColor, // Darker blue for better contrast
              borderRadius: 18,
              borderBottomRightRadius: isMine ? 4 : 18,
              borderBottomLeftRadius: isMine ? 18 : 4,
              maxWidth: "75%",
              paddingHorizontal: 16,
              paddingVertical: 10,
              elevation: 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }}
          >
            {renderMessageContent(msg, isMine, time)}
          </View>
        </View>
      </React.Fragment>
    );
  }, [userId, primaryColor, selectioncardColor]);

  const displayName = data
    ? `${data.firstName || ""} ${data.lastName || ""}`.trim()
    : "";
  const roleConfig = data?.user?.role ? ROLE_CONFIG[data.user.role] : null;

  // ── Loading state ───────────────────────────────────────────────────
  if (!data) {
    return (
      <ContainerTemplate>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={{ color: subText, marginTop: 12, fontSize: 13 }}>
            {"Loading chat..."}
          </Text>
        </View>
      </ContainerTemplate>
    );
  }

  return (
    <ContainerTemplate>
      {/*
        ─────────────────────────────────────────────────────────────
        KeyboardAvoidingView is the KEY fix.
        - On iOS: "padding" pushes the content up when the keyboard opens
        - On Android: set behavior={undefined} and rely on
          android:windowSoftInputMode="adjustResize" in AndroidManifest.xml
          OR use "height" if adjustResize is not set
        ─────────────────────────────────────────────────────────────
      */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={{ flex: 1 }}>
          {/* ── Header ─────────────────────────────────── */}
          <View
            className="pt-14 pb-3 flex-row items-center justify-between"
            style={{
              backgroundColor: selectioncardColor,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center flex-1 px-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-9 h-9 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: primaryColor + "15" }}
              >
                <AntDesign name="left" size={16} color={primaryColor} />
              </TouchableOpacity>

              {/* Avatar */}
              <TouchableOpacity
                className="relative mr-3"
                activeOpacity={0.8}
                onPress={() => {
                  if ((data as any)?.role === 'delivery') {
                    router.push(`/rider/${partnerId}` as any);
                  } else {
                    const profId = (data as any)?.professional?.id;
                    if (profId) {
                      router.push(`/professional/${profId}` as any);
                    } else {
                      router.push(`/professional/${partnerId}?byUser=1` as any);
                    }
                  }
                }}
              >
                <View
                  className="w-11 h-11 rounded-full overflow-hidden items-center justify-center"
                  style={{ backgroundColor: primaryColor + "15" }}
                >
                  {data.avatar && !imageError ? (
                    <Image
                      source={{ uri: data.avatar }}
                      className="w-full h-full"
                      resizeMode="cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <Text
                      style={{
                        color: primaryColor,
                        fontSize: 16,
                        fontWeight: "700",
                      }}
                    >
                      {getInitials({
                        firstName: data.firstName || "",
                        lastName: data.lastName || "",
                      })}
                    </Text>
                  )}
                </View>
                <View
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                  style={{
                    backgroundColor: primaryColor,
                    borderColor: selectioncardColor,
                  }}
                />
              </TouchableOpacity>

              {/* Name + role */}
              <View className="flex-1">
                <Text
                  style={{
                    color: secondaryTextColor,
                    fontFamily: "TTFirsNeueMedium",
                    fontSize: 16,
                  }}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  {roleConfig ? (
                    <View
                      className="flex-row items-center px-1.5 py-0.5 rounded mr-2"
                      style={{ backgroundColor: roleConfig.color + "18" }}
                    >
                      <Ionicons
                        name={roleConfig.icon as any}
                        size={9}
                        color={roleConfig.color}
                      />
                      <Text
                        style={{
                          color: roleConfig.color,
                          fontSize: 10,
                          fontWeight: "600",
                          marginLeft: 3,
                        }}
                      >
                        {roleConfig.label}
                      </Text>
                    </View>
                  ) : null}
                  {data?.user?.location?.state ? (
                    <View className="flex-row items-center">
                      <Ionicons
                        name="location-outline"
                        size={10}
                        color={subText}
                      />
                      <Text
                        style={{ color: subText, fontSize: 10, marginLeft: 2 }}
                      >
                        {`${data.user.location.lga || ""} ${data.user.location.state}`}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            {/* Action buttons */}
            <View className="flex-row items-center gap-x-1 px-4">
              <TouchableOpacity
                onPress={handleVoiceCall}
                className="w-9 h-9 rounded-full items-center justify-center"
                style={{ backgroundColor: primaryColor + "15" }}
              >
                <Ionicons name="call-outline" size={18} color={primaryColor} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleVideoCall}
                className="w-9 h-9 rounded-full items-center justify-center"
                style={{ backgroundColor: primaryColor + "15" }}
              >
                <Ionicons
                  name="videocam-outline"
                  size={18}
                  color={primaryColor}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Messages Container ─────────────────────────── */}
          <View style={{ flex: 1 }}>
            <ScrollView
              ref={scrollRef}
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingTop: 12,
                paddingBottom: 16,
                paddingHorizontal: 16,
                flexGrow: 1,          // ← allows empty state to center properly
              }}
              showsVerticalScrollIndicator={false}
              // ── KEY FIX: remove onContentSizeChange auto-scroll logic ──
              // We now handle all scrolling in the useEffect above.
              // onContentSizeChange would fire on EVERY render and fight the user.
              onScroll={(e) => {
                const { contentOffset, layoutMeasurement, contentSize } =
                  e.nativeEvent;
                const distFromBottom =
                  contentSize.height -
                  layoutMeasurement.height -
                  contentOffset.y;
                isNearBottomRef.current = distFromBottom < 150;
                setShowScrollBtn(distFromBottom > 200);
              }}
              scrollEventThrottle={16}
              removeClippedSubviews={false}
              automaticallyAdjustContentInsets={false}
              // ── KEY FIX: use 'on-drag' instead of 'interactive' ──
              // 'interactive' on Android can cause scroll to stop working
              // until the keyboard is touched
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"  // ← allows tapping bubbles without dismissing keyboard
              alwaysBounceVertical={false}          // ← prevent empty bounce fighting scroll
            >
              {sortedMessages.length === 0 ? (
                <View className="items-center py-20">
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center mb-4"
                    style={{ backgroundColor: primaryColor + "12" }}
                  >
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={28}
                      color={primaryColor}
                    />
                  </View>
                  <Text
                    style={{
                      color: subText,
                      fontSize: 14,
                      fontFamily: "TTFirsNeue",
                    }}
                  >
                    {"Start the conversation"}
                  </Text>
                  <Text
                    style={{
                      color: subText + "80",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    {`Say hello to ${data.firstName || ""}`}
                  </Text>
                </View>
              ) : null}

              {sortedMessages.map((msg: ChatMessage, index: number) => (
                <MessageItem key={`${msg.from}-${msg.timestamp}-${index}`} msg={msg} index={index} />
              ))}
            </ScrollView>

            {/* Scroll-to-bottom FAB */}
            {showScrollBtn ? (
              <TouchableOpacity
                onPress={scrollToBottom}
                className="absolute right-4 bottom-4 w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: selectioncardColor,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Ionicons name="chevron-down" size={20} color={primaryColor} />
              </TouchableOpacity>
            ) : null}

            {/* ── Input ──────────────────────────────────── */}
            <MessageInput
              receiverId={partnerId}
              message={message}
              setMessage={setMessage}
              onSend={handleSend}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ContainerTemplate>
  );
};

export default MainChatScreen;
