import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons"
import { useMutation } from "@tanstack/react-query"
import { ClientDetailsForProfWithoutChat, ProfessionalDetails } from "component/dashboardComponent/clientdetail"
import EmptyView from "component/emptyview"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useTheme } from "hooks/useTheme"
import { useEffect, useState } from "react"
import { TouchableOpacity, View,Text } from "react-native"
import { getClientDetailFn, jobAcceptDelineFn } from "services/userService"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"
import { ClientDetail, JobLatest } from "type"
interface JobAlertScreenProps{
    setshowalertModal:(value:boolean)=>void
    showalertModal:boolean
    item:JobLatest | null
}
const JobAlertScreen=({setshowalertModal,showalertModal,item}:JobAlertScreenProps)=>{
    const {theme}=useTheme()
    const {primaryColor,backgroundColortwo,selectioncardColor}=getColors(theme)
     // ✅ Return nothing if item is null
     const mutation = useMutation({
        mutationFn: jobAcceptDelineFn,
        onSuccess: async (response) => {
        },
        onError: (error: any) => {
          let msg = "An unexpected error occurred";
      
          if (error?.response?.data) {
            msg =
              error.response.data.message ||
              error.response.data.error ||
              JSON.stringify(error.response.data);
          } else if (error?.message) {
            msg = error.message;
          }
          console.error("failed:", msg);
        },
      });
      const updateStatus = (value:boolean) => {
        setshowalertModal(!showalertModal)
       const data={
        id:item?.id,
        "accepted": value
       } 
        mutation.mutate(data); // ✅ Wrap both in one object
      };

  if (!item) return null;



    return(
        <>
        <View style={{backgroundColor:primaryColor}} className="absolute h-full w-full z-50 opacity-90"/>
        <View className="absolute h-full w-full z-50 opacity-70 justify-center items-center px-3">
            <View
                style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                className="w-full h-auto py-3 px-3 shadow-sm shadow-black rounded-xl justify-center items-center"
            >
                <ClientDetailsForProfWithoutChat clientId={item.clientId} />
                <ThemeTextsecond size={Textstyles.text_cmedium}>
                    Need your Service
                </ThemeTextsecond>
                <ThemeText size={Textstyles.text_cmedium}>
                    {item?.title}
                </ThemeText>
                <ThemeTextsecond size={Textstyles.text_xsma}>
                {item?.description}
                </ThemeTextsecond>
                <EmptyView height={10}/>
                <View className="flex-row gap-x-2 items-center">
                <FontAwesome6 name="location-dot" size={14} color={"red"} />
                <ThemeText size={Textstyles.text_cmedium}>
                    {item?.fullAddress}
                </ThemeText>

                </View>
               
            </View>
            <EmptyView height={20}/>
            <View className="w-full flex-row justify-center gap-x-5">
            <TouchableOpacity onPress={()=>updateStatus(true)} style={{backgroundColor:backgroundColortwo}} className="w-24 h-16 items-center justify-center rounded-xl">
                <Text style={[Textstyles.text_cmedium,{color:"#ffffff"}]}>
                    Accept
                </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>updateStatus(false)} style={{backgroundColor:"red"}} className="w-24 h-16 items-center justify-center rounded-xl">
                <Text style={[Textstyles.text_cmedium,{color:"#ffffff"}]}>
                    Decline
                </Text>
            </TouchableOpacity>

            </View>
          
            
        </View>
        </>
    )
}
export default JobAlertScreen