import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import LottieView from "lottie-react-native";
import { useRef, useEffect } from "react";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { Textstyles } from "static/textFontsize";

const PaymentFailure = () => {
  const router = useRouter();
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    animationRef.current?.play();
  }, []);

  return (
    <ContainerTemplate>
      <View className="flex-1 justify-center items-center  p-5">
      <LottieView
        ref={animationRef}
        source={require("../../../assets/animations/fail.json")}
        style={{ width: 200, height: 200 }}
        loop={false}
      />
         <ThemeText size={Textstyles.text_cmedium}>
        Payment Failed
      </ThemeText>
      <ThemeTextsecond size={Textstyles.text_x16small}>
        Something went wrong. Please try again later.
      </ThemeTextsecond>
      <TouchableOpacity
        className="mt-10 bg-red-600 px-6 py-3 rounded-full"
        onPress={() => router.replace("/homelayout")}
      >
        <Text className="text-white font-medium text-base">Try Again</Text>
      </TouchableOpacity>
    </View>
    </ContainerTemplate>
  );
};

export default PaymentFailure;
