import { FontAwesome5 } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import { ThemeText } from "component/ThemeText";
import { useCall } from "context/WebRtcContext";
import { router } from "expo-router";
import { useSocket } from "hooks/useSocket";
import { useTheme } from "hooks/useTheme";
import { useWebRtc } from "hooks/useWebRTCCall";
import { useEffect, useRef, useState } from "react";
import {
  ImageBackground,
  View,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { generalUserDetailFn, getClientDetailFn,  getProfessionDetailFnBYUserID } from "services/userService";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import { getInitials } from "utilizes/initialsName";

interface CallAnswerProps{
    userId:any
}
const CallAnswer=({ userId, route }: CallAnswerProps & { route?: any })=>{
    const {
        isCalling,
        incomingCall,
        hangUp,
        remoteStream,
        partnerId,
      } = useCall(); // Using context
      const { theme } = useTheme();
      const { primaryColor, selectioncardColor } = getColors(theme);
      const [data, setData] = useState<any>(null);
      const [imageError, setImageError] = useState(false);
      
      // Debugging
      useEffect(() => {
        console.log("Call state:", {
          isCalling,
          partnerId,
          hasRemoteStream: !!remoteStream
        });
      }, [isCalling, partnerId, remoteStream]);
    
      
      const user = useSelector((state: RootState) => state?.auth?.user);
      const role = user?.role;
     

  const handleHangUp = async () => {
    try {
      console.log("Ending call...");
      await hangUp();
      router.back();
    } catch (error) {
      console.error("Failed to hang up:", error);
      router.back(); // Ensure navigation even if hangup fails
    }
  };



    
      const [callDuration, setCallDuration] = useState(0);
      const callTimerRef = useRef<NodeJS.Timeout | null>(null);
      
    
      
      const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
          .toString()
          .padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
      };

      
      const mutation = useMutation({
        mutationFn: generalUserDetailFn,
        onSuccess: (response) => setData(response.data),
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
    
      useEffect(() => {
        mutation.mutate(partnerId);
      }, []);
    
     
     
      
    
      useEffect(() => {
        if (isCalling) {
          callTimerRef.current = setInterval(() => {
            setCallDuration((prev) => prev + 1);
          }, 1000);
        } else {
          clearInterval(callTimerRef.current!);
          setCallDuration(0);
        }
      
        return () => {
          clearInterval(callTimerRef.current!);
        };
      }, [isCalling]);
     
   
      
    

    
    return(
        <>
        <ImageBackground className="h-full w-full" source={require("../../../assets/callbg.png")}> 
              <View className="py-[50px] items-center">
                <ThemeText size={Textstyles.text_cmedium}>{data?.firstName}</ThemeText>
                <Text style={[Textstyles.text_xsmall]} className="text-white">
          {isCalling ? `Calling - ${formatTime(callDuration)}` : !incomingCall ? "Incoming Call" : "Idle"}
        </Text>
              </View>
        
              <View className="flex-1 items-center w-full">
                <View className="w-36 h-36 rounded-full bg-white overflow-hidden justify-center items-center">
                  {data?.avatar && !imageError ? (
                    <Image
                      resizeMode="cover"
                      source={{ uri: data.avatar }}
                      className="h-full w-full"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <Text style={{ color: primaryColor }} className="text-6xl">
                      {getInitials({ firstName: data?.firstName, lastName: data?.lastName })}
                    </Text>
                  )}
                </View>
              </View>
        
              <View style={{ backgroundColor: selectioncardColor }} className="h-16 items-center justify-center rounded-xl flex-row gap-x-2">
        
          <>

        
            <TouchableOpacity
              style={{ backgroundColor: "red" }}
              className="rounded-full h-12 w-12 justify-center items-center"
              onPress={handleHangUp}
            >
              <FontAwesome5 color="#ffffff" name="phone-slash" size={24} />
            </TouchableOpacity>
          </>
   
        
          <TouchableOpacity
            style={{ backgroundColor: primaryColor }}
            className="rounded-full h-12 w-12 justify-center items-center"
          >
            <FontAwesome5 color="#ffffff" name="volume-up" size={24} />
          </TouchableOpacity>
        </View>
        
            </ImageBackground>
        </>
    )
}
export default CallAnswer