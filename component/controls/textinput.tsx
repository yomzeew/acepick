import { View, TextInput } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { getColors } from '../../static/color';

const InputComponent = ({ color, placeholder, placeholdercolor }: { color: string, placeholder: string, placeholdercolor:string }) => {
  const { theme } = useTheme(); // Theme state and toggle function
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  return (
  <View
       style={{ borderColor: color }}
       className="w-full h-16 border rounded-lg flex-row items-center px-4"
     >
       <TextInput
         placeholder={placeholder}
         placeholderTextColor={placeholdercolor}
         style={{ flex: 1, color:secondaryTextColor}}
         className="text-base"
       />
       </View>
  );
};

export default InputComponent;
