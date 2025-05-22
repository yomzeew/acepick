import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import RatingStar from "component/rating"
import { ThemeText } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { Image } from "react-native"
import { TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

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

export const ProfessionalDetails = () => {
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
                        Kehinde shobare
                    </ThemeText>
                    <RatingStar numberOfStars={4} />
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

export const ProfessionalDetailsWithoutChat = () => {
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
                        Kehinde shobare
                    </ThemeText>
                    <RatingStar numberOfStars={4} />
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

