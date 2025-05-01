import BackComponent from "component/backcomponent"
import ButtonComponent from "component/buttoncomponent"
import ButtonFunction from "component/buttonfunction"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { View } from "react-native"
import { getColors } from "static/color"

const SelectionScreen=()=>{
    const {theme}=useTheme()
  
    const {primaryColor}=getColors(theme)
  
    return(
        <>
        <ContainerTemplate>
            <View className="h-full w-full flex-col pt-[56px]">
                <BackComponent bordercolor={primaryColor} textcolor={primaryColor}/>
                <View className="flex-1 w-full justify-center items-center">
                <ButtonComponent 
                color={primaryColor} 
                text={"Artisan"} 
                textcolor={"#ffffff"} 
                route={"/registerlayout?type=artisan"} 
                />
                <EmptyView height={20}/>
                <ButtonComponent 
                color={primaryColor} 
                text={"Corporate"} 
                textcolor={"#ffffff"} 
                route={"/registerlayout?type=corporate"} 
                />

                </View>

               
            </View>
        </ContainerTemplate>
        
        </>
    )
}
export default SelectionScreen