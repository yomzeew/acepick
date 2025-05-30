import React, { useEffect, useState } from "react";
import { View, Animated } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { getColors } from "../static/color";
import ButtonComponent from "./buttoncomponent";
import VerifyComponent from "./verifycomponent";
import EmptyView from "./emptyview";
import { useRouter } from "expo-router";

const SliderModal = ({ showmodal, setshowmodal, route,title="Email/Phone number Verified",textbutton="Continue registration",subtitle="" }: { showmodal: boolean; setshowmodal: (value: boolean) => void; route: string;title:string,textbutton?:string,subtitle?:string }) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, backgroundColortwo, secondaryTextColor } = getColors(theme);
  const router=useRouter()

  // 🔹 Spring animation value
  const [slideAnim] = useState(new Animated.Value(0)); // Hidden initially

  useEffect(() => {
    if (showmodal) {
      // 🔹 Spring Up Animation
      Animated.spring(slideAnim, {
        toValue: 1,
        friction: 8,      // Damping effect
        tension: 50,      // Stiffness of the spring
        useNativeDriver: true,
      }).start();
    } else {
      // 🔹 Spring Down Animation
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }).start();
    }
  }, [showmodal]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0], // Slide from offscreen to visible
  });

  return (
    <>
      {/* 🔹 Dim Background */}
      <View style={{ backgroundColor: backgroundColortwo }} className="h-full w-full absolute opacity-70 z-50" />

      {showmodal && (
        <Animated.View
          style={{
            transform: [{ translateY }],
            flex: 1,
            width: "100%",
            backgroundColor: backgroundColor,
          }}
          className="absolute bottom-0 z-50 h-1/2 rounded-t-3xl border-slate-400 border"
        >
          <EmptyView height={56} />
          <VerifyComponent textcolor={secondaryTextColor} text={title} subtitle={subtitle} />
          <EmptyView height={56} />
          <View className="px-6">
            <ButtonComponent color={primaryColor} text={textbutton} textcolor="#fff" onPress={()=>router.push(route)} />
          </View>
        </Animated.View>
      )}
    </>
  );
};

export default SliderModal;
