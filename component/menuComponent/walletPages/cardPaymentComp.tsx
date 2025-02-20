import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import { ThemeText } from "component/ThemeText"
import { useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { Textstyles } from "static/textFontsize";
import HeaderComponent from "../profilePages/headerComp";
import EmptyView from "component/emptyview";
import CardModal from "./cardModal";
import { useState } from "react";
import ButtonFunction from "component/buttonfunction";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";


const CardPaymentComp=()=>{
    const { amount } = useLocalSearchParams();
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const cards:number[]=[1,2,3,4,5]
      const { theme } = useTheme();
        const { primaryColor, backgroundColor, backgroundColortwo, secondaryTextColor } = getColors(theme); 

    return(
        <>
        <ContainerTemplate>
            <HeaderComponent title="Cards Payment" />
            <EmptyView height={10} />
            <View className="w-full">
                <ScrollView className="gap-4"  horizontal showsHorizontalScrollIndicator={false}>
                {cards.map((item,index:number)=>(
                <View key={index} className="w-[80vw] mr-3">
                     <CardModal 
                     selected={selectedIndex === index} 
                     onSelect={() => setSelectedIndex(index)} 
                     index={index+1}
                     />

                </View>
                
            ))

            }


                </ScrollView>
                
            </View>
            <EmptyView height={30} />
            <View className="px-3">
            <ButtonFunction onPress={()=>console.log('ok')} textcolor="#ffffff" color={primaryColor}  text="Make 2000 Payment" />
            </View>
           
           
        </ContainerTemplate>
        </>
    )
}
export default CardPaymentComp