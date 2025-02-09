import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "./headerComp"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { Switch, View, Text, ScrollView, TouchableOpacity } from "react-native"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import EmptyView from "component/emptyview"
import { TextInput } from "react-native"
import InputComponent from "component/controls/textinput"
import { AntDesign } from "@expo/vector-icons"

const FAQ = () => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme)
    return (
        <>
            <ContainerTemplate>
                <HeaderComponent title="FAQs" />
                <EmptyView height={10} />
             
                <View className="h-[70%]">
                    <EmptyView height={10} />
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 2, paddingTop: 10 }}>
                       <QuestionCard/>
                       <QuestionCard/>
                       <QuestionCard/>
                       <QuestionCard/>
                       <QuestionCard/>
                       <QuestionCard/>
                       <QuestionCard/>
                    </ScrollView>
                    
                </View>
                <EmptyView height={10} />
                <View className="items-center flex-row gap-x-2 justify-center ">
                        <TouchableOpacity style={{backgroundColor:primaryColor}} className="w-8 h-8 rounded-full justify-center items-center">
                            <Text>1</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{backgroundColor:primaryColor}} className="w-8 h-8 rounded-full justify-center items-center">
                            <Text>2</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{backgroundColor:primaryColor}} className="w-8 h-8 rounded-full justify-center items-center">
                            <Text>3</Text>
                        </TouchableOpacity>
                    </View>



            </ContainerTemplate>
        </>
    )
}
export default FAQ
const QuestionCard = () => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme)
    return (
        <>
            <EmptyView height={10} />
            <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full h-24 justify-center  rounded-2xl shadow-slate-500 shadow-sm px-5">
                <View className="flex-row justify-between items-center">
                    <View>
                        <ThemeTextsecond size={Textstyles.text_cmedium}>Question</ThemeTextsecond>
                    </View>
                    <View>
                        <AntDesign color={secondaryTextColor} name="left" />
                    </View>
                </View>
            </View>
        </>
    )

}