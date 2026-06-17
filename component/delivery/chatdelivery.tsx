import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Linking,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { AntDesign, FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";
import { addMessage, setMessages, setRoom, clearRoom, ChatMessage } from "redux/slices/chatSlice";
import { useSocket } from "hooks/useSocket";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useMutation } from "@tanstack/react-query";
import { generalUserDetailFn, getClientDetailFn, getProfessionDetailFn } from "services/userService";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { ThemeText } from "component/ThemeText";
import { Textstyles } from "static/textFontsize";
import { findTime } from "utilizes/findtime";
import MessageInput from "component/menuComponent/chatMessaging/messageInput";
import { Profile } from "types/userDetailsType";



interface Message {
  from: string;
  to: string;
  text?: string;
  image?: string;
  time: string;
  fromSelf?: boolean;
  room?: string;
  fileName?: string;
  timestamp?:any
}

interface MainProps {
  userDetails: string;
}

const MainChatScreen = ({ userDetails }: MainProps) => {
    const user = useSelector((state: RootState) => state?.auth.user);
    const role=user?.role
    
    // Handle both plain ID string and JSON string
    let ids: { userId: string };
    try {
        // Try to parse as JSON first
        ids = JSON.parse(userDetails || "{}");
    } catch (error) {
        // If parsing fails, treat it as a plain ID
        ids = { userId: userDetails };
    }

  const partnerId = ids?.userId;
  const userId = user?.id || '';
  const scrollRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState<string>("");
  const [data, setData] = useState<Profile | null>(null);

  const { socket } = useSocket();
  const dispatch = useDispatch();
  const router = useRouter();
  
  const roomId = useSelector((state: RootState) => state.chat.roomId);
  const messages = useSelector((state: RootState) => state.chat.messages);

  const { theme } = useTheme();
  const { selectioncardColor, primaryColor } = getColors(theme);
 
 
  const mutation = useMutation({
    mutationFn: generalUserDetailFn,
    onSuccess: (response) => {
      // Guard against null response
      if (response && response.data) {
        setData(response.data);
      }
    },
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


 

const roomRef = useRef<string>("");



useEffect(() => {
  if (!socket || !partnerId || !userId) return;

  const handleError = (error: any) => console.log(error);
  const handleConnected = () => socket.emit("previous_chats");
  const handleReconnect = () => console.log("reconnect");

  socket.io.on("error", handleError);
  socket.on('connected', handleConnected);
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
    if (roomRef.current) {
      socket.emit("leave_room", { room: roomRef.current });
    }
    dispatch(clearRoom());
    socket.io.off("error", handleError);
    socket.off("connected", handleConnected);
    socket.off("reconnect", handleReconnect);
    socket.off("joined_room", handleJoinedRoom);
    socket.off("receive_messages", handleReceiveMessages);
    socket.off("receive_message", handleReceiveMessage);
    socket.off("receive_file", handleUploadFile);
  };
}, [socket, partnerId, userId]);

  
  

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
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleOpenAttachment = async (base64: string, fileName?: string) => {
    try {
      const name = fileName || 'attachment.jpg';
      const fileUri = `${FileSystem.cacheDirectory}${name}`;
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (err) {
      console.error('Failed to open attachment:', err);
    }
  };

  if (!data) return <ContainerTemplate><View className="justify-center items-center w-full h-full"><ActivityIndicator/></View></ContainerTemplate>

  return (
    <ContainerTemplate>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">

            {/* Header */}
            <View className="pt-16 justify-between flex-row px-4">
              <View className="flex-row items-center gap-x-2">
                <TouchableOpacity onPress={() => router.back()}>
                  <AntDesign name="left" size={20} color={primaryColor} />
                </TouchableOpacity>
                <Image
                  source={{ uri: data.avatar }}
                  className="w-12 h-12 rounded-full"
                />
                <ThemeText size={Textstyles.text_cmedium}>
                  {data.firstName}
                </ThemeText>
              </View>
              <View className="flex-row gap-x-4 items-center">
                <TouchableOpacity onPress={() => router.push(`/callchat/${JSON.stringify({userId: partnerId})}`)}>     
                  <FontAwesome5 name="video" size={20} color={primaryColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push(`/callchat/${JSON.stringify({userId: partnerId})}`)}>     
                  <FontAwesome5 name="phone" size={20} color={primaryColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {}}>
                  <FontAwesome5 name="search" size={20} color={primaryColor} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Info */}
            <View className="flex-row items-center justify-center gap-x-2 mb-4 mt-2">
              {data?.professional && (
                <>
                  <FontAwesome5 name="toolbox" size={12} color="red" />
                  {role === 'client' && data.professional?.profession?.title && (
                    <ThemeText size={Textstyles.text_xsmall}>{data.professional.profession.title}</ThemeText>
                  )}
                  {data.professional?.yearsOfExp != null && (
                    <ThemeText size={Textstyles.text_xsmall}>{data.professional.yearsOfExp} years</ThemeText>
                  )}
                </>
              )}
              {(data?.user?.location?.lga || data?.user?.location?.state) && (
                <>
                  <FontAwesome6 name="location-dot" size={12} color="red" />
                  <ThemeText size={Textstyles.text_xsmall}>
                    {data?.user?.location?.lga || ''} {data?.user?.location?.state || ''}
                  </ThemeText>
                </>
              )}
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollRef}
              className="flex-1 px-4"
              contentContainerStyle={{ paddingBottom: 110 }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((msg, index) => (
                <View
                  key={index}
                  className={`w-full mt-3 items-${msg.from === userId ? "end" : "start"}`}
                >
                  {msg.image ? (
                    <TouchableOpacity
                      onPress={() => handleOpenAttachment(msg.image!, msg.fileName)}
                    >
                      <Image
                        source={{ uri: `data:image/jpeg;base64,${msg.image}` }}
                        className="w-40 h-40 rounded-lg"
                        resizeMode="cover"
                      />
                      {msg.fileName && (
                        <Text className="text-xs text-gray-500 mt-1">{msg.fileName}</Text>
                      )}
                      <Text className="text-xs text-gray-400 mt-1">
                      { findTime(msg.timestamp || '')}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View
                      className={`w-2/3 px-3 py-2 rounded-lg ${
                        msg.from === userId
                          ? "bg-blue-600 rounded-tr-none"
                          : "bg-gray-200 rounded-tl-none"
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          msg.from === userId ? "text-white" : "text-black"
                        }`}
                      >
                        {msg.text}
                      </Text>
                      <View className="flex-row justify-between mt-1">
                        <Text
                          className={`text-xs ${
                            msg.from === userId ? "text-white" : "text-black"
                          }`}
                        >
                          {msg.from === userId ? "Delivered" : "Received"}
                        </Text>
                        <Text
                          className={`text-xs ${
                            msg.from === userId ? "text-white" : "text-black"
                          }`}
                        >
                            {findTime(msg.timestamp || '')}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Input */}
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
