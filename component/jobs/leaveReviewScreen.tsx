import { FontAwesome5 } from "@expo/vector-icons"
import { InputComponentTextarea } from "component/controls/textinput"
import ClientDetails from "component/dashboardComponent/clientdetail"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useTheme } from "hooks/useTheme"
import { TouchableOpacity, View } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const LeaveReview=()=>{
    const {theme}=useTheme()
   const {primaryColor,secondaryTextColor}=getColors(theme)
    return (
        <>
            <ContainerTemplate>
                <View className="h-full w-full flex-col">
                    <HeaderComponent title={"Leave Review"} />
                    <EmptyView height={20} />
                    <ClientDetails/>
                    <EmptyView height={40} />
                    <ThemeText size={Textstyles.text_small}>
                     What is your review about?
                    </ThemeText>
                    <EmptyView height={10}/>
                    <InputComponentTextarea color={primaryColor} placeholder={"Type here..."} placeholdercolor={secondaryTextColor}/>
                    <EmptyView height={10} />
                    <View className="items-end">
                        <ThemeText size={Textstyles.text_xsmall}>
                        0/120 words
                        </ThemeText>

                    </View>
                    <EmptyView height={40}/>
                    <ThemeTextsecond size={Textstyles.text_small}>
                    how many stars does this client deserve?
                    </ThemeTextsecond>
                    <EmptyView height={10} />
                    <View className="flex-row gap-x-3">
                        
                    <TouchableOpacity>
                    <FontAwesome5 color={"gray"} name="Star" size={40}/>
                    </TouchableOpacity>

                    <TouchableOpacity>
                    <FontAwesome5 color={"gray"} name="Star" size={40}/>
                    </TouchableOpacity>

                    <TouchableOpacity>
                    <FontAwesome5 color={"gray"} name="Star" size={40}/>
                    </TouchableOpacity>

                    <TouchableOpacity>
                    <FontAwesome5 color={"gray"} name="Star" size={40}/>
                    </TouchableOpacity>

                    <TouchableOpacity>
                    <FontAwesome5 color={"gray"} name="Star" size={40}/>
                    </TouchableOpacity>




                    </View>
                    
                      
                </View>

            </ContainerTemplate>

        </>
    )
}
export default LeaveReview