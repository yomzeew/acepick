import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import EmptyView from "component/emptyview";
import HeaderComponent from "component/headerComp";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { useTheme } from "hooks/useTheme";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";

// Custom Checkbox Component
interface CheckboxProps {
    isChecked: boolean;
    onToggle: (value: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ isChecked, onToggle }) => {
    const { theme } = useTheme();
    const { primaryColor } = getColors(theme);

    return (
        <TouchableOpacity 
            onPress={() => onToggle(!isChecked)}
            activeOpacity={0.7}
            style={{
                width: 20,
                height: 20,
                borderWidth: 2,
                borderColor: primaryColor,
                borderRadius: 4,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: isChecked ? primaryColor : 'transparent',
            }}
        >
            {isChecked && (
                <View style={{
                    width: 12,
                    height: 12,
                    backgroundColor: 'white',
                    borderRadius: 2,
                }} />
            )}
        </TouchableOpacity>
    );
};
export default Checkbox