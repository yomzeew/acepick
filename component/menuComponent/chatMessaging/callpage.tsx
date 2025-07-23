import { FontAwesome5 } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import { ThemeText } from "component/ThemeText";
import { useCall } from "context/WebRtcContext";
import { useSocket } from "hooks/useSocket";
import { useTheme } from "hooks/useTheme";
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
import { getClientDetailFn, getProfessionDetailFn } from "services/userService";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import { getInitials } from "utilizes/initialsName";


interface MainProps {
  userDetails: string;
}

const CallChat = ({ userDetails }: MainProps) => {
  const {socket}=useSocket()
  const {
    isCalling,
    incomingCall,
    callUser,
    acceptCall,
    rejectCall,
    hangUp,
    setModalVisible
  } = useCall()

  useEffect(()=>{
setModalVisible(false)
  },)
  
  const user = useSelector((state: RootState) => state?.auth.user);
  const role = user?.role;
  const ids = JSON.parse(userDetails);
  const receiverId = ids?.userId;
  const professionalId = ids.professionalId;

  const [data, setData] = useState<any>(null);
  const [imageError, setImageError] = useState(false);

  const [callDuration, setCallDuration] = useState(0);
const callTimerRef = useRef<NodeJS.Timeout | null>(null);


  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };


  const payload = role === "client" ? professionalId : receiverId;
  const functionToUse = role === "client" ? getProfessionDetailFn : getClientDetailFn;

  const { theme } = useTheme();
  const { primaryColor, selectioncardColor } = getColors(theme);

  const mutation = useMutation({
    mutationFn: functionToUse,
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
    mutation.mutate(payload);
  }, []);

  const profile = data?.profile;
  
  

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

 



  return (
    <ImageBackground className="h-full w-full" source={require("../../../assets/callbg.png")}> 
      <View className="py-[50px] items-center">
        <ThemeText size={Textstyles.text_cmedium}>{profile?.firstName}</ThemeText>
        <Text style={[Textstyles.text_xsmall]} className="text-white">
  {isCalling ? `Calling - ${formatTime(callDuration)}` : incomingCall ? "Incoming Call" : "Idle"}
</Text>
   
      </View>

      <View className="flex-1 items-center w-full">
        <View className="w-36 h-36 rounded-full bg-white overflow-hidden justify-center items-center">
          {profile?.avatar && !imageError ? (
            <Image
              resizeMode="cover"
              source={{ uri: profile.avatar }}
              className="h-full w-full"
              onError={() => setImageError(true)}
            />
          ) : (
            <Text style={{ color: primaryColor }} className="text-6xl">
              {getInitials({ firstName: profile?.firstName, lastName: profile?.lastName })}
            </Text>
          )}
        </View>
      </View>

      <View style={{ backgroundColor: selectioncardColor }} className="h-16 items-center justify-center rounded-xl flex-row gap-x-2">
  {!isCalling && !incomingCall && (
    <TouchableOpacity
      style={{ backgroundColor: primaryColor }}
      className="rounded-full h-12 w-12 justify-center items-center"
      onPress={()=>callUser(profile.userId)}
    >
      <FontAwesome5 color="#ffffff" name="phone" size={24} />
    </TouchableOpacity>
  )}

  {isCalling && (
    <TouchableOpacity
      style={{ backgroundColor: "red" }}
      className="rounded-full h-12 w-12 justify-center items-center"
      onPress={hangUp}
    >
      <FontAwesome5 color="#ffffff" name="phone-slash" size={24} />
    </TouchableOpacity>
  )}

{incomingCall && !isCalling && (
  <>
    <TouchableOpacity
      style={{ backgroundColor: "green" }}
      className="rounded-full h-12 w-12 justify-center items-center"
      onPress={acceptCall} // ✅ This is how you use it
    >
      <FontAwesome5 color="#ffffff" name="phone" size={24} />
    </TouchableOpacity>

    <TouchableOpacity
      style={{ backgroundColor: "red" }}
      className="rounded-full h-12 w-12 justify-center items-center"
      onPress={rejectCall}
    >
      <FontAwesome5 color="#ffffff" name="phone-slash" size={24} />
    </TouchableOpacity>
  </>
)}

  <TouchableOpacity
    style={{ backgroundColor: primaryColor }}
    className="rounded-full h-12 w-12 justify-center items-center"
  >
    <FontAwesome5 color="#ffffff" name="volume-up" size={24} />
  </TouchableOpacity>
</View>

    </ImageBackground>
  );
};

export default CallChat;
