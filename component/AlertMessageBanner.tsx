import { View, Text } from "react-native";
import { ErrorAlertModal } from "component/errorAlertModal";
import { Textstyles } from "static/textFontsize";

type AlertMessageBannerProps = {
  type: "success" | "error";
  message: string;
};

export const AlertMessageBanner = ({ type, message }: AlertMessageBannerProps) => {
  const bgColor = type === "success" ? "green" : "red";
  const title = type === "success" ? "Success" : "Error";

  return (
    <View className="absolute z-50 h-32 w-full top-0">
      <ErrorAlertModal bg={bgColor}>
        <Text style={[Textstyles.text_cmedium, { color: "#ffffff" }]}>{title}</Text>
        <Text style={[Textstyles.text_xsmall, { color: "#ffffff" }]}>{message}</Text>
      </ErrorAlertModal>
    </View>
  );
};
