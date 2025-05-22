import { View, Text, TouchableOpacity, ActivityIndicator, ViewStyle } from "react-native";

type ButtonComponentProps = {
  color: string;
  text: string;
  textcolor: string;
  route?: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  customStyle?: ViewStyle;
};

const ButtonComponent = ({
  color,
  text,
  textcolor,
  route = "",
  onPress,
  isLoading = false,
  disabled = false,
  customStyle = {},
}: ButtonComponentProps) => {
  const isDisabled = disabled || isLoading;

  return (
    <View className="w-full justify-center items-center">
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={{
          backgroundColor: color,
          opacity: isDisabled ? 0.6 : 1,
          ...customStyle,
        }}
        className="w-full h-14 rounded-lg justify-center items-center"
      >
        {isLoading ? (
          <ActivityIndicator color={textcolor} />
        ) : (
          <Text
            style={{ color: textcolor }}
            className="text-lg font-bold text-center"
          >
            {text}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ButtonComponent;
