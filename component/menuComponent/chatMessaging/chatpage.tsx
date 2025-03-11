import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import { Image, TouchableOpacity, View, Text, ScrollView } from "react-native"
import HeaderComponent from "../profilePages/headerComp"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import SelectionCard from "component/SelectionCard"
import EmptyView from "component/emptyview"
import { useRouter } from "expo-router"

const ChatComponent = () => {
    const router=useRouter()
    const { theme } = useTheme()
    const { secondaryTextColor, primaryColor } = getColors(theme)
    const handlegoto=(value:string)=>{
        router.push(`/mainchat/${value}`)

    }
    return (
        <>
            <ContainerTemplate>
                <View className="pt-[56px] h-full px-2 flex-col">
                    <View className="flex-row justify-between">
                        <ThemeText size={Textstyles.text_medium}>Chats</ThemeText>
                        <View className="flex-row gap-x-4">
                            <TouchableOpacity><FontAwesome5 name="phone" size={20} color={primaryColor} /></TouchableOpacity>
                            <TouchableOpacity><FontAwesome5 name="search" size={20} color={primaryColor} /></TouchableOpacity>
                            <TouchableOpacity><FontAwesome6 name="ellipsis-vertical" size={20} color={primaryColor} /></TouchableOpacity>
                        </View>

                    </View>
                    <View className=" flex-1">
                    <ScrollView contentContainerStyle={{paddingBottom:40}}>
                    <EmptyView height={20} />
                        <TouchableOpacity onPress={()=>handlegoto("Olajide Joseph")}>
                        <ChatCard />
                        </TouchableOpacity>
                        <EmptyView height={10} />
                        <TouchableOpacity>
                        <ChatCard />
                        </TouchableOpacity>
                        
                        <EmptyView height={10} />
                        <TouchableOpacity>
                        <ChatCard />
                        </TouchableOpacity>
                        
                        <EmptyView height={10} />
                        <TouchableOpacity>
                        <ChatCard />
                        </TouchableOpacity>
                        <EmptyView height={10} />
                        <TouchableOpacity>
                        <ChatCard />
                        </TouchableOpacity>
                        
                        <EmptyView height={10} />
                        <TouchableOpacity>
                        <ChatCard />
                        </TouchableOpacity>
                    
                        <EmptyView height={10} />
                        <TouchableOpacity>
                            <ChatCard />
                            </TouchableOpacity>
                    </ScrollView>
            
                    </View>


                </View>
            </ContainerTemplate>
        </>
    )
}
export default ChatComponent

const ChatCard = () => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor } = getColors(theme)
    return (
        <>
            <SelectionCard height={64}>
                <View className="h-full justify-center">
                    <View className="flex-row w-full items-center justify-between h-full">
                        <View className="w-5/6 flex-row gap-x-5 items-center">
                            <Image className="w-16 h-16" source={require('../../../assets/profilepc.png')} />
                            <View>
                            <ThemeText size={Textstyles.text_cmedium}>
                                Olajide Joseph
                            </ThemeText>
                            <Text style={{color:theme==="dark"?"#ffffff":"#000000",fontSize:12,width:150,marginTop:-5}}>
                            Thank you! You too, Have a wonderful day, we will talk...

                            </Text>
                           

                            </View>
                
                        </View>

                        <View className="justify-center items-center">
                            <ThemeTextsecond size={Textstyles.text_xsmall}>
                                6:42pm
                            </ThemeTextsecond>
                            <View style={{ backgroundColor: primaryColor }} className="h-4 w-4 items-center justify-center rounded-full">
                                <Text style={[Textstyles.text_xsmall, { color: "#ffffff" }]}>3</Text>
                            </View>
                        </View>


                    </View>

                </View>

            </SelectionCard>
        </>
    )
}