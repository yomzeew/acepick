import { Tabs } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "hooks/useTheme";
import { View } from "react-native";


export default function ProfessionalLayout() {
  const { theme } = useTheme()

  const activeBg = theme === "dark" ? "#033A62" : "#ffffff";
  const activeColor = theme === "dark" ? "#ffffff" : "#033A62";
  const inactiveColor = "#ffffff";
  const tabBarBg = theme === "dark" ? "#333333" : "#033A62";

  return (
    <Tabs
      screenOptions={({ route }) => ({
             tabBarShowLabel: true,
             headerShown: false,
             tabBarStyle: {
               backgroundColor: tabBarBg,
               height: 80,
               paddingBottom: 10,
               paddingTop:5,
            
             },
             tabBarIcon: ({ focused, color, size }) => {
               let iconName: any;
     
               if (route.name === "homeprofessionalayout") iconName = "home";
               else if (route.name === "chatlayout") iconName = "comment-dots";
               else if (route.name === "myjobAPLayout") iconName = "toolbox";
     
               return (
                 <View className="items-center justify-center w-10 h-10 rounded-full" style={{backgroundColor:focused ? activeBg : "transparent"}}>
                    <FontAwesome5
                   name={iconName}
                   size={20}
                   color={focused ? activeColor : inactiveColor}
                 />
                 </View>
                
               );
             },
             tabBarLabelStyle: {
               fontSize: 12,
               fontWeight: "600",
               color: theme === "dark" ? "#fff" : "#fff", // you can adjust this if needed
             },
             tabBarActiveTintColor: activeColor,
             tabBarInactiveTintColor: inactiveColor,
           })}
         >
      <Tabs.Screen name="homeprofessionalayout" options={{ title: "Home" }} />
      <Tabs.Screen name="chatlayout" options={{ title: "Chat" }} />
      <Tabs.Screen name="myjobAPLayout" options={{ title: "My Job" }} />
    </Tabs>
  );
}

