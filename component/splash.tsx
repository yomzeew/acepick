import { View, TouchableOpacity, Text, Image, Dimensions, Platform } from "react-native";
import { useState, useEffect } from "react";
import { AntDesign } from '@expo/vector-icons'; // Add AntDesign import
import FirstSvg from "../assets/first.svg";
import SecondSvg from "../assets/2nd.svg";
import ThirdSvg from "../assets/3rd.svg";
import FourthSvg from "../assets/4th.svg";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../hooks/useTheme";
import { getColors } from "../static/color"; // Assuming color.ts is in utils folder
import { useRouter } from "expo-router";
import EmptyView from "./emptyview";
import { Textstyles } from "../static/textFontsize";


const Splash = () => {
  const router = useRouter()
    const { theme } = useTheme(); // Get the theme
  const { primaryColor, primaryTextColor, secondaryTextColor, backgroundColor } = getColors(theme); // Get the colors

  const values = [
    {
        image: <Image source={require('../assets/first.png')} resizeMode="cover"  />,
      header: "You are welcome to Acepick",
      body: "Your gateway to a world of possibilities. Connect with skilled professionals, explore a transparent marketplace, and experience secure transactions. Join us on this journey where clients and professionals thrive together.",
    },
    {
        image:  <Image source={require('../assets/2nd.png')} resizeMode="cover"  />,
      header: "Direct Connections, Seamless Chats",
      body: "Clients, engage in direct chats with professionals across sectors. Discuss projects, explore services, and build connections. Acepick simplifies communication for a personalized and efficient experience.",
    },
    {
        image:  <Image source={require('../assets/3rd.png')} resizeMode="cover"  />,
      header: "Explore the Marketplace",
      body: "Discover our Marketplace, where you can confirm prices of items, explore businesses, and find the best deals. Acepick is committed to transparency, ensuring a seamless experience whether you're hiring professionals or exploring the market.",
    },
    {
        image: <Image source={require('../assets/4th.png')} resizeMode="cover"  />,
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
            <View style={{height:height*0.5, backgroundColor:backgroundColor}} className="w-full absolute bottom-0 z-50  p-8 rounded-t-3xl">
           
            <Text style={[Textstyles.text_medium, {color:primaryTextColor}]} className=" text-blue-600">{values[currentScreen].header}</Text>
      <EmptyView/>
            <View className="">
              <Text style={[Textstyles.text_x16small,{color:secondaryTextColor}]} className={`text-slate-400 ${Platform.OS==='ios'?'text-lg':'text-sm'}`}>{values[currentScreen].body}</Text>
            </View>
            <View>
    {currentScreen === 3 ? (
      <View className="flex-row justify-end">
       <TouchableOpacity onPress={() => router.navigate("/welcomescreen")}>
          <Text
            style={[Textstyles.text_cmedium,{ color: primaryTextColor }]}
            className="text-white font-bold"
          >
            GET STARTED
          </Text>
        </TouchableOpacity>
      </View>
    ) : (
      <View>
        <View className="h-5"></View>
      <View className="flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.navigate("/welcomescreen")}>
          <Text style={[Textstyles.text_cmedium,{ color: primaryTextColor }]} className="text-slate-200">
            SKIP
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={nextScreen}>
        <View
          style={{ backgroundColor: primaryColor }}
          className="rounded-full w-10 h-10 flex-row items-center justify-center"
        >
          <AntDesign name="arrowright" size={24} color="#ffffff"className="mx-1"/>
        </View>
        </TouchableOpacity>
      </View>
      </View>
    )}
  
</View>

           

        </View>
     
    </View>

    
    
  );
};

export default Splash;
