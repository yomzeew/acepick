import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform,Image } from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import { getColors } from "../../../static/color";
import { useRouter } from "expo-router";
import ButtonComponent from "../../buttoncomponent";
import InputComponent from "../../controls/textinput";
import { AntDesign } from "@expo/vector-icons";
import AuthComponent from "../Authcontainer";
import { Textstyles } from "../../../static/textFontsize";
import StateandLga from "component/controls/stateandlga";
import { useEffect, useState } from "react";
import { getAllStates, getLgasByState } from "utilizes/fetchlistofstateandlga";
import SelectComponent from "component/dashboardComponent/selectComponent";

import * as ImagePicker from 'expo-image-picker';
import { uploadPhotoUser } from "services/uploadServices";
import { AlertMessageBanner } from "component/AlertMessageBanner";

import { useDispatch } from "react-redux";
import { setRegistrationData } from "redux/registerSlice";


function ThirdStageComponent() {

  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  const router = useRouter();

  const [lga, setlga] = useState<string>("")
  const [state, setstate] = useState<string>("")
  const [firstName, setFirstName] = useState<string>("")
  const [lastName, setLastName] = useState<string>("")
  const [address, setaddress] = useState<string>('')
  const [lgalist, setlgalist] = useState<string[]>([])
  const statelist: string[] = getAllStates()
  const [photoUrl, setphotoUrl] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shouldProceed, setShouldProceed] = useState<boolean>(false);

  const getlgalist = () => {
    const lgaArray: string[] = getLgasByState(state)
    setlgalist(lgaArray)
  }
  useEffect(() => {
    getlgalist()
  }, [state])
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 4000);
      return () => clearTimeout(timer); // Cleanup on unmount or on new error
    }
  }, [errorMessage])
 
  const routes=useRouter()

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
      return () => clearTimeout(timer); // Cleanup on unmount or on new error
    }
  }, [successMessage])
  
  
  const dispatch = useDispatch();
  
  const handleNext = () => {
    // Basic validation
    if (!firstName || !lastName || !state || !lga || !address || !photoUrl) {
      setErrorMessage("Please fill all required fields and upload a profile photo.");
      return;
    }
  
    // Prepare user data
    const avatar = photoUrl;
    dispatch(
      setRegistrationData({
        firstName,
        lastName,
        state,
        lga,
        address,
        avatar,
      })
    );
  
    // Navigate to the next screen
    router.push("/passwordconfirmscreen");
  };
  


const onUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      setErrorMessage('Permission required. Please allow access to your media library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }

    const selectedImage = result.assets[0];
    console.log('Selected image:', selectedImage.uri);

    // Android-specific URI handling
    let uri = selectedImage.uri;
    if (Platform.OS === 'android' && !uri.startsWith('file://')) {
      uri = `file://${uri}`;
    }

    // Extract file extension
    const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

    const formData = new FormData();
    formData.append('avatar', {
      uri: uri,
      name: selectedImage.fileName || `photo_${Date.now()}.${fileExt}`,
      type: mimeType,
    } as any);

    try {
      const response = await uploadPhotoUser(formData);
      console.log('Upload Success:', response);
      setphotoUrl(response.data?.url || ''); 
      setSuccessMessage('Profile photo uploaded successfully.');
    } catch (error: any) {
      let msg = "An unexpected error occurred";
      if (error?.response?.data) {
        msg = error.response.data.message || 
              error.response.data.error || 
              JSON.stringify(error.response.data);
      } else if (error?.message) {
        msg = error.message;
      }
      
      // Specific Android network error handling
      if (msg.includes('Network Error') && Platform.OS === 'android') {
        msg = "File upload failed. Please check your connection or try a different image.";
      }
      
      setErrorMessage(msg);
      console.error("Upload failed:", msg);
    }
};
  


  return (
    <>
      {successMessage && (
        <AlertMessageBanner type="success" message={successMessage} />
      )}
      {errorMessage && (
        <AlertMessageBanner type="error" message={errorMessage} />
      )}
      <View style={{ backgroundColor: backgroundColor }} className="w-full h-full">
        <AuthComponent title="Register as a Client">
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
          >
            <ScrollView
              contentContainerStyle={{ width: "100%", alignItems: "center" }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="w-full items-center">

                <Text className="text-center" style={[Textstyles.text_xsmall, { color: "red" }]}>
                  Please ensure data provided are valid for verifications
                </Text>
                <View className="h-5"></View>

                {/* Upload Profile Picture Section */}
                <TouchableOpacity
                  className="w-28 h-28 bg-gray-200 rounded-full justify-center items-center mb-4 self-center"
                  style={{ borderWidth: 2, borderColor: primaryColor }}
                  onPress={onUpload}
                >
                  {photoUrl ? (
                    <Image
                      source={{ uri: photoUrl }}
                      style={{ width: 112, height: 112, borderRadius: 56 }}
                    />
                  ) : (
                    <AntDesign name="camerao" size={36} color={primaryColor} />
                  )}
                </TouchableOpacity>
                <Text className="text-lg text-center" style={{ color: primaryColor }}>
                  Upload Profile Photo
                </Text>
                <View className="h-5"></View>

                {/* Input Fields */}
                <InputComponent
                  color={primaryColor}
                  placeholder="First Name"
                  placeholdercolor={secondaryTextColor}
                  value={firstName}
                  onChange={setFirstName}
                />
                <View className="h-5"></View>
                <InputComponent
                  color={primaryColor}
                  placeholder="Last Name"
                  placeholdercolor={secondaryTextColor}
                  value={lastName}
                  onChange={setLastName}
                />
                <View className="h-5" />
                <SelectComponent title={"Select State"}
                  width={"100%"}
                  data={statelist}
                  setValue={(text) => setstate(text)}
                  value={state}
                />
                <View className="h-5" />
                <SelectComponent title={"Select LGA"}
                  width={"100%"}
                  data={lgalist}
                  setValue={(text) => setlga(text)}
                  value={lga}
                />
                <View className="h-5"></View>
                <View className="w-full px-6 pb-3">
                  <Text className="" style={{ color: primaryColor }}>
                    Residential Address
                  </Text>
                </View>

                <InputComponent
                  color={primaryColor}
                  placeholder="Enter your full address"
                  placeholdercolor={secondaryTextColor}
                  value={address}
                  onChange={setaddress}
                />

              </View>
            </ScrollView>
          </KeyboardAvoidingView>

        </AuthComponent>
        <View className="absolute bottom-10 w-full px-6">
          <View className="items-center w-full">
            <ButtonComponent color={primaryColor} text="Next" textcolor="#fff" onPress={handleNext}  />
            <View className="h-5"></View>

          </View>

        </View>
      </View>
    </>

  );
}

export default ThirdStageComponent;
