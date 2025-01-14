import { View, Text} from "react-native";
import Check from "../assets/check.svg"
import EmptyView from "./emptyview";
import { Textstyles } from "../static/textFontsize";
const VerifyComponent = ({ text, textcolor }: {text: string; textcolor: string; }) => {
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
      </View>
       
    </View>
  );
};

export default VerifyComponent;

