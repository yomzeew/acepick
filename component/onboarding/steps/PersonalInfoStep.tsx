import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from "react-native";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { useEffect, useState } from "react";
import InputComponent from "component/controls/textinput";
import ButtonComponent from "component/buttoncomponent";
import SelectComponent from "component/dashboardComponent/selectComponent";
import { AntDesign } from "@expo/vector-icons";
import { Textstyles } from "static/textFontsize";
import { getAllStates, getLgasByState } from "utilizes/fetchlistofstateandlga";
import { useToast } from "context/ToastContext";
import * as ImagePicker from 'expo-image-picker';
import { uploadAvatar } from "services/supabaseStorage";
import { useDispatch } from "react-redux";
import { setRegistrationData } from "redux/slices/authSlice";

interface PersonalInfoStepProps {
  onNext: () => void;
  roleLabel: string;
}

const PersonalInfoStep = ({ onNext, roleLabel }: PersonalInfoStepProps) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, secondaryTextColor } = getColors(theme);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [address, setAddress] = useState("");
  const [lgaList, setLgaList] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState("");
  const toast = useToast();

  const stateList: string[] = getAllStates();
  const dispatch = useDispatch();

  useEffect(() => {
    if (state) {
      const lgaArray: string[] = getLgasByState(state);
      setLgaList(lgaArray);
    }
  }, [state]);

  const onUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      toast.error('Permission Required', 'Please allow access to your media library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const selectedImage = result.assets[0];
    let uri = selectedImage.uri;

    try {
      const url = await uploadAvatar(uri);
      setPhotoUrl(url);
      toast.success('Upload Success', 'Profile photo uploaded successfully.');
    } catch (error: any) {
      let msg = "An unexpected error occurred";
      if (error?.message) {
        msg = error.message;
      }
      console.log("Upload Error:");
      console.log("Upload Error Message:", msg);
      toast.error('Upload Failed', msg);
    }
  };

  const handleNext = () => {
    if (!firstName || !lastName || !state || !lga || !address || !photoUrl) {
      toast.error('Missing Fields', 'Please fill all required fields and upload a profile photo.');
      return;
    }
    dispatch(
      setRegistrationData({
        firstName,
        lastName,
        state,
        lga,
        address,
        avatar: photoUrl,
      })
    );
    onNext();
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={{ width: "100%", alignItems: "center", paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full items-center px-2">
            <Text className="text-center" style={[Textstyles.text_xsmall, { color: "red" }]}>
              Please ensure data provided are valid for verifications
            </Text>
            <View className="h-5" />

            {/* Upload Profile Picture */}
            <TouchableOpacity
              className="w-28 h-28 bg-gray-200 rounded-full justify-center items-center mb-4 self-center"
              style={{ borderWidth: 2, borderColor: primaryColor }}
              onPress={onUpload}
            >
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={{ width: 112, height: 112, borderRadius: 56 }} />
              ) : (
                <AntDesign name="camerao" size={36} color={primaryColor} />
              )}
            </TouchableOpacity>
            <Text className="text-lg text-center" style={{ color: primaryColor }}>
              Upload Profile Photo
            </Text>
            <View className="h-5" />

            <InputComponent
              color={primaryColor}
              placeholder="First Name"
              placeholdercolor={secondaryTextColor}
              value={firstName}
              onChange={setFirstName}
            />
            <View className="h-5" />
            <InputComponent
              color={primaryColor}
              placeholder="Last Name"
              placeholdercolor={secondaryTextColor}
              value={lastName}
              onChange={setLastName}
            />
            <View className="h-5" />
            <SelectComponent
              title="Select State"
              width="100%"
              data={stateList}
              setValue={(text) => setState(text)}
              value={state}
            />
            <View className="h-5" />
            <SelectComponent
              title="Select LGA"
              width="100%"
              data={lgaList}
              setValue={(text) => setLga(text)}
              value={lga}
            />
            <View className="h-5" />
            <View className="w-full px-6 pb-3">
              <Text style={{ color: primaryColor }}>Residential Address</Text>
            </View>
            <InputComponent
              color={primaryColor}
              placeholder="Enter your full address"
              placeholdercolor={secondaryTextColor}
              value={address}
              onChange={setAddress}
            />
            <View className="h-5" />

            <View className="w-full">
              <ButtonComponent color={primaryColor} text="Next" textcolor="#fff" onPress={handleNext} />
            </View>
            <View className="h-5" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default PersonalInfoStep;
