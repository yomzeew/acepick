import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import { useLocalSearchParams, useRouter } from "expo-router"
import { TouchableOpacity,Text,View, Image, ScrollView } from "react-native"
import { AntDesign,  FontAwesome5,  FontAwesome6 } from "@expo/vector-icons"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"
import { useRef, useState } from "react"
import SwitchMode from "component/switchmode"
import RatingStar from "component/rating"
import CorporateCard from "component/corporatecards"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { ArtisanPage,CorporatePage } from "component/menuComponent/professionals/professionPage"
import InputComponent from "component/controls/textinput"
import { SliderModalNoScrollview } from "component/slideupModalTemplate"

const ListofAPmodal=()=>{
    const {theme}=useTheme()
    const {secondaryTextColor,primaryColor}=getColors(theme)
    const {profession}=useLocalSearchParams()
    const [activePage, setActivePage] = useState("professional");
    const [showFilter,setshowFilter]=useState(false)
    return(
        <>
        <SliderModalNoScrollview showmodal={showFilter} setshowmodal={setshowFilter} modalHeight={'60%'} >
            <Text>eeee</Text>
        </SliderModalNoScrollview>
        <ContainerTemplate>
            <EmptyView height={20}/>
           
            <SwitchMode 
            activePage={activePage} 
            setActivePage={setActivePage} 
            />
            <EmptyView height={20}/>
            <View className="w-full justify-center flex-row gap-x-3">
            <View className="w-4/5">
            <InputComponent color={primaryColor} placeholder={"Search by location"} placeholdercolor={secondaryTextColor}/>
            </View>
          
            <TouchableOpacity onPress={()=>setshowFilter(!showFilter)} style={{backgroundColor:primaryColor}} className="px-2 py-2 w-16 h-16 items-center justify-center rounded-full">
                    <AntDesign size={24} color={"#ffffff"} name="filter"/>
                </TouchableOpacity>   
            </View>
            
            <EmptyView height={20} />
            {activePage==='professional'?<ArtisanPage/>:<CorporatePage/>}

        </ContainerTemplate>
        </>
    )
}
export default ListofAPmodal        