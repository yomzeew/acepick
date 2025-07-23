import React, { useEffect, useMemo, useState, useRef } from "react";
import { ScrollView, View, Text, TouchableOpacity, Image } from "react-native";
import { AntDesign, FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";
import { setPreviousChats} from "redux/chatSlice";
import { useSocket } from "hooks/useSocket";
import { PreviousChatData } from "type"; // Add MessageData type
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import EmptyView from "component/emptyview";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { Textstyles } from "static/textFontsize";


const ContactListScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const roomRef = useRef<string | null>(null);

  const role = useSelector((state: RootState) => state?.auth?.user?.role);
  const previousChats = useSelector((state: RootState) => state.chat.previousChats);
  const user = useSelector((state: RootState) => state.auth.user);

   const { theme } = useTheme();
    const { selectioncardColor, primaryColor } = getColors(theme);

  const [receiverIds, setReceiverIds] = useState<string[]>([]);

  // Extract all receiver IDs from previous chats
  useEffect(() => {
    if (previousChats?.length > 0) {
      const ids = previousChats.map(chat => chat.id);
      setReceiverIds(ids);
    }
  }, [previousChats]);

  // Emit join_room for each contact
  useEffect(() => {
    if (!socket) return;

    socket.on('connected', () => {
      socket.emit("previous_chats");
  })
  
  socket.on("reconnect", () => {
      console.log("reconnect")
  })

  
    // Emit when socket reconnects
    socket.on("connect", () => {
      socket.emit("previous_chats");
    });
  
    // Update Redux with latest chat data
    socket.on("got_previous_chats", (data: PreviousChatData[]) => {
      console.log(data,'okk')
      dispatch(setPreviousChats(data));
    });
  
    // Set interval to re-fetch online status every 10 seconds
    const interval = setInterval(() => {
      socket.emit("previous_chats");
    }, 10000); // 10 seconds
  
    return () => {
      clearInterval(interval); // Clean up interval
      socket.off("connect");
      socket.off("got_previous_chats");
    };
  }, [socket]);
  

  const goToChat = (chat:PreviousChatData) => {
  
    const userId=chat.id
    if(role==='client'){
      const professionalId=chat.profile.professional.id
      const userIDprofessionalId = {userId, professionalId};
      router.push(`/mainchat/${JSON.stringify(userIDprofessionalId)}`);
    }
    else{
      const userIDprofessionalId = { userId, professionalId:'' };
      router.push(`/mainchat/${JSON.stringify(userIDprofessionalId)}`);
    }
   
  };

  if (!previousChats || previousChats.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">No chats yet</Text>
      </View>
    );
  }

  return (
    <ContainerTemplate>
      {/* Header */}
      <View className="pt-16 justify-between flex-row px-4">
              <View className="flex-row items-center gap-x-2">
                <TouchableOpacity onPress={() => router.back()}>
                  <AntDesign name="left" size={20} color={primaryColor} />
                </TouchableOpacity>
              </View>
              <View className="flex-row gap-x-2">
                <FontAwesome5 name="video" size={20} color={primaryColor} />
                <FontAwesome5 name="phone" size={20} color={primaryColor} />
                <FontAwesome5 name="search" size={20} color={primaryColor} />
              </View>
            </View>
            <EmptyView height={20}/>
<View className="flex-1">
   {/* Contacts List */}
   <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      {previousChats.map((chat:any,index:any) => {
  const lastMessage = "Start a conversation";

          return (
            <TouchableOpacity
              key={index}
              onPress={() => goToChat(chat)}
              className="mb-4"
            >
              <View style={{backgroundColor:selectioncardColor}} className="flex-row items-center justify-between  p-3 rounded-xl">
                <View className="flex-row items-center gap-x-2 w-4/5">
                  <View className="relative">
                    <Image
                      source={{
                        uri: chat.profile?.avatar || "https://via.placeholder.com/64",
                      }}
                      className="w-14 h-14 rounded-full"
                    />
                    <View
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border border-white ${
                        chat.onlineUser?.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </View>
                  <View className="flex-1">
                    <ThemeText size={Textstyles.text_xsmall}>
                      {chat.profile?.firstName ?? "Unknown"} {chat.profile?.lastName ?? ""}
                    </ThemeText>
                    <ThemeTextsecond size={Textstyles.text_xxxsmall}>
                      {lastMessage}
                    </ThemeTextsecond>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

</View>
     
    </ContainerTemplate>
  );
};

export default ContactListScreen;
