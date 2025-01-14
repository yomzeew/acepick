import { View} from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import { getColors } from "../../../static/color";
import { StatusBar } from "expo-status-bar";
import BackComponent from "../../backcomponent";
import { useState } from "react";
import EmptyView from "../../emptyview";
import CenteredTextComponent from "../../centeredtextcomponent";
import InputComponent from "../../controls/textinput";
import ButtonFunction from "../../buttonfunction";
import SliderModal from "../../SlideUpModal";
function BvnComponent() {
  const { theme } = useTheme(); // Theme state and toggle function
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  const [showmodal,setshowmodal]=useState<boolean>(false)


  return (
    <>
     {showmodal && 
      <SliderModal
      setshowmodal={setshowmodal}
      showmodal={showmodal}
      route="/loginscreen"
      title={`Your account has been created \n successfully`}
      />}
       <View style={{ backgroundColor: backgroundColor }} className="h-full w-full p-6">
        
        <StatusBar style="auto" />
        <EmptyView />
        <BackComponent bordercolor={primaryColor} textcolor={secondaryTextColor} />
        <EmptyView />
        <CenteredTextComponent textcolor={primaryTextColor} text="Register as a Client" />
  
        <View className="mt-6 items-center">
              <InputComponent
                color={primaryColor}
                placeholder="BVN"
                placeholdercolor={secondaryTextColor}
              />
        </View>
       
        
      </View>
      <View className="absolute bottom-0 w-full px-6">
        <View className="items-center w-full">
        <ButtonFunction color={primaryColor} text="Verify" textcolor="#fff" onPress={()=>setshowmodal(!showmodal)}/>
          <View className="h-10"></View>
        </View>
        </View>
    </>
   
  );
}

export default BvnComponent;
