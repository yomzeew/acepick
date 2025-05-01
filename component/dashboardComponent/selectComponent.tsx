import { AntDesign } from "@expo/vector-icons"
import Divider from "component/divider"
import EmptyView from "component/emptyview"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useTheme } from "hooks/useTheme"
import { useState } from "react"
import { Text } from "react-native"
import {TouchableOpacity,View,ScrollView } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"
import { Modal } from "react-native"
interface SelectComponentProp{
    title:string
    width: number|`${number}%`
    data:string[]
    setValue:(value:string)=>void
    value:string
    height?:any
}
const SelectComponent = ({ title, width = "100%", data, setValue, value, height = "auto" }: SelectComponentProp) => {
    const { theme } = useTheme();
    const { primaryColor, backgroundColor, backgroundColortwo, secondaryTextColor } = getColors(theme);
    const [showOption, setShowOption] = useState<boolean>(false);
  
    return (
      <View style={{ width: width }} className="relative">
        <TouchableOpacity
          onPress={() => setShowOption(true)}
          className="w-full h-16  rounded-lg   flex-row items-center justify-between px-3"
          style={{borderColor:primaryColor,borderWidth:1}}
        >
          <ThemeTextsecond size={Textstyles.text_xsma}>
            {value === "" ? title : value}
          </ThemeTextsecond>
          <AntDesign name="down" size={16} color={secondaryTextColor} />
        </TouchableOpacity>
  
        {/* Show dropdown in a modal */}
        <Modal visible={showOption} transparent animationType="fade">
          <TouchableOpacity
            onPress={() => setShowOption(false)}
            style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" }}
          >
            <View style={{ width: "80%", backgroundColor: backgroundColor, borderRadius: 10, padding: 10 }}>
              <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                {data.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setValue(item);
                      setShowOption(false);
                    }}
                    className="w-full h-10 justify-center"
                  >
                    <ThemeText size={Textstyles.text_xsma}>{item}</ThemeText>
                    <Divider />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };
export default SelectComponent