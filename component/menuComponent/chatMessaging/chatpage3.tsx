import React, { useEffect, useMemo, useState, useRef } from "react";
import { ScrollView, View, Text, TouchableOpacity, Image, TextInput } from "react-native";
import { AntDesign, FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";
import { setPreviousChats} from "redux/chatSlice";
import { useSocket } from "hooks/useSocket";
import { PreviousChatData } from "types/type";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import EmptyView from "component/emptyview";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { Textstyles } from "static/textFontsize";
import { useDebounce } from "hooks/useDebounce";


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
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredChats = useMemo(() => {
    if (!debouncedSearch.trim()) return previousChats;
    const q = debouncedSearch.toLowerCase();
    return previousChats.filter((chat: any) => {
      const first = (chat.profile?.firstName || '').toLowerCase();
      const last = (chat.profile?.lastName || '').toLowerCase();
      return first.includes(q) || last.includes(q) || `${first} ${last}`.includes(q);
    });
  }, [previousChats, debouncedSearch]);

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
      dispatch(setPreviousChats(data as any));
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
              <View className="flex-row gap-x-4 items-center">
                <TouchableOpacity onPress={() => {}}>
                  <FontAwesome5 name="video" size={20} color={primaryColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {}}>
                  <FontAwesome5 name="phone" size={20} color={primaryColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowSearch(!showSearch)}>
                  <FontAwesome5 name="search" size={20} color={primaryColor} />
                </TouchableOpacity>
              </View>
            </View>
            {showSearch && (
              <View className="px-4 mt-2">
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search by name..."
                  placeholderTextColor="#9ca3af"
                  className="border border-gray-300 rounded-xl px-4 py-2 text-base"
                  style={{ color: primaryColor }}
                  autoFocus
                />
              </View>
            )}
            <EmptyView height={20}/>
<View className="flex-1">
   {/* Contacts List */}
   <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      {filteredChats.map((chat:any,index:any) => {
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
