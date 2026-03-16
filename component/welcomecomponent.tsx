import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import AcePick from "../assets/acepick.svg"; 
import { useTheme } from "../hooks/useTheme";
import { getColors } from "../static/color"; 
import EmptyView from "./emptyview";
import { useRouter } from "expo-router";
import { Textstyles } from "../static/textFontsize";
import { useRole } from "context/roleContext";

function WelcomeComponent() {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor, welcomeText } = getColors(theme);
  const router = useRouter();
  const { dispatch } = useRole();
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    // Simulate logo loading
    const timer = setTimeout(() => {
      setLogoLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClientPress = () => {
    dispatch({ type: "SET_ROLE", payload: "client" });
    router.navigate("/loginscreen");
  };

  const handleProfessionalPress = () => {
    dispatch({ type: "SET_ROLE", payload: "artisan" });
    router.navigate("/(professionAuth)/loginprofession");
  };

  const handleDeliveryPress = () => {
    dispatch({ type: "SET_ROLE", payload: "delivery" });
    router.navigate("/(professionAuth)/loginprofession");
  };

  return (
    <View
      style={{ backgroundColor: backgroundColor }}
      className="h-full w-full flex items-center justify-center p-8"
    >
      {/* Logo Section with Loading State */}
      <View className="relative">
        {!logoLoaded && (
          <View className="absolute inset-0 justify-center items-center">
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        )}
        <View style={{ opacity: logoLoaded ? 1 : 0 }}>
          <AcePick />
        </View>
      </View>
      
      <EmptyView height={6} />
      
      {/* Title */}
      <View>
        <Text
          style={[Textstyles.text_medium, { color: welcomeText }]}
          className="text-2xl font-bold text-center"
        >
          Who are you?
        </Text>
      </View>
      
      <EmptyView height={8} />
      
      {/* Buttons with Enhanced Styling */}
      <View className="w-full flex items-center space-y-4">
        {/* Client Button */}
        <TouchableOpacity
          onPress={handleClientPress}
          style={{ 
            borderColor: primaryColor,
            borderWidth: 2,
            backgroundColor: 'transparent'
          }}
          className="w-11/12 rounded-xl py-4 transition-all duration-200"
        >
          <Text
            style={[Textstyles.text_cmedium, { color: primaryColor }]}
            className="text-center text-lg font-semibold"
          >
            Client
          </Text>
        </TouchableOpacity>
        <EmptyView height={8} />

        {/* Professional Button */}
        <TouchableOpacity
          onPress={handleProfessionalPress}
          style={{ 
            backgroundColor: primaryColor
          }}
          className="w-11/12 rounded-xl py-4 transition-all duration-200"
        >
          <Text
            style={[Textstyles.text_cmedium, { color: "#ffffff" }]}
            className="text-center text-lg font-semibold"
          >
            Professional
          </Text>
        </TouchableOpacity>
         <EmptyView height={8} />
        {/* Delivery Button */}
        <TouchableOpacity
          onPress={handleDeliveryPress}
          style={{ 
            borderColor: primaryColor,
            borderWidth: 2,
            backgroundColor: 'transparent'
          }}
          className="w-11/12 rounded-xl py-4 transition-all duration-200"
        >
          <Text
            style={[Textstyles.text_cmedium, { color: primaryColor }]}
            className="text-center text-lg font-semibold"
          >
            Delivery
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default WelcomeComponent;
