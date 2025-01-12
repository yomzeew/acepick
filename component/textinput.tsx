import { View, TextInput } from 'react-native';

const InputComponent = ({ color, placeholder, placeholdercolor }: { color: string, placeholder: string, placeholdercolor:string }) => {
  return (
  <View
       style={{ borderColor: color }}
       className="w-11/12 h-16 border rounded-lg flex-row items-center px-4"
     >
       <TextInput
         placeholder={placeholder}
         placeholderTextColor={placeholdercolor}
         style={{ flex: 1 }}
         className="text-base"
       />
       </View>
  );
};

export default InputComponent;
