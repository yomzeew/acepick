import React, { useEffect, useMemo, useState, useRef } from "react";
import { ScrollView, View, Text, TouchableOpacity, Image } from "react-native";
import { AntDesign, FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";
import { setPreviousChats} from "redux/chatSlice";
import { useSocket } from "hooks/useSocket";
import { PreviousChatData } from "types/type"; // Add MessageData type
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import EmptyView from "component/emptyview";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { Textstyles } from "static/textFontsize";
import { useMutation } from "@tanstack/react-query";
import { getContactListFn } from "services/userService";
import { Profile } from "types/userDetailsType";
import { getInitials } from "utilizes/initialsName";
import { ContactUser } from "types/listofContactType";
import InputComponent from "component/controls/textinput";


const ContactListScreen = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { theme } = useTheme();
    const { selectioncardColor, primaryColor,secondaryTextColor } = getColors(theme);
  
    const role = useSelector((state: RootState) => state?.auth?.user?.role);
    const previousChats = useSelector((state: RootState) => state.chat.previousChats);
    const [imageError,setImageError]=useState<boolean>(false)
  
    const [filterRole, setFilterRole] = useState<string | undefined>(undefined);
    const [search, setSearch] = useState<string>(""); 
    const [page, setPage] = useState<number>(1);
  
    // Mutation for fetching contacts
    const mutation = useMutation({
      mutationFn: getContactListFn,
      onSuccess: (response) => {
        console.log("Contacts Response:", response);
        dispatch(setPreviousChats(response.data)); // Save in Redux
      },
      onError: (error: any) => {
        console.error("Failed to fetch contacts:", error.message);
      },
    });
  
    // Fetch contacts when screen mounts or filters change
    useEffect(() => {
      mutation.mutate({
        search,
        role: filterRole,
        page,
        limit: 10,
      });
    }, [search, filterRole, page]);
  
    const goToChat = (chat: ContactUser) => {
      console.log(chat.id,'check m')
      const userId = chat.id;
    router.push(
          `/mainchat/${JSON.stringify({ userId, professionalId:"" })}`
        );
      
    
    };
  
    if (mutation.isPending) {
      return (
        <View className="flex-1 items-center justify-center bg-white">
          <Text className="text-gray-500">Loading contacts...</Text>
        </View>
      );
    }
  
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
            <FontAwesome5 name="phone" size={20} color={primaryColor} />
            <FontAwesome5 name="search" size={20} color={primaryColor} />
          </View>
        </View>
        <EmptyView height={20} />
        <View className="w-full">
          <InputComponent 
          color={primaryColor} 
          placeholder={"Search by Name"} 
          placeholdercolor={secondaryTextColor} 
          value={search}
          onChange={(text)=>setSearch(text)}
          prefix={true}
          icon={<FontAwesome5 name="search"/>}
         
          />

        </View>
        <EmptyView height={20} />
  
        {/* Filter Tabs */}
        <View className="flex-row gap-x-2 w-full">
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
  <View className="flex-row  gap-x-3">
    {["client", "professional", "delivery", "all"].map((r) => {
      const isActive = filterRole === (r === "all" ? undefined : r);

      return (
        <TouchableOpacity
          key={r}
          onPress={() => setFilterRole(r === "all" ? undefined : r)}
          style={{
            borderColor: primaryColor,
            borderWidth: 1,
            backgroundColor: isActive ? primaryColor : "transparent",
          }}
          className="px-2 py-1 items-center justify-center rounded-xl"
        >
          <Text
            style={{
              color: isActive ? "white" : "black",
              fontWeight: isActive ? "bold" : "normal",
            }}
          >
            {r}
          </Text>
        </TouchableOpacity>
      );
    })}
    </View>
  </ScrollView>
</View>
  
        <EmptyView height={20} />
  
        {/* Contacts List */}
        <View className="flex-1">
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {previousChats.map((chat: ContactUser, index: number) => {
              const lastMessage = "Start a conversation";
  
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => goToChat(chat)}
                  className="mb-4"
                >
                  <View
                    style={{ backgroundColor: selectioncardColor }}
                    className="flex-row items-center justify-between  p-3 rounded-xl"
                  >
                    <View className="flex-row items-center gap-x-2 w-4/5">
                      <View className="relative">
                                    <View className="w-10 h-10 rounded-full bg-white overflow-hidden justify-center items-center">
                                             {chat.profile.avatar && !imageError ? (
                                               <Image
                                                 resizeMode="cover"
                                                 source={{ uri: chat.profile.avatar }}
                                                 className="h-full w-full"
                                                 onError={() => setImageError(true)}
                                               />
                                             ) : (
                                               <Text style={{ color: primaryColor }} className="text-xl">
                                                 {getInitials({ firstName: chat.profile.firstName, lastName: chat.profile.lastName })}
                                               </Text>
                                             )}
                                           </View>
                        <View
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border border-white ${
                            chat.onlineUser?.isOnline
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                      </View>
                      <View className="flex-1">
                        <ThemeText size={Textstyles.text_xsmall}>
                          {chat.profile.firstName ?? "Unknown"}{" "}
                          {chat.profile.lastName ?? ""}
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
