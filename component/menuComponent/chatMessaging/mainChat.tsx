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
import { addMessage, setMessages, setRoom } from "redux/chatSlice";
import MessageInput from "./messageInput";
import { useSocket } from "hooks/useSocket";
import { selectChatMessages } from "utilizes/chatselector";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import { ProfessionalData, UserData } from "type";
import { useMutation } from "@tanstack/react-query";
import { getClientDetailFn, getProfessionDetailFn } from "services/userService";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { ThemeText } from "component/ThemeText";
import { Textstyles } from "static/textFontsize";
import { findTime } from "utilizes/findtime";


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
  const ids = JSON.parse(userDetails);

  const receiverId = ids?.userId;
  const professionalId = ids.professionalId;

  const payload=role==='client'?professionalId:receiverId
  const scrollRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState<string>("");
  const [data, setData] = useState<any>(null);

  const { socket } = useSocket();
  const dispatch = useDispatch();
  const router = useRouter();
  
  const userId = user?.id!;
  const roomId = useSelector((state: RootState) => state.chat.roomId);
  const messages = useSelector(selectChatMessages(roomId));

  const { theme } = useTheme();
  const { selectioncardColor, primaryColor } = getColors(theme);
  const functiontoUse=role==='client'?getProfessionDetailFn:getClientDetailFn
 
  const mutation = useMutation({
    mutationFn: functiontoUse,
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
    mutation.mutate(payload);
  }, []);


 

const roomRef = useRef<string>("");



// ✅ Define this BEFORE you use it
const cleanupListeners = () => {
  socket?.off("joined_room");
  socket?.off("got_previous_chats");
  socket?.off("receive_message");
  socket?.off("receive_messages");
  socket?.off("receive_file");
};

useEffect(() => {
  if (!socket || !receiverId || !userId) return;

  socket.io.on("error", (error) => {
    console.log(error);
});

socket.on('connected', () => {
    socket.emit("previous_chats");
})

socket.on("reconnect", () => {
    console.log("reconnect")
})


  socket.emit("join_room", { contactId: receiverId });

  cleanupListeners(); // ✅ safe to call now

  const handleJoinedRoom = (backendRoomId: string) => {
    roomRef.current = backendRoomId;
    dispatch(setRoom(backendRoomId));
    socket.emit("get_messages", { room: backendRoomId });
  };
 
  socket.on("receive_messages", (messages) => {
    dispatch(setMessages({ roomId: roomRef.current, messages }));
  });



  const handleReceiveMessage = (msg: Message) => {
    if (msg.from !== userId && roomRef.current) {
      dispatch(addMessage({ roomId: roomRef.current, message: msg }));
    }
  };

  const handleUploadFile = (msg: Message) => {
    if (msg.from !== userId && roomRef.current) {
      dispatch(addMessage({ roomId: roomRef.current, message: msg }));
    }
  };


  socket.once("joined_room", handleJoinedRoom);
  socket.on("receive_message", handleReceiveMessage);
  socket.on("receive_file", handleUploadFile);

  return () => {
    if (roomRef.current) {
      socket.emit("leave_room", { room: roomRef.current });
    }
    cleanupListeners();
  };
}, [socket, receiverId, userId,message,messages]);

  
  

  const handleSend = () => {
    console.log(userId,receiverId)
    if (!message.trim() || !userId || !receiverId || !roomId) return;

    const msgPayload: Message = {
      from: userId,
      to: receiverId,
      text: message,
      room: roomId,
      time: new Date().toISOString(),
      timestamp:new Date().toISOString(),
    };

    socket?.emit("send_message", msgPayload);
    dispatch(addMessage({ roomId, message: { ...msgPayload, fromSelf: true } }));
    console.log(messages[messages.length-1])
    setMessage("");
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

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
                  source={{ uri: data.profile.avatar }}
                  className="w-12 h-12 rounded-full"
                />
                <ThemeText size={Textstyles.text_cmedium}>
                  {data.profile.firstName}
                </ThemeText>
              </View>
              <View className="flex-row gap-x-2">
                <FontAwesome5 name="video" size={20} color={primaryColor} />
                <FontAwesome5 name="phone" size={20} color={primaryColor} />
                <FontAwesome5 name="search" size={20} color={primaryColor} />
              </View>
            </View>

            {/* Info */}
            <View className="flex-row items-center justify-center gap-x-2 mb-4 mt-2">
              <FontAwesome5 name="toolbox" size={12} color="red" />
              {role==='client'&&<ThemeText size={Textstyles.text_xsmall}>{data.profession.title}</ThemeText>}
              <ThemeText size={Textstyles.text_xsmall}>{data.yearsOfExp} years</ThemeText>
              <FontAwesome6 name="location-dot" size={12} color="red" />
              {role === 'client' ? (
  <ThemeText size={Textstyles.text_xsmall}>
    {data?.profile?.user?.location?.lga || ''} {data?.profile?.user?.location?.state || ''}
  </ThemeText>
) : (
  <ThemeText size={Textstyles.text_xsmall}>
    {data?.location?.lga || ''} {data?.location?.state || ''}
  </ThemeText>
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
                      onPress={() =>
                        Linking.openURL(`data:image/jpeg;base64,${msg.image}`)
                      }
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
                      { findTime(msg.timestamp)}
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
                            {findTime(msg.timestamp)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Input */}
            <MessageInput
              receiverId={receiverId}
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
