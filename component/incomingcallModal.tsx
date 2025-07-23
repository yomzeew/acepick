import { View, Text, Modal, TouchableOpacity, Image } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useWebRtc } from "hooks/useWebRTCCall";
import { useSocket } from "hooks/useSocket";
import { useEffect, useState } from "react";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { getClientDetailFn, getProfessionDetailFnBYUserID } from "services/userService";
import { useMutation } from "@tanstack/react-query";
import { getInitials } from "utilizes/initialsName";
import { useRouter } from "expo-router";
import { useCall } from "context/WebRtcContext";

const IncomingCallModal = () => {
    const { socket } = useSocket();
    const {
        incomingCall,
        acceptCall,
        rejectCall,
        isCalling,
        modalVisible,
        setModalVisible,
        partnerId,
        hangUp
      } = useCall(); // Using context instead of direct hook
    
  
    const [data, setData] = useState<any>(null);
    const [imageError, setImageError] = useState(false);
  
    const user = useSelector((state: RootState) => state?.auth.user);
    const role = user?.role;
    const functionToUse = role === "client" ? getProfessionDetailFnBYUserID : getClientDetailFn;
    const { theme } = useTheme();
    const { primaryColor } = getColors(theme);
    const router = useRouter();
  
    const mutation = useMutation({
      mutationFn: functionToUse,
      onSuccess: (response) => setData(response.data),
      onError: (error: any) => {
        let msg = error?.response?.data?.message || error?.message || "An error occurred";
        console.error("failed:", msg);
      },
    });
  
   
    useEffect(() => {
      if (partnerId) {
        mutation.mutate(partnerId);
      }
    }, [partnerId]);
  
    const profile = data?.profile;
 
    const handleReject = () => {
      rejectCall();
    };
  
    const handleAnswer = async () => {
        try {
          await acceptCall();
          router.push(`/callAnswer/${JSON.stringify(partnerId)}`);
        } catch (error) {
          console.error("Error accepting call:", error);
          hangUp();
        }
      };
    if (!modalVisible) return null;
  
    return (
      <Modal transparent animationType="slide" visible={modalVisible}>
        <View className="flex-1 justify-center items-center bg-black/50 px-8 w-full">
          <View className="bg-white p-6 rounded-xl items-center w-[90%] max-w-md">
            <Text className="text-lg font-semibold mb-2">Incoming Call</Text>
  
            <Text className="mb-4 text-center text-gray-700">
              From {profile?.firstName} {profile?.lastName}
            </Text>
  
            <View className="items-center mb-6">
              <View className="w-36 h-36 rounded-full bg-white overflow-hidden justify-center items-center shadow-md">
                {profile?.avatar && !imageError ? (
                  <Image
                    resizeMode="cover"
                    source={{ uri: profile.avatar }}
                    className="h-full w-full"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Text style={{ color: primaryColor }} className="text-6xl font-bold">
                    {getInitials({
                      firstName: profile?.firstName,
                      lastName: profile?.lastName,
                    })}
                  </Text>
                )}
              </View>
            </View>
  
            <View className="flex-row gap-x-6">
              <TouchableOpacity
                className="bg-green-600 p-4 rounded-full"
                onPress={handleAnswer}
              >
                <FontAwesome5 name="phone" color="white" size={20} />
              </TouchableOpacity>
  
              <TouchableOpacity
                className="bg-red-600 p-4 rounded-full"
                onPress={handleReject}
              >
                <FontAwesome5 name="phone-slash" color="white" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

export default IncomingCallModal;
