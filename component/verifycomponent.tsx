import { View, Text} from "react-native";
import Check from "../assets/check.svg"
import EmptyView from "./emptyview";
const VerifyComponent = ({ text, textcolor }: {text: string; textcolor: string; }) => {
  return (
    <View className="w-full justify-center items-center">
      <View>
        <Check/>
        <EmptyView />
      </View>
      <Text className="text-2xl font-semibold text-center mb-4" style={{ color: textcolor }}>
        {text}
      </Text>
    </View>
  );
};

export default VerifyComponent;

