import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";
import { addMessage, setRoom, setMessages, clearRoom, ChatMessage } from "redux/slices/chatSlice";
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
import { Profile } from "types/userDetailsType";
import { getInitials } from "utilizes/initialsName";

// Role config colors applied dynamically from theme inside component
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
  const ids = JSON.parse(userDetails || "{}");
  const partnerId = ids.userId;

  const scrollRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState("");
  const [data, setData] = useState<Profile | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

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
    onSuccess: (response) => setData(response.data),
    onError: (error: any) => console.error("Failed to load user:", error?.message),
  });

  useEffect(() => {
    mutation.mutate(partnerId);
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

    const handleJoinedRoom = (backendRoomId: string) => {
      roomRef.current = backendRoomId;
      dispatch(setRoom(backendRoomId));
      socket.emit("get_messages", { room: backendRoomId });
    };

    const handleReceiveMessages = (msgs: ChatMessage[]) => {
      dispatch(setMessages(msgs));
    };

    const handleReceiveMessage = (msg: ChatMessage) => {
      if (msg.from !== userId && msg.room === roomRef.current) {
        dispatch(addMessage(msg));
      }
    };

    const handleUploadFile = (msg: ChatMessage) => {
      if (msg.from !== userId && msg.room === roomRef.current) {
        dispatch(addMessage(msg));
      }
    };

    // Register ALL listeners BEFORE emitting join_room to avoid race condition
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
    dispatch(addMessage(msgPayload));
    setMessage("");
  };

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const handleVideoCall = useCallback(() => {
    router.push(`/videocall/${JSON.stringify({ userId: partnerId })}`);
  }, [router, partnerId]);

  const handleVoiceCall = useCallback(() => {
    router.push(`/callchat/${JSON.stringify({ userId: partnerId })}`);
  }, [router, partnerId]);

  const handleOpenAttachment = async (base64: string, fileName?: string) => {
    try {
      const name = fileName || "attachment.jpg";
      const fileUri = `${FileSystem.cacheDirectory}${name}`;
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(fileUri);
    } catch (err) {
      console.error("Failed to open attachment:", err);
    }
  };

  const scrollToBottom = () => scrollRef.current?.scrollToEnd({ animated: true });

  // ── Helpers ─────────────────────────────────────────────────────────
  const sortedMessages = [...messages].sort((a: ChatMessage, b: ChatMessage) => {
    return new Date(a.timestamp || "").getTime() - new Date(b.timestamp || "").getTime();
  });

  const getDateLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const shouldShowDate = (index: number) => {
    if (index === 0) return true;
    const curr = sortedMessages[index].timestamp || "";
    const prev = sortedMessages[index - 1].timestamp || "";
    return new Date(curr).toDateString() !== new Date(prev).toDateString();
  };

  const displayName = data ? `${data.firstName || ""} ${data.lastName || ""}`.trim() : "";
  const roleConfig = data?.user?.role ? ROLE_CONFIG[data.user.role] : null;

  // ── Loading state ───────────────────────────────────────────────────
  if (!data) {
    return (
      <ContainerTemplate>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={{ color: subText, marginTop: 12, fontSize: 13 }}>Loading chat...</Text>
        </View>
      </ContainerTemplate>
    );
  }

  return (
    <ContainerTemplate>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
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
                <TouchableOpacity className="relative mr-3" activeOpacity={0.8}>
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
                      <Text style={{ color: primaryColor, fontSize: 16, fontWeight: "700" }}>
                        {getInitials({ firstName: data.firstName || "", lastName: data.lastName || "" })}
                      </Text>
                    )}
                  </View>
                  <View
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                    style={{ backgroundColor: primaryColor, borderColor: selectioncardColor }}
                  />
                </TouchableOpacity>

                {/* Name + role */}
                <View className="flex-1">
                  <Text
                    style={{ color: secondaryTextColor, fontFamily: "TTFirsNeueMedium", fontSize: 16 }}
                    numberOfLines={1}
                  >
                    {displayName}
                  </Text>
                  <View className="flex-row items-center mt-0.5">
                    {roleConfig && (
                      <View
                        className="flex-row items-center px-1.5 py-0.5 rounded mr-2"
                        style={{ backgroundColor: roleConfig.color + "18" }}
                      >
                        <Ionicons name={roleConfig.icon as any} size={9} color={roleConfig.color} />
                        <Text
                          style={{ color: roleConfig.color, fontSize: 10, fontWeight: "600", marginLeft: 3 }}
                        >
                          {roleConfig.label}
                        </Text>
                      </View>
                    )}
                    {data?.user?.location?.state && (
                      <View className="flex-row items-center">
                        <Ionicons name="location-outline" size={10} color={subText} />
                        <Text style={{ color: subText, fontSize: 10, marginLeft: 2 }}>
                          {data.user.location.lga || ""} {data.user.location.state}
                        </Text>
                      </View>
                    )}
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
                  <Ionicons name="videocam-outline" size={18} color={primaryColor} />
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Messages ────────────────────────────────── */}
            <ScrollView
              ref={scrollRef}
              className="flex-1 px-4"
              contentContainerStyle={{ paddingTop: 12, paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
              onScroll={(e) => {
                const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
                const distFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
                setShowScrollBtn(distFromBottom > 200);
              }}
              scrollEventThrottle={100}
            >
              {sortedMessages.length === 0 && (
                <View className="items-center py-20">
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center mb-4"
                    style={{ backgroundColor: primaryColor + "12" }}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={28} color={primaryColor} />
                  </View>
                  <Text style={{ color: subText, fontSize: 14, fontFamily: "TTFirsNeue" }}>
                    Start the conversation
                  </Text>
                  <Text style={{ color: subText + "80", fontSize: 12, marginTop: 4 }}>
                    Say hello to {data.firstName}
                  </Text>
                </View>
              )}

              {sortedMessages.map((msg: ChatMessage, index: number) => {
                const isMine = msg.from === userId;
                const time = findTime(msg.timestamp || new Date().toISOString());
                const showDate = shouldShowDate(index);

                return (
                  <React.Fragment key={index}>
                    {/* Date separator */}
                    {showDate && (
                      <View className="items-center my-4">
                        <View
                          className="px-3 py-1 rounded-full"
                          style={{ backgroundColor: borderColor }}
                        >
                          <Text style={{ color: subText, fontSize: 11, fontFamily: "TTFirsNeue" }}>
                            {getDateLabel(msg.timestamp || "")}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Message bubble */}
                    <View
                      className={`mb-1.5 ${isMine ? "items-end" : "items-start"}`}
                      style={{ maxWidth: "80%" , alignSelf: isMine ? "flex-end" : "flex-start" }}
                    >
                      {msg.image ? (
                        <TouchableOpacity
                          onPress={() => handleOpenAttachment(msg.image!, msg.fileName)}
                          activeOpacity={0.85}
                        >
                          <View
                            className="rounded-2xl overflow-hidden"
                            style={{
                              backgroundColor: isMine ? primaryColor : selectioncardColor,
                              padding: 4,
                            }}
                          >
                            <Image
                              source={{ uri: `data:image/jpeg;base64,${msg.image}` }}
                              style={{ width: 200, height: 200, borderRadius: 14 }}
                              resizeMode="cover"
                            />
                            {msg.fileName && (
                              <Text
                                style={{
                                  color: isMine ? "rgba(255,255,255,0.7)" : subText,
                                  fontSize: 10,
                                  marginTop: 4,
                                  paddingHorizontal: 4,
                                }}
                              >
                                {msg.fileName}
                              </Text>
                            )}
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
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <View
                          style={{
                            backgroundColor: isMine ? primaryColor : selectioncardColor,
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
                              color: isMine ? "#fff" : secondaryTextColor,
                              fontSize: 14,
                              lineHeight: 20,
                              fontFamily: "TTFirsNeue",
                            }}
                          >
                            {msg.text}
                          </Text>
                          <View className="flex-row items-center justify-end mt-1 gap-x-1">
                            <Text
                              style={{
                                color: isMine ? "rgba(255,255,255,0.6)" : subText,
                                fontSize: 10,
                              }}
                            >
                              {time}
                            </Text>
                            {isMine && (
                              <Ionicons
                                name="checkmark-done"
                                size={12}
                                color="rgba(255,255,255,0.6)"
                              />
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  </React.Fragment>
                );
              })}
            </ScrollView>

            {/* Scroll-to-bottom FAB */}
            {showScrollBtn && (
              <TouchableOpacity
                onPress={scrollToBottom}
                className="absolute right-4 bottom-24 w-10 h-10 rounded-full items-center justify-center"
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
            )}

            {/* ── Input ──────────────────────────────────── */}
            <MessageInput
              receiverId={partnerId}
              message={message}
              setMessage={setMessage}
              onSend={handleSend}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ContainerTemplate>
  );
};

export default MainChatScreen;
