import { useTheme } from "hooks/useTheme";
import { useRef, useState } from "react";
import { PanResponder, TouchableOpacity, View,Text } from "react-native";
import { Textstyles } from "static/textFontsize";

interface SwitchProps{
    activePage:string;
    setActivePage:(value:string)=>void
}


const SwitchMode = ({activePage,setActivePage}:SwitchProps) => {
 
  const { theme } = useTheme();

  const activestylebg = activePage === "corporate" ? "#033A62" : "transparent";
  const activestylesbgtwo = activePage === "professional" ? "#033A62" : "transparent";
  const activestyletext = activePage === "corporate" ? "#ffffff" : "#b5b3b3";
  const activestylesbgtexttwo = activePage === "professional" ? "#ffffff" : "#b5b3b3";

  // Create a PanResponder to handle horizontal swipe gestures.
  const panResponder = useRef(
    PanResponder.create({
      // Only respond to horizontal movements
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => 
        Math.abs(gestureState.dx) > 10, // Lower threshold to make it more responsive
      
      onPanResponderRelease: (_, gestureState) => {
        // Improved swipe detection logic
        if (gestureState.dx < -20) {
          // Swiping left - go to professional view
          console.log("Swiping to professional");
          setActivePage("corporate");
        } else if (gestureState.dx > 20) {
          // Swiping right - go to corporate view
          console.log("Swiping to corporate");
          
          setActivePage("professional");
        }
      },
    })
  ).current;

  return (
    // Attach panHandlers to a wrapping View
    <View {...panResponder.panHandlers}>
      <View
        className={`${
          theme === "dark" ? "bg-gray-700" : "bg-gray-200"
        } rounded-3xl h-12 flex-row`}
      >
             <TouchableOpacity
          onPress={() => setActivePage("professional")}
          style={{ backgroundColor: activestylesbgtwo }}
          className="rounded-3xl h-full items-center justify-center w-1/2"
        >
          <Text
            style={[Textstyles.text_cmedium, { color: activestylesbgtexttwo }]}
          >
            Profession
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActivePage("corporate")}
          style={{ backgroundColor: activestylebg }}
          className="rounded-3xl h-full items-center justify-center w-1/2"
        >
          <Text style={[Textstyles.text_cmedium, { color: activestyletext }]}>
            Corporate Bodies
          </Text>
        </TouchableOpacity>
   
      </View>
    </View>
  );
};
export default SwitchMode