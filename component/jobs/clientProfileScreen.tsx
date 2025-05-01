import BackComponent from "component/backcomponent"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { ImageBackground, View } from "react-native"
import { Image, Text,ScrollView  } from "react-native"
import { ThemeText } from "component/ThemeText"
import { AntDesign, FontAwesome5, FontAwesome6, Ionicons } from "@expo/vector-icons"
import { Textstyles } from "static/textFontsize"
import RatingStar from "component/rating"
import EmptyView from "component/emptyview"
import DraggablePanel from "component/bottomSheetcomp"
import { ReviewCard } from "component/menuComponent/profilePages/reviewComponent"

const ClientProfileScreen = () => {
    const { theme } = useTheme()
    const { secondaryTextColor, primaryColor, backgroundColortwo, backgroundColor } = getColors(theme)
    return (
        <>
            <View style={{ backgroundColor: primaryColor }} className="h-full w-full">
                <ImageBackground resizeMode="cover" className="w-full flex-1 h-[100%] px-3 pt-[56px]" source={require('../../assets/profilebg.png')}>
                    <BackComponent bordercolor={primaryColor} textcolor={primaryColor} />
                    <EmptyView height={20} />
                    <View className="w-full items-center">
                        <Image resizeMode="contain" source={require('../../assets/profilepc.png')} className="w-32 h-32 rounded-full" />

                    </View>
                    <EmptyView height={20} />
                    <View className="items-center">
                        <Text style={[Textstyles.text_cmedium, { color: "#ffffff" }]}>Oladele Joseph</Text>
                        <EmptyView height={10} />
                        <View className="flex-row gap-x-2">
                            <FontAwesome6 name="location-dot" size={12} color={primaryColor} />
                            <Text style={[Textstyles.text_xsma, { color: "#ffffff" }]}>Ibadan,Oyo State</Text>
                        </View>
                        <EmptyView height={5} />
                        <View>
                            <RatingStar numberOfStars={4} />
                        </View>
                        <EmptyView height={5} />
                        <View>
                            <Text style={[Textstyles.text_xsma, { color: "#ffffff" }]}>Jobs Completed: 23</Text>
                        </View>

                    </View>
                    <EmptyView height={20} />
                    <View className="flex-row gap-x-3 items-center justify-center">
                        <View className="w-12 h-12 items-center justify-center bg-red-500 rounded-full">
                            <FontAwesome5 color="white" size={16} name="phone" />

                        </View>
                        <View style={{ backgroundColor: primaryColor }} className="w-12 h-12 items-center justify-center rounded-full">
                            <Ionicons name="chatbubbles-sharp" color="white" size={20} />

                        </View>
                        <View className="w-12 h-12 items-center justify-center bg-white rounded-full">
                            <AntDesign name="ellipsis1" size={24} color="black" />

                        </View>

                    </View>
                    <DraggablePanel backgroundColor={backgroundColor}>
                        <ScrollView contentContainerStyle={{paddingVertical:20}}>
                            <ClientDetails/>
                        </ScrollView>

                    </DraggablePanel>



                </ImageBackground>
            </View>



        </>
    )
}

export default ClientProfileScreen

const ClientDetails = () => {
    const { theme } = useTheme()
    const { secondaryTextColor, primaryColor, backgroundColortwo, backgroundColor, selectioncardColor } = getColors(theme)
    return (
        <>
            <View className="w-full h-full rounded-t-2xl px-3">
                <ThemeText size={Textstyles.text_medium}>
                    Review and ratings
                </ThemeText>
                
                <EmptyView height={10} />
                <ReviewCard/>
                   
                <EmptyView height={10} />
                <ReviewCard/>
                   
                <EmptyView height={10} />
                <ReviewCard/>
                   
                <EmptyView height={10} />
                <ReviewCard/>
                   
                <EmptyView height={10} />
                <ReviewCard/>
               







            </View>
        </>
    )
}