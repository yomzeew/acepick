import Checkbox from "component/controls/checkbox";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import EmptyView from "component/emptyview";
import HeaderComponent from "component/headerComp";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { useTheme } from "hooks/useTheme";
import { useState, useMemo } from "react";
import { TouchableOpacity, View, TextInput, ScrollView, Text } from "react-native";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import { FontAwesome5 } from "@expo/vector-icons";


const LanguageScreenEdit = () => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor, borderColor } = getColors(theme)
    const [searchQuery, setSearchQuery] = useState('')
    const [languages, setLanguages] = useState([
      { name: 'English', checked: false, proficiency: 'fluent' },
      { name: 'Yoruba', checked: false, proficiency: 'fluent' },
      { name: 'Hausa', checked: false, proficiency: 'fluent' },
      { name: 'Igbo', checked: false, proficiency: 'fluent' },
      { name: 'French', checked: false, proficiency: 'basic' },
      { name: 'Spanish', checked: false, proficiency: 'basic' },
      { name: 'German', checked: false, proficiency: 'basic' },
      { name: 'Chinese', checked: false, proficiency: 'basic' },
      { name: 'Arabic', checked: false, proficiency: 'basic' },
      { name: 'Portuguese', checked: false, proficiency: 'basic' },
    ])

    const filteredLanguages = useMemo(() => {
      if (!searchQuery) return languages;
      return languages.filter(language =>
        language.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [languages, searchQuery])
  
    const toggleLanguage = (index: number) => {
      const updatedLanguages = [...languages]
      const actualIndex = languages.findIndex(lang => lang.name === filteredLanguages[index].name)
      updatedLanguages[actualIndex].checked = !updatedLanguages[actualIndex].checked
      setLanguages(updatedLanguages)
    }

    const getSelectedCount = () => {
      return languages.filter(lang => lang.checked).length;
    }

    const handleClearAll = () => {
      setLanguages(languages.map(lang => ({ ...lang, checked: false })))
    }

    const handleSelectAll = () => {
      setLanguages(languages.map(lang => ({ ...lang, checked: true })))
    }
  
    return (
      <>
        <ContainerTemplate>
          <View className="h-full w-full flex-col">
            <HeaderComponent title={"Languages Spoken"} />
            <EmptyView height={20}/>
            
            {/* Search Bar */}
            <View className="w-full px-4">
              <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
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
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <FontAwesome5 name="times" size={16} color={secondaryTextColor} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <EmptyView height={20}/>
            
            {/* Action Buttons */}
            <View className="w-full px-4 flex-row justify-between">
              <ThemeTextsecond size={Textstyles.text_xsmall}>
                {getSelectedCount()} selected
              </ThemeTextsecond>
              <View className="flex-row gap-x-3">
                <TouchableOpacity onPress={handleClearAll}>
                  <Text style={[Textstyles.text_xsmall, { color: primaryColor }]}>
                    Clear All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSelectAll}>
                  <Text style={[Textstyles.text_xsmall, { color: primaryColor }]}>
                    Select All
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <EmptyView height={20}/>
            
            {/* Language List */}
            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
              {filteredLanguages.map((language, index) => (
                <TouchableOpacity
                  key={language.name}
                  onPress={() => toggleLanguage(index)}
                  style={{ 
                    borderColor: language.checked ? primaryColor : borderColor,
                    backgroundColor: language.checked ? selectioncardColor : 'transparent'
                  }}
                  className="w-full h-16 border rounded-xl flex-row justify-between items-center px-4 mb-3"
                >
                  <View className="flex-row items-center gap-x-3">
                    <Checkbox 
                      isChecked={language.checked} 
                      onToggle={() => toggleLanguage(index)} 
                    /> 
                    <View>
                      <ThemeTextsecond size={Textstyles.text_small}>
                        {language.name}
                      </ThemeTextsecond>
                      <Text style={[Textstyles.text_xxxsmall, { color: secondaryTextColor }]}>
                        {language.proficiency}
                      </Text>
                    </View>
                  </View>
                  {language.checked && (
                    <FontAwesome5 name="check-circle" size={20} color={primaryColor} />
                  )}
                </TouchableOpacity>
              ))}
              
              {filteredLanguages.length === 0 && (
                <View className="items-center py-8">
                  <FontAwesome5 name="search" size={40} color={secondaryTextColor} />
                  <Text style={[Textstyles.text_small, { color: secondaryTextColor }]} className="mt-3">
                    No languages found
                  </Text>
                </View>
              )}
            </ScrollView>
            
            {/* Save Button */}
            <View className="px-4 pb-4">
              <TouchableOpacity 
                className="w-full h-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: primaryColor }}
                onPress={() => console.log('Save languages:', languages.filter(l => l.checked))}
              >
                <Text style={[Textstyles.text_medium, { color: '#ffffff' }]}>
                  Save Languages ({getSelectedCount()})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ContainerTemplate>
      </>
    )
  }

export default LanguageScreenEdit;
