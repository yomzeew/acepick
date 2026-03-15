import { View, TextInput, ScrollView, TouchableOpacity, Text, Alert } from "react-native"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import { ThemeText } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import { getColors } from "static/color"
import { useTheme } from "hooks/useTheme"
import { useState } from "react"
import ButtonComponent from "component/buttoncomponent"
import InputComponent from "component/controls/textinput"
import Dropdown from "component/controls/dropdown"
import { countries, getStatesForCountry, validateCity } from "utilizes/locationData"

const EditModal = ({ profileData, setProfileData, onSave, loading }: {
  profileData: any,
  setProfileData: (data: any) => void,
  onSave: () => void,
  loading: boolean
}) => {
  const { theme } = useTheme()
  const { primaryColor, selectioncardColor, primaryTextColor,secondaryTextColor } = getColors(theme)

  const genderOptions = [
    { label: "Select Gender", value: "" },
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
    { label: "Prefer not to say", value: "prefer_not_to_say" }
  ]

  const [cityError, setCityError] = useState<string | null>(null)

  const handleChange = (field: string, value: string) => {
    setProfileData({ ...profileData, [field]: value })
    
    // Clear state when country changes
    if (field === 'country') {
      setProfileData((prev: any) => ({ ...prev, state: '', country: value }))
    }
    
    // Validate city
    if (field === 'city') {
      const error = validateCity(value)
      setCityError(error)
    }
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

        <View className="mb-4">
          <Dropdown
            label="Gender"
            placeholder="Select Gender"
            options={genderOptions}
            value={profileData.gender}
            onSelect={(value) => handleChange('gender', value)}
            color={primaryColor}
            placeholdercolor={secondaryTextColor}
          />
        </View>

        <View className="mb-4">
          <Text className="mb-1 text-sm text-gray-500">Date of Birth</Text>
          <InputComponent
            placeholder="YYYY-MM-DD"
            value={profileData.dob}
            onChange={(value) => handleChange('dob', value)}
            color={primaryColor}
            placeholdercolor={secondaryTextColor}
            fieldType="date"
            maxDate={new Date()} // Prevent future dates
          />
        </View>

        {[
          { label: "Address", field: "address" },
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

        <View className="mb-4">
          <Dropdown
            label="Country"
            placeholder="Select Country"
            options={countries}
            value={profileData.country}
            onSelect={(value) => handleChange('country', value)}
            color={primaryColor}
            placeholdercolor={secondaryTextColor}
          />
        </View>

        <View className="mb-4">
          <Dropdown
            label="State"
            placeholder="Select State"
            options={getStatesForCountry(profileData.country || '')}
            value={profileData.state}
            onSelect={(value) => handleChange('state', value)}
            color={primaryColor}
            placeholdercolor={secondaryTextColor}
            disabled={!profileData.country}
          />
        </View>

        <View className="mb-4">
          <Text className="mb-1 text-sm text-gray-500">City</Text>
          <InputComponent
            placeholder="Enter City"
            value={profileData.city}
            onChange={(value) => handleChange('city', value)}
            color={primaryColor}
            placeholdercolor={secondaryTextColor}
          />
          {cityError && (
            <Text style={[Textstyles.text_xxxsmall, { color: '#ef4444' }]} className="mt-1">
              {cityError}
            </Text>
          )}
        </View>

        {[
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
                    keyboardType={field === 'phone' ? 'phone-pad' : 'default'}
            />
          </View>
        ))}

        <ButtonComponent
          onPress={onSave}
          text={loading ? "Saving..." : "Save Changes"}
          textcolor="white"
          color={primaryColor}
          disabled={loading || !!cityError}
        />
      </ScrollView>
    </ContainerTemplate>
  )
}

export default EditModal
