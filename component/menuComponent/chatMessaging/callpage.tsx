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
import { generalUserDetailFn} from "services/userService";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import { Profile } from "types/userDetailsType";
import { getInitials } from "utilizes/initialsName";


interface MainProps {
  userDetails?: string;
}

const CallChat = ({ userDetails = '{}' }: MainProps) => {
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
  const partnerId = ids?.userId;


  const [data, setData] = useState<Profile | null>(null);
  const [imageError, setImageError] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'ringing' | 'connecting' | 'connected' | 'failed'>('idle');
  const [callDuration, setCallDuration] = useState(0);
const callTimerRef = useRef<NodeJS.Timeout | null>(null);


  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };


  

  const { theme } = useTheme();
  const { primaryColor, selectioncardColor } = getColors(theme);

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
        console.error("failed;;:", msg);
      },
    });
  
    useEffect(() => {
      mutation.mutate(partnerId);
    }, []);


  
  

  useEffect(() => {
    if (isCalling) {
      if (callDuration === 0) {
        setCallStatus('connecting');
      } else if (callDuration < 5) {
        setCallStatus('ringing');
      } else {
        setCallStatus('connected');
      }
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callDuration > 0) {
        setCallStatus('idle');
      }
      clearInterval(callTimerRef.current!);
      setCallDuration(0);
    }
  
    return () => {
      clearInterval(callTimerRef.current!);
    };
  }, [isCalling, callDuration]);

  useEffect(() => {
    if (incomingCall) {
      setCallStatus('ringing');
    } else if (!isCalling && !incomingCall) {
      setCallStatus('idle');
    }
  }, [incomingCall, isCalling]);

 



  return (
    <ImageBackground className="h-full w-full" source={require("../../../assets/callbg.png")}> 
      <View className="py-[50px] items-center">
        <ThemeText size={Textstyles.text_cmedium}>{data?.firstName}</ThemeText>
        <View className="flex-row items-center">
          {callStatus === 'ringing' && (
            <View className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
          )}
          {callStatus === 'connecting' && (
            <View className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse" />
          )}
          {callStatus === 'connected' && (
            <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
          )}
          {callStatus === 'failed' && (
            <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
          )}
          <Text style={[Textstyles.text_xsmall]} className="text-white">
            {callStatus === 'idle' && "Ready"}
            {callStatus === 'ringing' && (incomingCall ? "Incoming Call..." : "Ringing...")}
            {callStatus === 'connecting' && "Connecting..."}
            {callStatus === 'connected' && `Connected - ${formatTime(callDuration)}`}
            {callStatus === 'failed' && "Call Failed"}
          </Text>
        </View>
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
              {getInitials({ firstName: data?.firstName || '', lastName: data?.lastName || ''})}
            </Text>
          )}
        </View>
      </View>

      <View style={{ backgroundColor: selectioncardColor }} className="h-16 items-center justify-center rounded-xl flex-row gap-x-2">
  {!isCalling && !incomingCall && (
    <TouchableOpacity
      style={{ backgroundColor: primaryColor }}
      className="rounded-full h-12 w-12 justify-center items-center shadow-lg"
      onPress={() => {
        setCallStatus('connecting');
        callUser(data?.userId || "");
      }}
    >
      <FontAwesome5 color="#ffffff" name="phone" size={24} />
    </TouchableOpacity>
  )}

  {isCalling && (
    <>
      <TouchableOpacity
        style={{ backgroundColor: "#ef4444" }}
        className="rounded-full h-12 w-12 justify-center items-center shadow-lg"
        onPress={async () => {
          setCallStatus('idle');
          await hangUp();
        }}
      >
        <FontAwesome5 color="#ffffff" name="phone-slash" size={24} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={{ backgroundColor: primaryColor }}
        className="rounded-full h-12 w-12 justify-center items-center shadow-lg"
      >
        <FontAwesome5 color="#ffffff" name="microphone" size={24} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={{ backgroundColor: primaryColor }}
        className="rounded-full h-12 w-12 justify-center items-center shadow-lg"
      >
        <FontAwesome5 color="#ffffff" name="volume-up" size={24} />
      </TouchableOpacity>
    </>
  )}

  {incomingCall && !isCalling && (
    <>
      <TouchableOpacity
        style={{ backgroundColor: "#10b981" }}
        className="rounded-full h-12 w-12 justify-center items-center shadow-lg"
        onPress={async () => {
          setCallStatus('connecting');
          await acceptCall();
        }}
      >
        <FontAwesome5 color="#ffffff" name="phone" size={24} />
      </TouchableOpacity>

      <TouchableOpacity
        style={{ backgroundColor: "#ef4444" }}
        className="rounded-full h-12 w-12 justify-center items-center shadow-lg"
        onPress={async () => {
          setCallStatus('idle');
          await rejectCall();
        }}
      >
        <FontAwesome5 color="#ffffff" name="phone-slash" size={24} />
      </TouchableOpacity>
    </>
  )}
</View>

    </ImageBackground>
  );
};

export default CallChat;
