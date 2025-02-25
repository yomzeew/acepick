import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../profilePages/headerComp"
import EmptyView from "component/emptyview"
import { useLocalSearchParams } from "expo-router"
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

const Professional=()=>{
    const {theme}=useTheme()
    const {secondaryTextColor,primaryColor}=getColors(theme)
    const {profession}=useLocalSearchParams()
    const [activePage, setActivePage] = useState("corporate");
    return(
        <>
        <ContainerTemplate>
            <HeaderComponent title={profession}/>
            <EmptyView height={20}/>
            <View className="absolute right-3 top-28">
                <TouchableOpacity style={{backgroundColor:primaryColor}} className="px-2 py-2 rounded-full">
                    <AntDesign size={24} color={"#ffffff"} name="filter"/>
                </TouchableOpacity>   
            </View>
            <SwitchMode 
            activePage={activePage} 
            setActivePage={setActivePage} 
            />
            <EmptyView height={20} />
            {activePage==='corporate'?<CorporatePage/>:<ProfessionPage/>}

        </ContainerTemplate>
        </>
    )
}
export default Professional
const CorporatePage = () => {
    const arraysample = [1, 2, 3, 4, 5, 6,7,8,9];
  
    return (
      <View className="flex-1 w-full px-3">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:40}}>
          <View className="flex-row flex-wrap gap-2 w-full  justify-between">
            {arraysample.map((item, index) => (
              <View className="w-[48%]" key={index}>
                <Card />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };
  const ProfessionPage=()=>{
    const arraysample = [1, 2, 3, 4, 5, 6,7,8,9];
  
    return (
      <View className="flex-1 w-full px-3">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:40}}>
            {arraysample.map((item, index) => (
              <View className="w-full" key={index}>
                <ListCard/>
              </View>
            ))}
        </ScrollView>
      </View>
    );
    
  }



const Card=()=>{
    const {theme}=useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme)
    return(
        <>
        <CorporateCard>
        <View className="w-full items-center">
            <Image source={require('../../../assets/corporate.png')} className="w-16 h-16 rounded-full" resizeMode="cover" />
            <EmptyView height={10}/>
            <Text className="text-center" style={[Textstyles.text_xmedium,{color:secondaryTextColor}]}>
                PowerTech Electric Services
            </Text>
            <EmptyView height={10}/>
            <View className="flex-row gap-x-2">
            <FontAwesome6 name="location-dot" size={12} color={primaryColor} />
                <Text style={[Textstyles.text_xsma,{color:secondaryTextColor}]}>Ibadan,Oyo State</Text>
            </View>
            <EmptyView height={10}/>
            <RatingStar numberOfStars={3}/>

        </View>
        </CorporateCard>
     
        </>
    )
}

const ListCard=()=>{
    const {theme}=useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme)
    return(
        <>
        <EmptyView height={10}/>
        <View style={{backgroundColor:selectioncardColor, elevation:4}} className="w-full h-28 rounded-2xl shadow-slate-300 shadow-sm justify-center">
            <View className="w-full h-full flex-row justify-around px-3 py-3">
                <View className="w-[20%] h-full justify-center">
                    <Image resizeMode="cover" source={require('../../../assets/professional.png')} className="w-16 h-16 rounded-full"/>

                </View>
                <View className="w-[50%] justify-center">
                    <ThemeText size={Textstyles.text_xmedium}>
                        Adebisi Eze
                    </ThemeText>
                    <View className="flex-row gap-x-2">
                    <FontAwesome5 color={primaryColor} name="toolbox" size={12} />
                    <ThemeTextsecond size={Textstyles.text_xsmall}>
                    Electrician
                    </ThemeTextsecond>
                    </View>
                    <View className="flex-row gap-x-2">
            <FontAwesome6 name="location-dot" size={12} color={primaryColor} />
                <Text style={[Textstyles.text_xsma,{color:secondaryTextColor}]}>Ibadan,Oyo State</Text>
            </View>
                    <ThemeText size={Textstyles.text_cc}>
                        Charges from N20,000
                    </ThemeText>

                   

                </View>
                <View className="w-[20%] flex-col justify-between">
                    <View className="bg-green-600 rounded-2xl px-2 py-1">
                        <Text style={[Textstyles.text_xsmall,{color:"#ffffff"}]}>
                            Available
                        </Text>
                    </View>
                    <View>

                    </View>


                </View>

            </View>

        </View>
        
        </>
    )
}



