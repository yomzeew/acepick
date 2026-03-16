import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
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
import { useDebounce } from "hooks/useDebounce";


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
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    
    // Debounced search value
    const debouncedSearch = useDebounce(search, 500);
  
    // Mutation for fetching contacts
    const mutation = useMutation({
      mutationFn: getContactListFn,
      onSuccess: (response) => {
        console.log("Contacts Response:", response);
        dispatch(setPreviousChats(response.data)); // Save in Redux
        
        // Update online users set
        const onlineSet = new Set<string>();
        response.data.forEach((contact: ContactUser) => {
          if (contact.onlineUser?.isOnline) {
            onlineSet.add(contact.id);
          }
        });
        setOnlineUsers(onlineSet);
      },
      onError: (error: any) => {
        console.error("Failed to fetch contacts:", error.message);
      },
    });
  
    // Fetch contacts when debounced search or filters change
    useEffect(() => {
      mutation.mutate({
        search: debouncedSearch,
        role: filterRole,
        page,
        limit: 10,
      });
    }, [debouncedSearch, filterRole, page]);

    // Simulate real-time online status updates
    useEffect(() => {
      const interval = setInterval(() => {
        // This would normally come from WebSocket or real-time API
        // For now, randomly update some users' online status for demo
        if (previousChats && previousChats.length > 0) {
          const randomUser = previousChats[Math.floor(Math.random() * previousChats.length)];
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(randomUser.id)) {
              newSet.delete(randomUser.id);
            } else {
              newSet.add(randomUser.id);
            }
            return newSet;
          });
        }
      }, 15000); // Update every 15 seconds

      return () => clearInterval(interval);
    }, [previousChats]);
  
    const goToChat = (chat: ContactUser) => {
      console.log(chat.id,'check m')
      const userId = chat.id;
    router.push(
          `/mainchat/${JSON.stringify({ userId, professionalId:"" })}`
        );
      
    
    };

    // Handle phone icon click
    const handlePhoneClick = useCallback(() => {
      // Navigate to call screen or open phone dialer
      console.log("Phone icon clicked");
      // For now, just log - can be extended to actual call functionality
    }, []);

    // Handle search icon click in header
    const handleSearchClick = useCallback(() => {
      // Focus on the search input
      console.log("Search icon clicked");
      // Can be used to focus the search input field
    }, []);
  
    if (mutation.isPending) {
      return (
        <View className="flex-1 items-center justify-center bg-white">
          <Text className="text-gray-500">Loading contacts...</Text>
        </View>
      );
    }
  
    if (!previousChats || previousChats.length === 0) {
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
            <TouchableOpacity onPress={handlePhoneClick}>
              <FontAwesome5 name="phone" size={20} color={primaryColor} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSearchClick}>
              <FontAwesome5 name="search" size={20} color={primaryColor} />
            </TouchableOpacity>
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
        <View className="w-full">
          <View className="flex-row justify-between items-center mb-3">
            <ThemeTextsecond size={Textstyles.text_xsmall}>Filter by Role:</ThemeTextsecond>
            <TouchableOpacity 
              onPress={() => setFilterRole(undefined)}
              className="px-3 py-1 rounded-full bg-gray-100"
            >
              <Text className="text-xs text-gray-600">Clear</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full">
            <View className="flex-row gap-x-3">
              {["all", "client", "professional", "delivery"].map((r) => {
                const isActive = filterRole === (r === "all" ? undefined : r);

                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setFilterRole(r === "all" ? undefined : r)}
                    style={{
                      borderColor: primaryColor,
                      borderWidth: 1.5,
                      backgroundColor: isActive ? primaryColor : "transparent",
                      shadowColor: isActive ? primaryColor : "transparent",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isActive ? 0.2 : 0,
                      shadowRadius: 4,
                      elevation: isActive ? 3 : 1,
                    }}
                    className="px-4 py-2 items-center justify-center rounded-full min-w-[60px]"
                  >
                    <Text
                      style={{
                        color: isActive ? "white" : primaryColor,
                        fontWeight: isActive ? "600" : "400",
                        fontSize: 12,
                      }}
                      className="text-center"
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </ContainerTemplate>
    );
  }

  return (
    <ContainerTemplate>
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
                                             {chat.profile?.avatar && !imageError ? (
                                               <Image
                                                 resizeMode="cover"
                                                 source={{ uri: chat.profile.avatar }}
                                                 className="h-full w-full"
                                                 onError={() => setImageError(true)}
                                               />
                                             ) : (
                                               <Text style={{ color: primaryColor }} className="text-xl">
                                                 {getInitials({ firstName: chat.profile?.firstName || '', lastName: chat.profile?.lastName || '' })}
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
                          {chat.profile?.firstName ?? "Unknown"}{" "}
                          {chat.profile?.lastName ?? ""}
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
