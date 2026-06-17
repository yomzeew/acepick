import { useState, useEffect } from "react";
import { View, TextInput, KeyboardTypeOptions, TouchableOpacity, Modal, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { ReactNode } from "react";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { Button } from "react-native";
import { Textstyles } from "static/textFontsize";

interface InputComponentProps {
    color: string;
    placeholder: string;
    placeholdercolor: string;
    onChange?: (text: any) => void;
    multiline?: boolean;
    prefix?: boolean;
    icon?: ReactNode;
    keyboardType?: KeyboardTypeOptions;
    fieldType?: "text" | "date";
    value?: string | number | Date;
    editable?:boolean
    maxLength?:number
    maxDate?: Date;
    error?: boolean;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const InputComponent = ({
  color,
  placeholder,
  placeholdercolor,
  onChange,
  value,
  multiline = false,
  prefix = false,
  icon,
  keyboardType,
  fieldType = "text", // Default to normal input
  editable,
  maxLength,
  maxDate,
  error,
  autoCapitalize
}: InputComponentProps) => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor, backgroundColor } = getColors(theme);
  // Parse the value prop into a Date, fallback to today for the picker
  const parseDate = (val: any): Date | null => {
    if (!val) return null;
    const str = String(val);
    if (!str.trim()) return null;
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const initialDate = parseDate(value);
  const [date, setDate] = useState<Date>(initialDate ?? new Date());
  const [hasValue, setHasValue] = useState<boolean>(!!initialDate);
  const [showModal, setShowModal] = useState(false);

  // Sync when value prop changes externally (e.g. editing existing record)
  useEffect(() => {
    const parsed = parseDate(value);
    if (parsed) {
      setDate(parsed);
      setHasValue(true);
    } else {
      setHasValue(false);
    }
  }, [value]);

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      if (maxDate && selectedDate > maxDate) {
        return;
      }
      setDate(selectedDate);
      setHasValue(true);
      onChange?.(selectedDate.toISOString().split("T")[0]);
    }
  };

  return (
    <View style={{ borderColor: error ? "red" : color }} className="w-full h-16 border rounded-lg flex-row items-center px-4">
      {prefix && (
        <View
          style={{ backgroundColor: primaryColor }}
          className="px-2 py-3 h-16 w-12 rounded-l-lg absolute z-50 items-center justify-center"
        >
          {icon}
        </View>
      )}

      {/* Handle Date Picker */}
      {fieldType === "date" ? (
        <TouchableOpacity onPress={() => setShowModal(true)} className="flex-1 px-12">
          {hasValue ? (
            <ThemeTextsecond size={Textstyles.text_xsmall}>
              {date.toISOString().split("T")[0]}
            </ThemeTextsecond>
          ) : (
            <ThemeTextsecond size={Textstyles.text_xsmall}>
              {placeholder}
            </ThemeTextsecond>
          )}
        </TouchableOpacity>
      ) : (
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={placeholdercolor}
          style={{ flex: 1, color: secondaryTextColor }}
          className={`${prefix ? "px-12" : ""} text-base`}
          onChangeText={onChange}
          multiline={multiline}
          keyboardType={keyboardType}
          value={String(value)}
          editable={editable}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
        />
      )}

      {/* Date Picker Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
          <View style={{ width: "100%", backgroundColor, padding: 20, borderRadius: 10 }}>
            <ThemeTextsecond size={Textstyles.text_small}>Select Date</ThemeTextsecond>
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              maximumDate={maxDate}
            />
            <View className="items-center">
            <TouchableOpacity onPress={() => setShowModal(false)} >
              <ThemeText size={Textstyles.text_cmedium}>Done</ThemeText>
            </TouchableOpacity>
            </View>
      
          
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default InputComponent;




export const InputComponentTextarea = ({
  color,
  placeholder,
  placeholdercolor,
  onChange,
  multiline = false,
  value

}: {
  color: string;
  placeholder: string;
  placeholdercolor: string;
  onChange?: (text: string) => void;
  multiline?: boolean;
  value?:string
}) => {
  const { theme } = useTheme(); // Theme state and toggle function
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);

  return (
    <View
      style={{ borderColor: color }}
      className={`w-full border rounded-lg px-4 ${multiline ? "h-32" : "h-16"}`}
    >

      <TextInput
        placeholder={placeholder}
        placeholderTextColor={placeholdercolor}
        style={{
          flex: 1,
          color: secondaryTextColor,
          textAlignVertical: multiline ? "top" : "center", // Align text correctly
        }}
        className="text-base py-2"
        onChangeText={onChange} // Fixed `onChange` to `onChangeText`
        multiline={multiline}
        value={value}
      />
    </View>
  );
};
