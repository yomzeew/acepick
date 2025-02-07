import { View, Text} from "react-native";
import Check from "../assets/check.svg"
import EmptyView from "./emptyview";
import { Textstyles } from "../static/textFontsize";
import { ThemeTextsecond } from "./ThemeText";
const VerifyComponent = ({ text, textcolor,subtitle="" }: {text: string; textcolor: string; subtitle?:string}) => {
  return (
    <View className="w-full justify-center items-center">
      <View>
        <Check/>
        <EmptyView />
      </View>
      <View className="w-2/3">
        <Text
          className="font-semibold text-center mb-4"
          style={[
            Textstyles.text_small,
            {
              color: textcolor,
              flexWrap: "wrap",   // 🔑 Allows text wrapping
              textAlign: "center" // 🔑 Centers wrapped text
            }
          ]}
        >
          {text}
        </Text>
        <EmptyView height={10} />
        <ThemeTextsecond size={Textstyles.text_xsma}>
          {subtitle}
        </ThemeTextsecond>
      </View>
       
    </View>
  );
};

export default VerifyComponent;

