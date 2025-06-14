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

const Profileinfo = () => {
  const { theme } = useTheme()
  const { primaryColor, primaryTextColor, selectioncardColor } = getColors(theme)

  const [showmodal, setshowmodal] = useState(false)
  const [showmodaltwo, setshowmodaltwo] = useState(false)
  const [showmodalVerify, setshowmodalVerify] = useState(false)

  const user = useSelector((state: RootState) => state.auth.user)
  const avatar = user?.profile.avatar || ""
  const firstName = user?.profile.firstName || ""

  const [avatarUri, setAvatarUri] = useState<string>(avatar)
  const [profileData, setProfileData] = useState({
    firstName: user?.profile.firstName,
    lastName: user?.profile.lastName || "",
    gender:  "",
    dob: user?.profile.birthDate || "",
    address: user?.location.address || "",
    city: user?.location.lga|| "",
    state: user?.location.state || "",
    country:"",
    phone:user?.phone,
    email: user?.email || "",
  })

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri)
    }
  }

  const uploadMutation = useMutation({
    mutationFn: async (uri: string) => {
      const formData = new FormData()
      formData.append("file", {
        uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as any)
      const res = await axios.post("/api/upload/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return res.data.url
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.put("/api/user/profile", data)
      return res.data
    },
  })

  const handleSubmit = async () => {
    try {
      let uploadedAvatar = avatarUri
      if (avatarUri !== avatar) {
        uploadedAvatar = await uploadMutation.mutateAsync(avatarUri)
      }
      await updateProfileMutation.mutateAsync({
        ...profileData,
        avatar: uploadedAvatar,
      })
      Alert.alert("Success", "Profile updated successfully!")
    } catch (error: any) {
      Alert.alert("Error", "Failed to update profile")
    }
  }

  const loading = uploadMutation.isPending || updateProfileMutation.isPending

  const handleshowModal=()=>{
    setshowmodaltwo(true)

  }

  return (
    <>
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
                <TouchableOpacity onPress={pickAvatar} className="absolute right-0 bottom-0 z-40 bg-white w-8 h-8 rounded-full flex justify-center items-center shadow-md">
                  <FontAwesome size={16} color={primaryColor} name="pencil" />
                </TouchableOpacity>
                <View className="h-24 w-24 rounded-full overflow-hidden bg-slate-300 items-center justify-center">
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} className="w-full h-full" />
                  ) : (
                    <FontAwesome5 name="camera" size={20} color={primaryColor} />
                  )}
                </View>
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

