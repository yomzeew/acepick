import { TouchableOpacity, View,Text,StyleSheet } from "react-native";
import { Textstyles } from "static/textFontsize";
interface CustomRadioButtonProps{
    label?:string
    selected:boolean
    onPress:()=>void
}
const CustomRadioButton = ({ label, selected, onPress }:CustomRadioButtonProps) => {
    return (
      <TouchableOpacity style={styles.radioContainer} onPress={onPress}>
        <View style={[styles.radioButton, selected && styles.radioSelected]} />
        <Text style={[Textstyles.text_cmedium,{color:"white"}]}>{label}</Text>
      </TouchableOpacity>
    );
  };
  export default CustomRadioButton

  const styles = StyleSheet.create({
    radioContainer: { flexDirection: "row", alignItems: "center", marginVertical: 5 },
    radioButton: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#007BFF", marginRight: 10 },
    radioSelected: { backgroundColor: "#007BFF" },
    
  });
  