import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { useMutation } from "@tanstack/react-query"
import RatingStar from "component/rating"
import { ThemeText } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { useEffect, useState } from "react"
import { Image } from "react-native"
import { TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { getClientDetailFn, getProfessionDetailFn, getProfessionDetailIDFn } from "services/userService"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"
import { ClientDetail, ProfessionalData } from "type"

const ClientDetails = () => {
    const { theme } = useTheme()
    const { selectioncardColor,primaryColor } = getColors(theme)
    const user=useSelector((state:RootState)=>state.auth.user)

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
                    <TouchableOpacity style={{backgroundColor:"red"}} className="w-8 h-8 rounded-full justify-center items-center">
                        <FontAwesome5 color="#ffffff" name="phone"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={{backgroundColor:primaryColor}} className="w-8 h-8 rounded-full justify-center items-center">
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
    professionalId:number
}
export const ProfessionalDetails = ({professionalId}:ProfessionalDetailsProps) => {
     const [data, setData] = useState<ProfessionalData | null>(null);

    
        const mutation = useMutation({
            mutationFn:getProfessionDetailFn,
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
            mutation.mutate(professionalId); 
        }, [])
    
        if (!data) {
            return null; // or loading indicator
        }

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
                        {/* <Image resizeMode="contain" className="w-12 h-12 rounded-full" source={{uri:data.profile.avatar}} /> */}

                    </View>
                    <View>
                    <ThemeText size={Textstyles.text_small}>
                        {data.profile.firstName} {data.profile.lastName}
                    </ThemeText>
                    <RatingStar numberOfStars={data.avgRating} />
                    </View>
               

                </View>
                <View className="flex-row gap-x-2">
                    <TouchableOpacity style={{backgroundColor:"red"}} className="w-8 h-8 rounded-full justify-center items-center">
                        <FontAwesome5 color="#ffffff" name="phone"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={{backgroundColor:primaryColor}} className="w-8 h-8 rounded-full justify-center items-center">
                    <Ionicons name="chatbubbles-sharp" color={"#ffffff"} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>router.push(`/clientProfileLayout?professionalId=${professionalId}`)} style={{borderColor:primaryColor,borderWidth:1}} className="w-8 h-8 rounded-full justify-center items-center">
                        <FontAwesome5 color={primaryColor} name="user"/>
                    </TouchableOpacity>

                </View>

                </View>
    


            </View>
        </>
    )
}
interface ProfessionDetailsPropsTwo{
    fullName:string;
    rating:string;
    avatar:string
}
export const ProfessionalDetailsWithoutChat = ({fullName,rating,avatar}:ProfessionDetailsPropsTwo) => {
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
    const user=useSelector((state:RootState)=>state.auth.user)

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
                <View className="flex-row gap-x-2">
                    <TouchableOpacity style={{backgroundColor:"red"}} className="w-8 h-8 rounded-full justify-center items-center">
                        <FontAwesome5 color="#ffffff" name="phone"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={{backgroundColor:primaryColor}} className="w-8 h-8 rounded-full justify-center items-center">
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

