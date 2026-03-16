import { View, TouchableOpacity, Text, Image, Dimensions, Platform, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { AntDesign } from '@expo/vector-icons';
import FirstSvg from "../assets/first.svg";
import SecondSvg from "../assets/2nd.svg";
import ThirdSvg from "../assets/3rd.svg";
import FourthSvg from "../assets/4th.svg";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../hooks/useTheme";
import { getColors } from "../static/color";
import { useRouter } from "expo-router";
import EmptyView from "./emptyview";
import { Textstyles } from "../static/textFontsize";

const Splash = () => {
  const router = useRouter()
  const { theme } = useTheme();
  const { primaryColor, primaryTextColor, secondaryTextColor, backgroundColor } = getColors(theme);

  const values = [
    {
      image: require('../assets/first.png'),
      svg: <FirstSvg />,
      header: "You are welcome to StaffSync",
      body: "Your gateway to a world of possibilities. Connect with skilled professionals, explore a transparent marketplace, and experience secure transactions. Join us on this journey where clients and professionals thrive together.",
    },
    {
      image: require('../assets/2nd.png'),
      svg: <SecondSvg />,
      header: "Direct Connections, Seamless Chats",
      body: "Clients, engage in direct chats with professionals across sectors. Discuss projects, explore services, and build connections. StaffSync simplifies communication for a personalized and efficient experience.",
    },
    {
      image: require('../assets/3rd.png'),
      svg: <ThirdSvg />,
      header: "Explore the Marketplace",
      body: "Discover our Marketplace, where you can confirm prices of items, explore businesses, and find the best deals. StaffSync is committed to transparency, ensuring a seamless experience whether you're hiring professionals or exploring the market.",
    },
    {
      image: require('../assets/4th.png'),
      svg: <FourthSvg />,
      header: "Secure Transactions, Effortless works",
      body: "StaffSync prioritizes your security. Experience secure transactions, transparent processes, and an intuitive platform. Clients, approve invoices with ease, and professionals, showcase your skills and create invoices effortlessly. StaffSync, where every connection leads to success.",
    },
  ];

  const [progress, setProgress] = useState(0);
  const [currentScreen, setCurrentScreen] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(values.length).fill(false));
  const [imageLoadError, setImageLoadError] = useState<boolean[]>(new Array(values.length).fill(false));

  useEffect(() => {
    const progressValues = [25, 50, 75, 100];
    setProgress(progressValues[currentScreen] || 0);
  }, [currentScreen]);

  // Preload images for better performance - note: require() images are bundled at build time
  useEffect(() => {
    // For require() images, we don't need to prefetch as they're bundled
    // Just set all images as loaded
    setImagesLoaded(new Array(values.length).fill(true));
  }, []);

  const nextScreen = () => {
    if (currentScreen < values.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      router.navigate("/welcomescreen");
    }
  };

  const skipToWelcome = () => {
    router.navigate("/welcomescreen");
  };

  const height = Dimensions.get('window').height;

  const renderImage = () => {
    const current = values[currentScreen];
    
    // Use SVG if available and no error with PNG
    if (current.svg && !imageLoadError[currentScreen]) {
      return (
        <View className="w-full h-full relative">
          {current.svg}
          {!imagesLoaded[currentScreen] && (
            <View className="absolute inset-0 justify-center items-center bg-white/50">
              <ActivityIndicator size="large" color={primaryColor} />
            </View>
          )}
        </View>
      );
    }
    
    // Fallback to PNG with better quality settings
    return (
      <View className="w-full h-full relative">
        <Image 
          source={current.image} 
          style={{ 
            width: '100%', 
            height: '100%',
            resizeMode: 'cover'
          }} 
          onLoad={() => {
            setImagesLoaded(prev => {
              const newLoaded = [...prev];
              newLoaded[currentScreen] = true;
              return newLoaded;
            });
          }}
          onError={() => {
            setImageLoadError(prev => {
              const newError = [...prev];
              newError[currentScreen] = true;
              return newError;
            });
          }}
        />
        {!imagesLoaded[currentScreen] && (
          <View className="absolute inset-0 justify-center items-center bg-white/50">
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="h-full w-full">
      <StatusBar style="auto" />
      
      {/* Image Section */}
      <View className="w-full" style={{ height: height * 0.5 }}>
        {renderImage()}
      </View>

      {/* Content Section */}
      <View style={{ height: height * 0.5, backgroundColor: backgroundColor }} className="w-full absolute bottom-0 z-50 p-8 rounded-t-3xl">
        
        {/* Progress Indicator */}
        <View className="flex-row justify-between mb-6">
          {values.map((_, index) => (
            <View 
              key={index}
              className={`h-1 flex-1 mx-1 rounded-full ${
                index <= currentScreen ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </View>

        {/* Header */}
        <Text 
          style={[Textstyles.text_medium, { color: primaryTextColor }]} 
          className="text-blue-600 font-bold"
        >
          {values[currentScreen].header}
        </Text>
        
        <EmptyView height={3} />
        
        {/* Body */}
        <View className="">
          <Text 
            style={[Textstyles.text_x16small, { color: secondaryTextColor }]} 
            className={`text-slate-400 ${Platform.OS === 'ios' ? 'text-lg' : 'text-sm'} leading-relaxed`}
          >
            {values[currentScreen].body}
          </Text>
        </View>
        
        <EmptyView height={8} />

        {/* Action Buttons */}
        <View>
          {currentScreen === values.length - 1 ? (
            <View className="flex-row justify-end">
              <TouchableOpacity 
                onPress={skipToWelcome}
                style={{ backgroundColor: primaryColor }}
                className="px-8 py-3 rounded-full"
              >
                <Text
                  style={[Textstyles.text_cmedium, { color: '#ffffff' }]}
                  className="font-bold"
                >
                  GET STARTED
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View className="h-5" />
              <View className="flex-row justify-between items-center">
                <TouchableOpacity onPress={skipToWelcome}>
                  <Text 
                    style={[Textstyles.text_cmedium, { color: primaryTextColor }]} 
                    className="text-slate-200 font-semibold"
                  >
                    SKIP
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={nextScreen}
                  style={{ backgroundColor: primaryColor }}
                  className="rounded-full w-12 h-12 flex-row items-center justify-center shadow-lg"
                >
                  <AntDesign name="arrowright" size={24} color="#ffffff" />
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
