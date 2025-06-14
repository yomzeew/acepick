import { useLocalSearchParams } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import LottieView from "lottie-react-native";
import { useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import { ThemeText } from "component/ThemeText";
import { Textstyles } from "static/textFontsize";

const PaymentSuccess = () => {
  const { message } = useLocalSearchParams();
  const router = useRouter();
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    animationRef.current?.play();
  }, []);

  return (
    <ContainerTemplate >
      <View className="flex-1 justify-center items-center  p-5">
      <LottieView
        ref={animationRef}
        source={require('../../../assets/animations/success.json')}
        style={{ width: 200, height: 200 }}
        loop={false}
      />
      <ThemeText size={Textstyles.text_cmedium}>
        {message || "Payment Successful!"}
      </ThemeText>
      <TouchableOpacity
        className="mt-10 bg-green-600 px-6 py-3 rounded-full"
        onPress={() => router.replace("/homelayout")}
      >
        <Text className="text-white font-medium text-base">Go Home</Text>
      </TouchableOpacity>

      </View>
     
    </ContainerTemplate>
  );
};

export default PaymentSuccess;
