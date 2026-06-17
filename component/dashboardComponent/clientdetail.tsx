import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { useMutation } from "@tanstack/react-query"
import RatingStar from "component/rating"
import { ThemeText } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import React, { useEffect, useState, memo } from "react"
import { Image, Text } from "react-native"
import { TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { generalUserDetailFn, getClientDetailFn, getProfessionDetailFn, getProfessionDetailFnBYUserID, addChatContactFn } from "services/userService"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"
import { ClientDetail, ProfessionalData } from "types/type"
import { useDispatch } from "react-redux";
import { getInitials } from "utilizes/initialsName"

const ClientDetails = () => {
    const { theme } = useTheme()
    
    const { selectioncardColor,primaryColor } = getColors(theme)
    const user=useSelector((state:RootState)=>state.auth.user)

    // Helper function to initiate chat and add contact
    const handleInitiateChat = async (userId: string) => {
        try {
            // Add user to chat contacts (creates chat room if it doesn't exist)
            await addChatContactFn(userId);
        } catch (error) {
            console.error('Error adding chat contact:', error);
            // Continue to chat even if adding contact fails
        }
        // Navigate to chat
        router.push(`/mainchat/${userId}`);
    };

    if (!user) {
        return null; // Don't render if user is not available
    }

    const avatar:string=user?.profile.avatar || ' '
    const clientName:string= user?.profile.firstName +' '+ user?.profile.lastName || ' '
    const numberOfStars:number=user?.profile.rate || 1

   
    const router=useRouter()
    return (
        <>
            <View
                style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                className="w-full h-auto py-3 px-3 shadow-sm shadow-black rounded-xl"
            >
                <View className="w-full flex-row justify-between items-center">
                <View className="flex-row gap-x-2 items-center">
                    <View className="w-12 h-12 bg-slate-200 rounded-full">
                       <Image resizeMode="contain" className="w-12 h-12 rounded-full" source={{uri:avatar}}/>
                    </View>
                    <View>
                    <ThemeText size={Textstyles.text_small}>
                        {clientName}
                    </ThemeText>
                    <RatingStar numberOfStars={numberOfStars} />
                    </View>
               

                </View>
                <View className="flex-row gap-x-2">
                    <TouchableOpacity onPress={() => router.push(`/callchat/${JSON.stringify({userId: user?.id})}`)} style={{backgroundColor:"red"}} className="w-8 h-8 rounded-full justify-center items-center">
                        <FontAwesome5 color="#ffffff" name="phone"/>
                    </TouchableOpacity>
                    <TouchableOpacity  onPress={() => handleInitiateChat(user?.id || '')} style={{backgroundColor:primaryColor}} className="w-8 h-8 rounded-full justify-center items-center">
                    <Ionicons name="chatbubbles-sharp" color={"#ffffff"} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>router.push('/clientProfileLayout')} style={{borderColor:primaryColor,borderWidth:1}} className="w-8 h-8 rounded-full justify-center items-center">
                        <FontAwesome5 color={primaryColor} name="user"/>
                    </TouchableOpacity>

                </View>

                </View>
    


            </View>
        </>
    )
}
export default ClientDetails
 
interface ProfessionalDetailsProps{
    professionalId: string | number // Accept both string and number
}
export const ProfessionalDetails = memo(({professionalId}:ProfessionalDetailsProps) => {
     const [data, setData] = useState<ProfessionalData | null>(null);
     const [loading, setLoading] = useState(true);
     const { theme } = useTheme()
     const { selectioncardColor,primaryColor, secondaryTextColor } = getColors(theme)
     const router=useRouter()
     const dispatch=useDispatch()

     // Helper function to initiate chat and add contact
     const handleInitiateProfessionalChat = async (userId: string) => {
         try {
             // Add professional to chat contacts (creates chat room if it doesn't exist)
             await addChatContactFn(userId);
         } catch (error) {
             console.error('Error adding chat contact:', error);
             // Continue to chat even if adding contact fails
         }
         // Navigate to chat
         router.push(`/mainchat/${JSON.stringify({userId, professionalId: ""})}`);
     };
     
     if (!professionalId) {
        return null;
     }
     
     // Convert to string for API calls
     const professionalIdStr = professionalId.toString();
     const userIDprofessionalId={userId:data?.profile?.userId || "",professionalId:professionalIdStr}

        const mutation = useMutation({
            mutationFn: getProfessionDetailFnBYUserID, // Use the user ID endpoint instead
            onSuccess: async (response) => {
                console.log('✅ Professional details loaded successfully:', {
                    professionalId: professionalIdStr,
                    firstName: response?.data?.profile?.firstName,
                    lastName: response?.data?.profile?.lastName,
                    avgRating: response?.data?.avgRating
                });
                setData(response.data);
                setLoading(false);
            },
            onError: (error: any) => {
                console.error('❌ Failed to load professional details:', {
                    professionalId: professionalIdStr,
                    error: error?.message,
                    status: error?.response?.status,
                    endpoint: 'GET_BY_USER_ID'
                });
                setLoading(false);
                // Set default data to show something even on error
                setData({
                    id: parseInt(professionalIdStr),
                    profile: {
                        firstName: 'Professional',
                        lastName: 'Name',
                        avatar: '',
                        userId: professionalIdStr,
                    },
                    avgRating: 0,
                } as ProfessionalData);
            }
        });
    
        useEffect(() => {
            if (professionalIdStr && !data) { // Only call if we don't have data yet
                setLoading(true);
                mutation.mutate(professionalIdStr); 
            }
        }, [professionalIdStr, data]) // Add data as dependency
    
    // Loading state
    if (loading) {
        return (
            <View
                style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                className="w-full h-auto py-3 px-3 shadow-sm shadow-black rounded-xl"
            >
                <View className="w-full flex-row justify-between items-center">
                    <View className="flex-row gap-x-2 items-center">
                        <View className="w-12 h-12 bg-slate-200 rounded-full animate-pulse" />
                        <View>
                            <View className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-2" />
                            <View className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                        </View>
                    </View>
                    <View className="flex-row gap-x-2">
                        <View className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
                        <View className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
                        <View className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
                    </View>
                </View>
            </View>
        );
    }

    // Error or no data state
    if (!data || !data.profile) {
        return (
            <View
                style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                className="w-full h-auto py-3 px-3 shadow-sm shadow-black rounded-xl"
            >
                <View className="w-full flex-row justify-between items-center">
                    <View className="flex-row gap-x-2 items-center">
                        <View className="w-12 h-12 bg-slate-200 rounded-full justify-center items-center">
                            <FontAwesome5 name="user" size={20} color={secondaryTextColor} />
                        </View>
                        <View>
                            <ThemeText size={Textstyles.text_small}>
                                Professional Information
                            </ThemeText>
                            <Text style={{ fontSize: 12, color: secondaryTextColor, opacity: 0.7 }}>
                                Loading details...
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

  
    return (
        <>
            <View
                style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                className="w-full h-auto py-3 px-3 shadow-sm shadow-black rounded-xl"
            >
                <View className="w-full flex-row justify-between items-center">
                <View className="flex-row gap-x-2 items-center">
                    <View className="w-12 h-12 bg-slate-200 rounded-full">
                        {data.profile.avatar ? (
                            <Image resizeMode="contain" className="w-12 h-12 rounded-full" source={{uri: data.profile.avatar}} />
                        ) : (
                            <View className="w-12 h-12 rounded-full justify-center items-center">
                                <FontAwesome5 name="user" size={20} color={secondaryTextColor} />
                            </View>
                        )}
                    </View>
                    <View>
                    <ThemeText size={Textstyles.text_small}>
                        {data.profile.firstName || ''} {data.profile.lastName || ''}
                    </ThemeText>
                    <RatingStar numberOfStars={data.avgRating} />
                    </View>
               

                </View>
                <View className="flex-row gap-x-2">
                    <TouchableOpacity   onPress={() => {
                            router.push(`/callchat/${JSON.stringify(userIDprofessionalId)}`);
                          }} style={{backgroundColor:"red"}}
                           className="w-8 h-8 rounded-full justify-center items-center">
                        <FontAwesome5 color="#ffffff" name="phone"/>
                    </TouchableOpacity>
                    <TouchableOpacity 
                          onPress={() => handleInitiateProfessionalChat(data?.profile?.userId || '')}
                    style={{backgroundColor:primaryColor}} className="w-8 h-8 rounded-full justify-center items-center">
                    <Ionicons name="chatbubbles-sharp" color={"#ffffff"} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>router.push(`/clientProfileLayout?professionalId=${professionalIdStr}`)} style={{borderColor:primaryColor,borderWidth:1}} className="w-8 h-8 rounded-full justify-center items-center">
                        <FontAwesome5 color={primaryColor} name="user"/>
                    </TouchableOpacity>

                </View>

                </View>
    


            </View>
        </>
    )
});

// Additional component for professional details without chat functionality
interface ProfessionDetailsPropsTwo{
    fullName: string;
    rating: string;
    avatar: string;
}

export const ProfessionalDetailsWithoutChat = ({fullName, rating, avatar}:ProfessionDetailsPropsTwo) => {
    const { theme } = useTheme()
    const { selectioncardColor,primaryColor } = getColors(theme)
    const router=useRouter()
    return (
        <>
            <View
                style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                className="w-full h-auto py-3 px-3 shadow-sm shadow-black rounded-xl"
            >
                <View className="w-full flex-row justify-between items-center">
                <View className="flex-row gap-x-2 items-center">
                    <View className="w-12 h-12 bg-slate-200 rounded-full">

                    </View>
                    <View>
                    <ThemeText size={Textstyles.text_small}>
                        {fullName}
                    </ThemeText>
                    <RatingStar numberOfStars={Number(rating)} />
                    </View>
               

                </View>
                {/* <View className="flex-row gap-x-2">
                    <TouchableOpacity onPress={()=>router.push('/clientProfileLayout')} style={{borderColor:primaryColor,borderWidth:1}} className="w-8 h-8 rounded-full justify-center items-center">
                        <FontAwesome5 color={primaryColor} name="user"/>
                    </TouchableOpacity>

                </View> */}

                </View>
    


            </View>
        </>
    )
}

export const ClientDetailsWithoutChat = () => {
    const { theme } = useTheme()
    const { selectioncardColor,primaryColor } = getColors(theme)
    const router=useRouter()
    const user=useSelector((state:RootState)=>state?.auth?.user)

    const avatar:string=user?.profile.avatar || ' '
    const clientName:string= user?.profile.firstName +' '+ user?.profile.lastName || ' '
    const numberOfStars:number=user?.profile.rate || 1
    return (
        <>
            <View
                style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                className="w-full h-auto py-3 px-3 shadow-sm shadow-black rounded-xl"
            >
                <View className="w-full flex-row justify-between items-center">
                <View className="flex-row gap-x-2 items-center">
                    <View className="w-12 h-12 bg-slate-200 rounded-full">
                    <Image resizeMode="contain" className="w-12 h-12 rounded-full" source={{uri:avatar}}/>
                    </View>
                    <View>
                    <ThemeText size={Textstyles.text_small}>
                        {clientName}
                    </ThemeText>
                    <RatingStar numberOfStars={numberOfStars} />
                    </View>
               

                </View>
                <View className="flex-row gap-x-2">
                    <TouchableOpacity onPress={()=>router.push('/clientProfileLayout')} style={{borderColor:primaryColor,borderWidth:1}} className="w-8 h-8 rounded-full justify-center items-center">
                        <FontAwesome5 color={primaryColor} name="user"/>
                    </TouchableOpacity>

                </View>

                </View>
    


            </View>
        </>
    )
}
interface ClientDetailsForProf{
    clientId:string
}
export const ClientDetailsForProf = ({clientId}:ClientDetailsForProf) => {
    const { theme } = useTheme()
    const { selectioncardColor,primaryColor } = getColors(theme)
    const user=useSelector((state:RootState)=>state.auth.user)

    const [data, setData] = useState<ClientDetail| null>(null);

    // Helper function to initiate chat and add contact
    const handleInitiateClientChat = async (userId: string) => {
        try {
            // Add client to chat contacts (creates chat room if it doesn't exist)
            await addChatContactFn(userId);
        } catch (error) {
            console.error('Error adding chat contact:', error);
            // Continue to chat even if adding contact fails
        }
        // Navigate to chat
        router.push(`/mainchat/${userId}`);
    };

    
    const mutation = useMutation({
        mutationFn:getClientDetailFn,
        onSuccess: async (response) => {
            console.log(response)
            setData(response.data);
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
        mutation.mutate(clientId); 
    }, [])

    if (!data) {
        return null; // or loading indicator
    }
    const router=useRouter()

    const userIDprofessionalId={userId:clientId,professionalId:''}
    return (
        <>
            <View
                style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                className="w-full h-auto py-3 px-3 shadow-sm shadow-black rounded-xl"
            >
                <View className="w-full flex-row justify-between items-center">
                <View className="flex-row gap-x-2 items-center">
                    <View className="w-12 h-12 bg-slate-200 rounded-full">
                       <Image resizeMode="contain" className="w-12 h-12 rounded-full" source={{uri:data.profile.avatar}}/>
                    </View>
                    <View>
                    <ThemeText size={Textstyles.text_small}>
                        {data.profile.firstName} {data.profile.lastName}
                    </ThemeText>
                    </View>
               

                </View>
                <View className="flex-row gap-x-2">
                    <TouchableOpacity 
                     onPress={() => {
                        router.push(`/callchat/${JSON.stringify(userIDprofessionalId)}`);
                      }} 
                    style={{backgroundColor:"red"}} className="w-8 h-8 rounded-full justify-center items-center">
                        <FontAwesome5 color="#ffffff" name="phone"/>
                    </TouchableOpacity>
                    <TouchableOpacity  onPress={() => handleInitiateClientChat(clientId)} style={{backgroundColor:primaryColor}} className="w-8 h-8 rounded-full justify-center items-center">
                    <Ionicons name="chatbubbles-sharp" color={"#ffffff"} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>router.push('/clientProfileLayout')} style={{borderColor:primaryColor,borderWidth:1}} className="w-8 h-8 rounded-full justify-center items-center">
                        <FontAwesome5 color={primaryColor} name="user"/>
                    </TouchableOpacity>

                </View>

                </View>
    


            </View>
        </>
    )
}

export const ClientDetailsForProfWithoutChat = ({clientId}:ClientDetailsForProf) => {
    const { theme } = useTheme()
    const { selectioncardColor,primaryColor } = getColors(theme)
    const user=useSelector((state:RootState)=>state.auth.user)

    const [data, setData] = useState<ClientDetail| null>(null);

    
    const mutation = useMutation({
        mutationFn:getClientDetailFn,
        onSuccess: async (response) => {
            console.log(response)
            setData(response.data);
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
        mutation.mutate(clientId); 
    }, [])

    if (!data) {
        return null; // or loading indicator
    }
    const router=useRouter()
    return (
        <>
            <View
                style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                className="w-full h-auto py-3 px-3 shadow-sm shadow-black rounded-xl"
            >
                <View className="w-full flex-row justify-between items-center">
                <View className="flex-row gap-x-2 items-center">
                    <View className="w-12 h-12 bg-slate-200 rounded-full">
                       <Image resizeMode="contain" className="w-12 h-12 rounded-full" source={{uri:data.profile.avatar}}/>
                    </View>
                    <View>
                    <ThemeText size={Textstyles.text_small}>
                        {data.profile.firstName} {data.profile.firstName}
                    </ThemeText>
                    </View>
               

                </View>

                </View>
    


            </View>
        </>
    )
}
interface GeneralUserDetailsProps{
   userId:string
}
export const GeneralUserDetails = ({userId}:GeneralUserDetailsProps) => {
    const { theme } = useTheme()
    const { selectioncardColor,primaryColor } = getColors(theme)
    const [imageError,setImageError]=useState<boolean>(false)

    const [data, setData] = useState<any| null>(null);

    // Helper function to initiate chat and add contact
    const handleInitiateGeneralChat = async (userId: string) => {
        try {
            // Add user to chat contacts (creates chat room if it doesn't exist)
            await addChatContactFn(userId);
        } catch (error) {
            console.error('Error adding chat contact:', error);
            // Continue to chat even if adding contact fails
        }
        // Navigate to chat
        router.push(`/mainchat/${JSON.stringify({userId, professionalId: ''})}`);
    };

    
    const mutation = useMutation({
        mutationFn:generalUserDetailFn,
        onSuccess: async (response) => {
            console.log(response)
            setData(response.data);
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
        mutation.mutate(userId); 
    }, [])

    if (!data) {
        return null; // or loading indicator
    }
    const router=useRouter()

    const userIDprofessionalId={userId,professionalId:''}
    return (
        <>
            <View
                style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                className="w-full h-auto py-3 px-3 shadow-sm shadow-black rounded-xl"
            >
                <View className="w-full flex-row justify-between items-center">
                <View className="flex-row gap-x-2 items-center">
                      <View className="w-10 h-10 rounded-full bg-white overflow-hidden justify-center items-center">
                              {data.avatar && !imageError ? (
                                <Image
                                  resizeMode="cover"
                                  source={{ uri: data.avatar }}
                                  className="h-full w-full"
                                  onError={() => setImageError(true)}
                                />
                              ) : (
                                <Text style={{ color: primaryColor }} className="text-xl">
                                  {getInitials({ firstName: data.firstName, lastName: data.lastName })}
                                </Text>
                              )}
                            </View>
                    <View>
                    <ThemeText size={Textstyles.text_xxxsmall}>
                        {data.firstName} {data.lastName}
                    </ThemeText>
                    </View>
               

                </View>
                <View className="flex-row gap-x-2">
                    <TouchableOpacity style={{backgroundColor:"red"}} className="w-6 h-6 rounded-full justify-center items-center">
                        <FontAwesome5 color="#ffffff" name="phone"/>
                    </TouchableOpacity>
                    <TouchableOpacity  onPress={() => handleInitiateGeneralChat(userId)} style={{backgroundColor:primaryColor}} className="w-6 h-6 rounded-full justify-center items-center">
                    <Ionicons name="chatbubbles-sharp" color={"#ffffff"} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>router.push('/clientProfileLayout')} style={{borderColor:primaryColor,borderWidth:1}} className="w-6 h-6 rounded-full justify-center items-center">
                        <FontAwesome5 color={primaryColor} name="user"/>
                    </TouchableOpacity>

                </View>

                </View>
    


            </View>
        </>
    )
}
