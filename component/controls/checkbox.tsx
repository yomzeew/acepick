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
    const { primaryColor, borderColor } = getColors(theme);

    return (
        <TouchableOpacity 
            onPress={() => onToggle(!isChecked)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
                width: 22,
                height: 22,
                borderWidth: 2,
                borderColor: isChecked ? primaryColor : borderColor,
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: isChecked ? primaryColor : 'transparent',
            }}
        >
            {isChecked && (
                <View style={{
                    width: 12,
                    height: 6,
                    borderLeftWidth: 2,
                    borderBottomWidth: 2,
                    borderColor: 'white',
                    transform: [{ rotate: '-45deg' }, { translateY: -1 }],
                }} />
            )}
        </TouchableOpacity>
    );
};
export default Checkbox