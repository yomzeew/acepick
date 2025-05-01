import Checkbox from "component/controls/checkbox";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import EmptyView from "component/emptyview";
import HeaderComponent from "component/headerComp";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { useTheme } from "hooks/useTheme";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";


const LanguageScreenEdit = () => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme)
    const [languages, setLanguages] = useState([
      { name: 'English', checked: false },
      { name: 'Yoruba', checked: false },
      { name: 'Hausa', checked: false },
      { name: 'Igbo', checked: false },
      // Add more languages as needed
    ])
  
    const toggleLanguage = (index:number) => {
      const updatedLanguages = [...languages]
      updatedLanguages[index].checked = !updatedLanguages[index].checked
      setLanguages(updatedLanguages)
    }
  
    return (
      <>
        <ContainerTemplate>
          <View className="h-full w-full flex-col">
            <HeaderComponent title={"Language Spoken"} />
            <EmptyView height={40}/>
            <View className="w-full items-start px-4">
              <ThemeText size={Textstyles.text_xsmall}>
                Select Languages
              </ThemeText>
            </View>
            <EmptyView height={20}/>
            
            <View className="w-full px-4">
              {languages.map((language, index) => (
                <View 
                  key={index}
                  style={{ borderColor: primaryColor }} 
                  className="w-full h-16 border rounded-xl flex-row gap-x-3 justify-start items-center px-4 mb-3"
                >
                  <Checkbox 
                    isChecked={language.checked} 
                    onToggle={() => toggleLanguage(index)} 
                  /> 
                  <ThemeTextsecond size={Textstyles.text_xsmall}>
                    {language.name}
                  </ThemeTextsecond>
                </View>
              ))}
            </View>
          </View>
        </ContainerTemplate>
      </>
    )
  }

export default LanguageScreenEdit;
