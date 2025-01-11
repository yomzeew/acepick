import { View, TouchableOpacity, Text, Image, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { AntDesign } from '@expo/vector-icons'; // Add AntDesign import
import FirstSvg from "../assets/first.svg";
import SecondSvg from "../assets/2nd.svg";
import ThirdSvg from "../assets/3rd.svg";`  1`
import FourthSvg from "../assets/4th.svg";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../hooks/useTheme";
import { getColors } from "../static/color"; // Assuming color.ts is in utils folder



const Splash = () => {
    const { theme } = useTheme(); // Get the theme
  const { primaryColor, primaryTextColor, secondaryTextColor, backgroundColor } = getColors(theme); // Get the colors

  const values = [
    {
        image: <FirstSvg className="w-full"/>,
      header: "You are welcome to Acepick",
      body: "Your gateway to a world of possibilities. Connect with skilled professionals, explore a transparent marketplace, and experience secure transactions. Join us on this journey where clients and professionals thrive together.",
    },
    {
        image: <SecondSvg className="w-full"/>,
      header: "Direct Connections, Seamless Chats",
      body: "Clients, engage in direct chats with professionals across sectors. Discuss projects, explore services, and build connections. Acepick simplifies communication for a personalized and efficient experience.",
    },
    {
        image: <ThirdSvg className="w-full" />,
      header: "Explore the Marketplace",
      body: "Discover our Marketplace, where you can confirm prices of items, explore businesses, and find the best deals. Acepick is committed to transparency, ensuring a seamless experience whether you're hiring professionals or exploring the market.",
    },
    {
        image: <FourthSvg className="w-full"/>,
      header: "Secure Transactions, Effortless works",
      body: "Acepick prioritizes your security. Experience secure transactions, transparent processes, and an intuitive platform. Clients, approve invoices with ease, and professionals, showcase your skills and create invoices effortlessly. Acepick, where every connection leads to success.",
    },
  ];

  const [progress, setProgress] = useState(0);
  const [currentScreen, setCurrentScreen] = useState(0);

  useEffect(() => {
    const progressValues = [33.33, 66.66, 100];
    setProgress(progressValues[currentScreen] || 0);
  }, [currentScreen]);

  const nextScreen = () => {
    if (currentScreen < values.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      console.log("Navigate to next screen");
    }
  };
const height:number=Dimensions.get('window').height;
  return (
    <View  className="h-full w-full ">
        <StatusBar style="auto" />
        <View className="w-full">
            <View className="relative">
            {values[currentScreen].image}
            </View>

            </View>
            <View style={{height:height*0.4, backgroundColor:backgroundColor}} className=" rounded-r-3xl  rounded-l-3xl w-full absolute bottom-0 z-50  p-8">
            <View className="h-5"></View>
            <Text style={{color:primaryTextColor}} className=" text-blue-600 text-3xl">{values[currentScreen].header}</Text>
            <View className="h-5"></View>
            <View className="mb-10">
              <Text style={{color:secondaryTextColor}} className="text-slate-400">{values[currentScreen].body}</Text>
            </View>
            <View>
    {currentScreen === 3 ? (
      <View className="flex-row justify-end">
        <TouchableOpacity>
          <Text
            style={{ color: primaryTextColor }}
            className="text-white font-bold text-lg"
          >
            GET STARTED
          </Text>
        </TouchableOpacity>
      </View>
    ) : (
      <View className="flex-row justify-between">
        <TouchableOpacity>
          <Text style={{ color: primaryTextColor }} className="text-slate-200 pt-3">
            SKIP
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={nextScreen}>
        <View
          style={{ backgroundColor: primaryColor }}
          className="rounded-full p-3"
        >
          <AntDesign name="arrowright" size={24} color="#ffffff" />
        </View>
        </TouchableOpacity>
      </View>
      
    )}
  
</View>

           

        </View>
     
    </View>

    
    
  );
};

export default Splash;
