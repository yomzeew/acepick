import { AntDesign } from "@expo/vector-icons";
import Divider from "component/divider";
import EmptyView from "component/emptyview";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { useTheme } from "hooks/useTheme";
import { useEffect, useState } from "react";
import { TouchableOpacity, View, ScrollView, Pressable } from "react-native";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import { getAllStates, getLgasByState } from "utilizes/fetchlistofstateandlga";

interface StateLgaProp {
  state: string;
  lga: string;
  setstate: (value: string) => void;
  setlga: (value: string) => void;
  setShowOption: (value: boolean) => void;
  showOption:boolean
  setIsStateSelection:(value: boolean) => void;
  data:string[]
  setData:(value:string[])=>void
  isStateSelection:boolean
}

const StateandLga = ({ lga = "", state = "", setstate, setlga,setIsStateSelection,setShowOption,showOption,data,setData,isStateSelection }: StateLgaProp) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, backgroundColortwo, secondaryTextColor } = getColors(theme);

  const allStates: string[] = getAllStates();
  const lgaList: string[] = state ? getLgasByState(state) : [];

  useEffect(() => {
    if (state) {
      setData(getLgasByState(state));
    }
  }, [state]);

  const handleSelectState = () => {
    setData(allStates);
    setIsStateSelection(true);
    setShowOption(!showOption);
  };

  const handleSelectLga = () => {
    if (!state) return; // Prevent selecting LGA before selecting a state
    setData(lgaList);
    setIsStateSelection(false);
    setShowOption(!showOption);
  };

  const handleSelection = (item: string) => {
    if (isStateSelection) {
      setstate(item);
      setlga(""); // Reset LGA when state changes
    } else {
      setlga(item);
    }
    setShowOption(false);
  };

  return (
    <>
      
        <View className="w-full">
            {/* State Selection */}
            <TouchableOpacity onPress={handleSelectState} className="w-full h-14 border rounded-xl border-slate-400 flex-row items-center justify-between px-3">
              <ThemeTextsecond size={Textstyles.text_xsma}>{state === "" ? "Select State" : state}</ThemeTextsecond>
              <AntDesign name="down" size={16} color={secondaryTextColor} />
            </TouchableOpacity>
            <EmptyView height={10} />
            {/* LGA Selection */}
            <TouchableOpacity onPress={handleSelectLga} className="w-full h-14 border rounded-xl border-slate-400 flex-row items-center justify-between px-3">
              <ThemeTextsecond size={Textstyles.text_xsma}>{lga === "" ? "Select LGA" : lga}</ThemeTextsecond>
              <AntDesign name="down" size={16} color={secondaryTextColor} />
            </TouchableOpacity>
        </View>
     
    </>
  );
};

export default StateandLga;

interface ModaldisplayProps{
    data:string[]
    isStateSelection:boolean
    setstate: (value: string) => void;
    setlga: (value: string) => void;
    setShowOption: (value: boolean) => void;
}
 export const Modaldisplay=({data,isStateSelection,setlga,setstate,setShowOption}:ModaldisplayProps)=>{
     const { theme } = useTheme();
      const { primaryColor, backgroundColor, backgroundColortwo, secondaryTextColor } = getColors(theme);
      const handleSelection = (item: string) => {
        if (isStateSelection) {
          setstate(item);
          setlga(""); // Reset LGA when state changes
        } else {
          setlga(item);
        }
        setShowOption(false);
      };
    return(
        <>
            
        <View className="h-full w-full  absolute z-50 items-center justify-center">
        <Pressable onPress={()=>{setShowOption(false)}} className="opacity-70 bg-black h-full w-full absolute z-50" />
        <View style={{ backgroundColor: backgroundColor }} className="p-3 rounded-2xl absolute z-50 w-full h-[50%]">
            <EmptyView height={10} />
            <ScrollView>
              {data.map((item, index) => (
                <TouchableOpacity key={index} onPress={() => handleSelection(item)} className="w-full h-10">
                  <ThemeText size={Textstyles.text_xsma}>{item}</ThemeText>
                  <Divider />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

        </View>
       
        </>
    )
}
