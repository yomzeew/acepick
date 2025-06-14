import { View, TextInput, ScrollView, TouchableOpacity, Text, Alert } from "react-native"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import { ThemeText } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import { getColors } from "static/color"
import { useTheme } from "hooks/useTheme"
import { useState } from "react"
import ButtonComponent from "component/buttoncomponent"
import InputComponent from "component/controls/textinput"

const EditModal = ({ profileData, setProfileData, onSave, loading }: {
  profileData: any,
  setProfileData: (data: any) => void,
  onSave: () => void,
  loading: boolean
}) => {
  const { theme } = useTheme()
  const { primaryColor, selectioncardColor, primaryTextColor,secondaryTextColor } = getColors(theme)

  const handleChange = (field: string, value: string) => {
    setProfileData({ ...profileData, [field]: value })
  }

  return (
    <ContainerTemplate>
      <ScrollView showsVerticalScrollIndicator={false} className="px-4 pt-6 pb-12">
        <ThemeText size={Textstyles.text_cmedium} className="mb-4 font-semibold text-center">
          Edit Profile Details
        </ThemeText>

        {[
          { label: "First Name", field: "firstName" },
          { label: "Last Name", field: "lastName" },
          { label: "Gender", field: "gender" },
          { label: "Date of Birth", field: "dob" },
          { label: "Address", field: "address" },
          { label: "City", field: "city" },
          { label: "State", field: "state" },
          { label: "Country", field: "country" },
          { label: "Phone", field: "phone" },
          { label: "Email", field: "email" }
        ].map(({ label, field }, idx) => (
          <View key={idx} className="mb-4">
            <Text className="mb-1 text-sm text-gray-500">{label}</Text>
            <InputComponent
                    placeholder={label}
                    value={profileData[field]}
                    onChange={(value) => handleChange(field, value)} 
                    color={primaryColor} 
                    placeholdercolor={secondaryTextColor}
            />
          </View>
        ))}

        <ButtonComponent
          onPress={onSave}
          text={loading ? "Saving..." : "Save Changes"}
          textcolor="white"
          color={primaryColor}
          disabled={loading}
        />
      </ScrollView>
    </ContainerTemplate>
  )
}

export default EditModal
