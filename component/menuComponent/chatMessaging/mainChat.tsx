import { AntDesign, FontAwesome5, FontAwesome6 } from "@expo/vector-icons"
import BackComponent from "component/backcomponent"
import InputComponent from "component/controls/textinput"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import Divider from "component/divider"
import EmptyView from "component/emptyview"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { TouchableOpacity, View, Image, Text, KeyboardAvoidingView, TouchableWithoutFeedback, ScrollView, Platform } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const MainChat = () => {
    const router = useRouter()
    const { userid } = useLocalSearchParams()
    const { theme } = useTheme()
    const { secondaryTextColor, primaryColor } = getColors(theme)
    return (
        <>
            <ContainerTemplate>
                <View className="pt-[56px] w-full px-2 h-full flex-col">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center w-3/4">
                            <View>
                                <TouchableOpacity className="rounded-xl p-2" onPress={() => router.back()}>
                                    <AntDesign name="left" size={20} color={primaryColor} />
                                </TouchableOpacity>
                            </View>
                            <View className="flex-row items-center gap-x-3">
                                <Image className="w-12 h-12" source={require('../../../assets/profilepc.png')} />
                                <ThemeText size={Textstyles.text_cmedium}>
                                    {userid}
                                </ThemeText>
                            </View>


                        </View>



                        <View className="flex-row gap-x-4">
                            <TouchableOpacity><FontAwesome5 name="phone" size={20} color={primaryColor} /></TouchableOpacity>
                            <TouchableOpacity><FontAwesome5 name="search" size={20} color={primaryColor} /></TouchableOpacity>
                            <TouchableOpacity><FontAwesome6 name="ellipsis-vertical" size={20} color={primaryColor} /></TouchableOpacity>
                        </View>

                    </View>
                    <EmptyView height={20} />
                    <Divider />
                    <EmptyView height={10} />
                    <View className="w-full items-center">
                        <View className="flex-row gap-x-3">
                            <FontAwesome5 color="red" name="toolbox" size={15} />
                            <ThemeTextsecond size={Textstyles.text_xsmall} >Electrician</ThemeTextsecond>
                            <ThemeTextsecond size={Textstyles.text_xsmall} >3 years</ThemeTextsecond>
                            <FontAwesome6 name="location-dot" size={12} color={primaryColor} />
                            <ThemeTextsecond size={Textstyles.text_xsmall}>Ibadan,Oyo State</ThemeTextsecond>
                        </View>


                    </View>
                     <KeyboardAvoidingView
                                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                                    style={{ flex: 1 }}
                                >
                                    <TouchableWithoutFeedback >
                                        <ScrollView
                                            contentContainerStyle={{ flexGrow: 1 }}
                                            keyboardShouldPersistTaps="handled"
                                            showsVerticalScrollIndicator={false}
                                        >
                    
                    
                    
                    
                    <EmptyView height={20}/>
                    <View className="w-full flex-1">
                        <SenderComponent/>

                    </View>
                   
                    </ScrollView>
                    </TouchableWithoutFeedback>
                    <View>
                    <InputComponent
                                color={primaryColor}
                                placeholder="type here"
                                placeholdercolor={secondaryTextColor}
                            />
                    </View>
                    <EmptyView height={20}/>
                    </KeyboardAvoidingView>

                </View>
            </ContainerTemplate>
        </>
    )
}
export default MainChat

const SenderComponent = () => {
    return (
        <>
            <View className="w-full items-end">
                <View style={{ backgroundColor: "#33658A" }} className="w-2/3 h-auto px-3 py-2 rounded-lg rounded-tr-none">
                    <Text style={[Textstyles.text_xsmall, { color: "#ffffff" }]}>
                        Hi there! I'm looking for an electrician to help with some wiring upgrades
                        in my home. Are you available for a project like that?

                    </Text>
                    <EmptyView height={10} />
                    <View className="flex-row justify-between">
                        <Text style={[Textstyles.text_xsmall, { color: "#ffffff" }]}>
                            Delivered
                        </Text>
                        <Text style={[Textstyles.text_xsmall, { color: "#ffffff" }]}>
                            9:10am
                        </Text>


                    </View>

                </View>

            </View>

        </>
    )
}