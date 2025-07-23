import { AntDesign } from "@expo/vector-icons";
import Divider from "component/divider";
import EmptyView from "component/emptyview";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { useTheme } from "hooks/useTheme";
import { useState } from "react";
import {
  TextInput,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";

interface SelectComponentProp {
  title: string;
  width: number | `${number}%`;
  data: string[];
  setValue: (value: string) => void;
  value: string;
  height?: any;
}

const SearchableSelectComponent = ({
  title,
  width = "100%",
  data,
  setValue,
  value,
  height = "auto",
}: SelectComponentProp) => {
  const { theme } = useTheme();
  const {
    primaryColor,
    backgroundColor,
    backgroundColortwo,
    secondaryTextColor,
  } = getColors(theme);

  const [showOption, setShowOption] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");

  const filteredData = data.filter((item) =>
    item.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={{ width:"100%" }} className="relative">
      <TouchableOpacity
        onPress={() => setShowOption(true)}
        className="w-full h-16 rounded-lg flex-row items-center justify-between px-3"
        style={{ borderColor: primaryColor, borderWidth: 1 }}
      >
        <ThemeTextsecond size={Textstyles.text_xsma}>
          {value === "" ? title : value}
        </ThemeTextsecond>
        <AntDesign name="down" size={16} color={secondaryTextColor} />
      </TouchableOpacity>

      {/* Modal dropdown */}
      <Modal visible={showOption} transparent animationType="fade">
        <TouchableOpacity
          onPress={() => setShowOption(false)}
          activeOpacity={1}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <View
            style={{
              width: "85%",
              backgroundColor: backgroundColor,
              borderRadius: 10,
              padding: 10,
            }}
          >
            {/* Search Box */}
            <TextInput
              placeholder="Search..."
              placeholderTextColor={primaryColor}
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
              className="w-full px-4 py-2 rounded-md mb-3 border border-gray-300 text-base"
              style={{ backgroundColor: backgroundColortwo, color:primaryColor }}
            />

            <ScrollView style={{ maxHeight: 250 }} showsVerticalScrollIndicator={false}>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setValue(item);
                      setShowOption(false);
                      setSearchText("");
                    }}
                    className="w-full h-10 justify-center"
                  >
                    <ThemeText size={Textstyles.text_xsma}>{item}</ThemeText>
                    <Divider />
                  </TouchableOpacity>
                ))
              ) : (
                <Text className="text-center text-gray-500 mt-2">
                  No result found
                </Text>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default SearchableSelectComponent;
