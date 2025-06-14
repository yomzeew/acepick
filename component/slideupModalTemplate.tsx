import React, { ReactNode, useEffect, useState } from "react";
import {
  View,
  Animated,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useTheme } from "../hooks/useTheme";
import { getColors } from "../static/color";

interface SlideupModalTemplateProps {
  children: ReactNode;
  showmodal: boolean;
  modalHeight: any;
  setshowmodal: (value: boolean) => void;
}

const SliderModalTemplate = ({ children, showmodal, setshowmodal, modalHeight }: SlideupModalTemplateProps) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, backgroundColortwo, secondaryTextColor } = getColors(theme);

  // 🔹 Spring animation value
  const [slideAnim] = useState(new Animated.Value(0)); // Hidden initially

  useEffect(() => {
    if (showmodal) {
      // 🔹 Spring Up Animation
      Animated.spring(slideAnim, {
        toValue: 1,
        friction: 8, // Damping effect
        tension: 50, // Stiffness of the spring
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
      {showmodal &&<Pressable onPress={() => setshowmodal(false)} style={{ backgroundColor: backgroundColortwo, zIndex:50,elevation:50 }} className="h-full w-full absolute opacity-70" />}

      {showmodal && (
        <Animated.View
          style={{
            transform: [{ translateY }],
            flex: 1,
            width: "100%",
            backgroundColor: backgroundColor,
            height: modalHeight,
            zIndex:50,
            elevation:50
          }}
          className="absolute bottom-0  rounded-t-3xl"
        >
          {/* 🔹 Wrap everything to avoid keyboard overlap */}
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView keyboardShouldPersistTaps="handled">
                {children}
              </ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </>
  );
};

export default SliderModalTemplate;



interface SlideupModalTemplateProps {
  children: ReactNode;
  showmodal: boolean;
  modalHeight: any;
  setshowmodal: (value: boolean) => void;
}

export const SliderModalNoScrollview = ({ children, showmodal, setshowmodal, modalHeight }: SlideupModalTemplateProps) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, backgroundColortwo, secondaryTextColor } = getColors(theme);

  // 🔹 Spring animation value
  const [slideAnim] = useState(new Animated.Value(0)); // Hidden initially

  useEffect(() => {
    if (showmodal) {
      // 🔹 Spring Up Animation
      Animated.spring(slideAnim, {
        toValue: 1,
        friction: 8, // Damping effect
        tension: 50, // Stiffness of the spring
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
      {showmodal &&<Pressable onPress={() => setshowmodal(false)} style={{ backgroundColor: backgroundColortwo, zIndex:50,elevation:50 }} className="h-full w-full absolute opacity-70" />}

      {showmodal && (
        <Animated.View
          style={{
            transform: [{ translateY }],
            flex: 1,
            width: "100%",
            backgroundColor: backgroundColor,
            height: modalHeight,
            zIndex:50,
            elevation:50

          }}
          className="absolute bottom-0 z-50  rounded-t-3xl"
        >
          {/* 🔹 Wrap everything to avoid keyboard overlap */}
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
                {children}
            </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </>
  );
};

