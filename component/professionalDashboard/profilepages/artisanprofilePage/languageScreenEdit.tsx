import { useMutation } from "@tanstack/react-query";
import { useToast } from "context/ToastContext";
import Checkbox from "component/controls/checkbox";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import EmptyView from "component/emptyview";
import HeaderComponent from "component/headerComp";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { useTheme } from "hooks/useTheme";
import { useState, useMemo, useEffect } from "react";
import { TouchableOpacity, View, TextInput, ScrollView, Text } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { updateProfessionalProfileFn } from "services/userService";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import { FontAwesome5 } from "@expo/vector-icons";

const ALL_LANGUAGES = [
  "English", "Yoruba", "Hausa", "Igbo", "French", "Spanish",
  "German", "Chinese", "Arabic", "Portuguese", "Pidgin", "Fulfulde",
  "Kanuri", "Tiv", "Ibibio", "Edo", "Efik", "Italian", "Japanese",
  "Korean", "Hindi", "Swahili",
];

const LanguageScreenEdit = () => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor, selectioncardColor, borderColor, backgroundColor } = getColors(theme);
  const professional = useSelector((state: RootState) => state.auth.user?.profile?.professional);

  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);

  useEffect(() => {
    if (professional?.language) {
      const saved = professional.language
        .split(",")
        .map((l: string) => l.trim())
        .filter(Boolean);
      setSelectedLangs(saved);
    }
  }, [professional]);

  const filteredLanguages = useMemo(() => {
    if (!searchQuery) return ALL_LANGUAGES;
    return ALL_LANGUAGES.filter((l) =>
      l.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const toggleLanguage = (name: string) => {
    setSelectedLangs((prev) =>
      prev.includes(name) ? prev.filter((l) => l !== name) : [...prev, name]
    );
  };

  const handleClearAll = () => setSelectedLangs([]);
  const handleSelectAll = () => setSelectedLangs([...ALL_LANGUAGES]);

  const mutation = useMutation({
    mutationFn: updateProfessionalProfileFn,
    onSuccess: () => {
      toast.success("Languages updated successfully.");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? "Update failed";
      toast.error(msg);
    },
  });

  const handleSave = () => {
    if (selectedLangs.length === 0) {
      toast.error("Please select at least one language.");
      return;
    }
    mutation.mutate({ language: selectedLangs.join(", ") });
  };

  return (
    <>
      <ContainerTemplate>
        <View className="h-full w-full flex-col">
          <HeaderComponent title={"Languages Spoken"} />
          <EmptyView height={20} />

          <View className="items-center mb-6">
            <View className="w-12 h-12 rounded-full items-center justify-center mb-3" style={{ backgroundColor: primaryColor + "20" }}>
              <FontAwesome5 name="globe" size={20} color={primaryColor} />
            </View>
            <ThemeText size={Textstyles.text_small}>Select Languages</ThemeText>
            <View className="items-center mt-1">
              <ThemeTextsecond size={Textstyles.text_c}>
                Choose all languages you speak fluently
              </ThemeTextsecond>
            </View>
          </View>

          <View className="px-4 mb-4">
            <View style={{ backgroundColor: selectioncardColor, borderRadius: 12, padding: 12 }}>
              <View className="flex-row items-center">
                <FontAwesome5 name="search" size={16} color={secondaryTextColor} />
                <TextInput
                  className="flex-1 ml-2"
                  placeholder="Search languages..."
                  placeholderTextColor={secondaryTextColor}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{ color: secondaryTextColor }}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <FontAwesome5 name="times" size={16} color={secondaryTextColor} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <View className="w-full px-4 flex-row justify-between mb-2">
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <FontAwesome5 name="check-square" size={14} color={primaryColor} />
              <ThemeTextsecond size={Textstyles.text_c}>
                {selectedLangs.length} selected
              </ThemeTextsecond>
            </View>
            <View className="flex-row gap-x-3">
              <TouchableOpacity onPress={handleClearAll}>
                <Text style={[Textstyles.text_c, { color: primaryColor }]}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSelectAll}>
                <Text style={[Textstyles.text_c, { color: primaryColor }]}>Select All</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            <View className="space-y-3">
              {filteredLanguages.map((langName) => {
                const isChecked = selectedLangs.includes(langName);
                return (
                  <TouchableOpacity
                    key={langName}
                    onPress={() => toggleLanguage(langName)}
                    style={{
                      borderColor: isChecked ? primaryColor : borderColor,
                      backgroundColor: isChecked ? selectioncardColor : "transparent",
                    }}
                    className="w-full h-14 border rounded-xl flex-row justify-between items-center px-4"
                  >
                    <View className="flex-row items-center gap-x-3">
                      <Checkbox isChecked={isChecked} onToggle={() => toggleLanguage(langName)} />
                      <ThemeTextsecond size={Textstyles.text_xsmall}>{langName}</ThemeTextsecond>
                    </View>
                    {isChecked && <FontAwesome5 name="check-circle" size={20} color={primaryColor} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {filteredLanguages.length === 0 && (
              <View className="items-center" style={{ paddingVertical: 64 }}>
                <FontAwesome5 name="search" size={48} color={secondaryTextColor} />
                <View style={{ marginTop: 16 }}>
                  <Text style={[Textstyles.text_xsmall, { color: secondaryTextColor, textAlign: 'center' }]}>No languages found</Text>
                </View>
                <View style={{ marginTop: 4 }}>
                  <ThemeTextsecond size={Textstyles.text_c}>
                    Try adjusting your search terms
                  </ThemeTextsecond>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <TouchableOpacity
              className="w-full rounded-xl items-center justify-center"
              style={{ backgroundColor: mutation.isPending ? primaryColor + '80' : primaryColor, height: 48 }}
              onPress={handleSave}
              disabled={mutation.isPending}
            >
              <Text style={[Textstyles.text_xsmall, { color: "#ffffff", fontWeight: '600' }]}>
                {mutation.isPending ? "Saving..." : `Save Languages (${selectedLangs.length})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ContainerTemplate>
    </>
  );
};

export default LanguageScreenEdit;
