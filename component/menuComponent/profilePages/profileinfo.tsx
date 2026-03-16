import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  Alert
} from "react-native"
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import Divider from "component/divider"
import ButtonFunction from "component/buttonfunction"
import EmptyView from "component/emptyview"
import { useState } from "react"
import SliderModalTemplate from "component/slideupModalTemplate"
import VerificationComponent from "./verificationcomp"
import SliderModal from "component/SlideUpModal"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import * as ImagePicker from "expo-image-picker"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import ButtonComponent from "component/buttoncomponent"
import EditModal from "./editprofileModal"
import { AlertMessageBanner } from "component/AlertMessageBanner"
import { useEffect } from "react"

const Profileinfo = () => {
  const { theme } = useTheme()
  const { primaryColor, primaryTextColor, selectioncardColor } = getColors(theme)

  const [showmodal, setshowmodal] = useState(false)
  const [showmodaltwo, setshowmodaltwo] = useState(false)
  const [showmodalVerify, setshowmodalVerify] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Auto-clear messages after 4 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const user = useSelector((state: RootState) => state.auth.user)
  const avatar = user?.profile.avatar || ""
  const firstName = user?.profile.firstName || ""

  const [avatarUri, setAvatarUri] = useState<string>(avatar)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState({
    firstName: user?.profile.firstName,
    lastName: user?.profile.lastName || "",
    gender: "", // Gender not in profile type, using empty string as default
    dob: user?.profile.birthDate || "",
    address: user?.location?.address || "",
    city: user?.location?.lga || "", // Use lga for city
    state: user?.location?.state || "",
    country: "", // Country not in location type, using empty string as default
    phone: user?.phone,
    email: user?.email || "",
  })

  const pickAvatar = async () => {
    try {
      setAvatarError(null)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8, // Slightly reduce quality for faster upload
      })
      
      if (!result.canceled && result.assets[0]) {
        // Validate image size (max 5MB)
        const response = await fetch(result.assets[0].uri)
        const blob = await response.blob()
        const sizeInMB = blob.size / (1024 * 1024)
        
        if (sizeInMB > 5) {
          setAvatarError("Image size must be less than 5MB")
          return
        }
        
        setAvatarUri(result.assets[0].uri)
        setSuccessMessage("Profile picture selected. Click 'Save Changes' to update.")
      }
    } catch (error) {
      setAvatarError("Failed to select image. Please try again.")
      console.error("Image picker error:", error)
    }
  }

  const uploadMutation = useMutation({
    mutationFn: async (uri: string) => {
      setIsUploadingAvatar(true)
      setAvatarError(null)
      
      const formData = new FormData()
      formData.append("file", {
        uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as any)
      
      const res = await axios.post("/api/upload/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000, // 30 second timeout
      })
      
      return res.data.url
    },
    onSuccess: (url) => {
      setIsUploadingAvatar(false)
      setAvatarUri(url) // Update the avatar URI immediately
      setSuccessMessage("Profile picture uploaded successfully!")
      
      // Update profile data to reflect the new avatar
      setProfileData(prev => ({ ...prev, avatar: url }))
    },
    onError: (error: any) => {
      setIsUploadingAvatar(false)
      let msg = "Failed to upload profile picture"
      if (error?.response?.data?.message) {
        msg = error.response.data.message
      } else if (error?.message) {
        msg = error.message
      } else if (error?.code === 'ECONNABORTED') {
        msg = "Upload timed out. Please try again."
      }
      setAvatarError(msg)
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.put("/api/user/profile", data)
      return res.data
    },
    onError: (error: any) => {
      let msg = "Failed to update profile"
      if (error?.response?.data?.message) {
        msg = error.response.data.message
      } else if (error?.message) {
        msg = error.message
      } else if (error?.response?.status === 400) {
        msg = "Invalid profile data. Please check your inputs."
      } else if (error?.response?.status === 401) {
        msg = "You are not authorized to update this profile."
      } else if (error?.response?.status >= 500) {
        msg = "Server error. Please try again later."
      }
      setErrorMessage(msg)
    },
  })

  const handleSubmit = async () => {
    setErrorMessage(null)
    setSuccessMessage(null)
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'phone', 'email']
    const missingFields = requiredFields.filter(field => !profileData[field as keyof typeof profileData])
    
    if (missingFields.length > 0) {
      setErrorMessage(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profileData.email)) {
      setErrorMessage('Please enter a valid email address')
      return
    }
    
    // Validate phone format (basic validation)
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    if (!phoneRegex.test(profileData.phone || '')) {
      setErrorMessage('Please enter a valid phone number')
      return
    }
    
    try {
      let uploadedAvatar = avatarUri
      if (avatarUri !== avatar) {
        uploadedAvatar = await uploadMutation.mutateAsync(avatarUri)
      }
      await updateProfileMutation.mutateAsync({
        ...profileData,
        avatar: uploadedAvatar,
      })
      setSuccessMessage("Profile updated successfully!")
      setshowmodaltwo(false) // Close modal on success
      
      // Optional: Refresh user data in Redux store
      // This would typically be handled by a refetch or socket update
    } catch (error: any) {
      // Error is handled by mutation onError
      console.error("Profile update failed:", error)
    }
  }

  const hasUnsavedChanges = avatarUri !== avatar || 
    Object.keys(profileData).some(key => {
      const currentValue = profileData[key as keyof typeof profileData]
      const originalValue = key === 'firstName' ? user?.profile.firstName :
                           key === 'lastName' ? user?.profile.lastName :
                           key === 'phone' ? user?.phone :
                           key === 'email' ? user?.email :
                           key === 'address' ? user?.location?.address :
                           key === 'city' ? user?.location?.lga :
                           key === 'state' ? user?.location?.state :
                           key === 'dob' ? user?.profile.birthDate : ''
      return currentValue !== originalValue
    })

  const loading = uploadMutation.isPending || updateProfileMutation.isPending || isUploadingAvatar

  const handleshowModal=()=>{
    setshowmodaltwo(true)

  }

  return (
    <>
      {successMessage && (
        <AlertMessageBanner type="success" message={successMessage} />
      )}
      {errorMessage && (
        <AlertMessageBanner type="error" message={errorMessage} />
      )}
      {avatarError && (
        <AlertMessageBanner type="error" message={avatarError} />
      )}
        <SliderModalTemplate showmodal={showmodal} setshowmodal={setshowmodal} modalHeight={"85%"}>
          <VerificationComponent
            setshowmodalVerify={(text: boolean) => setshowmodalVerify(text)}
            setshowmodal={(text: boolean) => setshowmodal(text)}
          />
        </SliderModalTemplate>

        <SliderModalTemplate showmodal={showmodaltwo} setshowmodal={setshowmodaltwo} modalHeight={"85%"}>
         <EditModal 
         profileData={profileData} 
         setProfileData={setProfileData} 
         onSave={handleSubmit} 
         loading={loading}
         />
        </SliderModalTemplate>
      {showmodalVerify && (
        <SliderModal
          route="/profilelayout"
          title="Successfull"
          setshowmodal={setshowmodalVerify}
          showmodal={showmodalVerify}
          textbutton="Back to Profile"
          subtitle="We will update your profile after proper verification"
        />
      )}

      <ContainerTemplate>
        <>
          <HeaderComponent title="Edit Personal Information" />
          <View className="px-3 h-32 mt-10">
            <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full h-full rounded-2xl px-5 pb-5">
              <View className="items-center">
                <ThemeText size={Textstyles.text_medium} className="font-extralight text-white mt-8">
                  {firstName}'s Profile
                </ThemeText>
              </View>
            </View>

            <View className="items-center w-full -mt-12">
              <View className="relative">
                <TouchableOpacity 
                  onPress={pickAvatar} 
                  disabled={loading}
                  className={`absolute right-0 bottom-0 z-40 bg-white w-8 h-8 rounded-full flex justify-center items-center shadow-md ${loading ? 'opacity-50' : ''}`}
                >
                  {isUploadingAvatar ? (
                    <ActivityIndicator size="small" color={primaryColor} />
                  ) : (
                    <FontAwesome size={16} color={primaryColor} name="pencil" />
                  )}
                </TouchableOpacity>
                <View className="h-24 w-24 rounded-full overflow-hidden bg-slate-300 items-center justify-center">
                  {isUploadingAvatar ? (
                    <View className="flex-1 justify-center items-center">
                      <ActivityIndicator size="large" color={primaryColor} />
                      <Text className="text-xs text-gray-600 mt-1">Uploading...</Text>
                    </View>
                  ) : avatarUri ? (
                    <Image source={{ uri: avatarUri }} className="w-full h-full" />
                  ) : (
                    <FontAwesome5 name="camera" size={20} color={primaryColor} />
                  )}
                </View>
                {avatarUri !== avatar && !isUploadingAvatar && (
                  <View className="absolute -top-2 -right-2 bg-green-500 w-6 h-6 rounded-full items-center justify-center">
                    <FontAwesome name="check" size={12} color="white" />
                  </View>
                )}
              </View>
            </View>
          </View>

          <ScrollView className="flex-1 px-3 mt-16 w-full" showsVerticalScrollIndicator={false}>
            <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full rounded-2xl px-5 pb-5 mb-8">
              <View className="mt-5">
                <View className="flex-row justify-between mb-3">
                  <ThemeText size={Textstyles.text_medium} className="font-bold">
                    Biodata
                  </ThemeText>
                  <TouchableOpacity onPress={handleshowModal}>
                  <FontAwesome size={18} color={primaryColor} name="pencil" />
                  </TouchableOpacity>
                </View>

                {[
                  { label: "Lastname", value: profileData.lastName },
                  { label: "Firstname", value: profileData.firstName },
                  { label: "Gender", value: profileData.gender },
                  { label: "Date of Birth", value: profileData.dob },
                  { label: "Address", value: profileData.address },
                  { label: "City", value: profileData.city },
                  { label: "State", value: profileData.state },
                  { label: "Country", value: profileData.country },
                  { label: "Phone", value: profileData.phone },
                  { label: "Email", value: profileData.email },
                ].map((item, index) => (
                  <View key={index}>
                    <View className="flex-row justify-between mt-3">
                      <ThemeTextsecond size={Textstyles.text_xsmall}>{item.label}:</ThemeTextsecond>
                      <ThemeTextsecond size={Textstyles.text_xsmall}>{item.value}</ThemeTextsecond>
                    </View>
                    <Divider />
                  </View>
                ))}
              </View>
            </View>

            {/* <ButtonComponent
              onPress={handleSubmit}
              text={loading ? "Updating..." : "Update Profile"}
              textcolor="white"
              color={primaryColor}
              disabled={loading}
            /> */}
            <EmptyView height={20} />
            <ButtonComponent
              onPress={() => setshowmodal(true)}
              text="Proceed to Verification"
              textcolor="white"
              color={primaryColor}
            />
          </ScrollView>
        </>
      </ContainerTemplate>
    </>
  )
}

export default Profileinfo

