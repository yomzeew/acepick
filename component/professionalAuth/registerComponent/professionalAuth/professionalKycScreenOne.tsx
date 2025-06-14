import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native"
import AuthComponent from "../../Authcontainer"
import InputComponent from "component/controls/textinput"
import { getColors } from "static/color";
import { useTheme } from "hooks/useTheme";
import ButtonComponent from "component/buttoncomponent";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import SelectComponent from "component/dashboardComponent/selectComponent";
import { useEffect, useState } from "react";
import { getAllStates, getLgasByState } from "utilizes/fetchlistofstateandlga";
import { Textstyles } from "static/textFontsize";
import { useRouter } from "expo-router";
import EmptyView from "component/emptyview";
import { Modaldisplay } from "component/controls/stateandlga";
import { ThemeText } from "component/ThemeText";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import { setRegistrationData } from "redux/registerSlice";
import { useDispatch } from "react-redux";
import { useDelay } from "hooks/useDelay";
import { useMutation } from "@tanstack/react-query";
import { sendOtp } from "services/authServices";
import { normalizePhone } from "utilizes/phoneNumberNormalize";
import { useRole } from "context/roleContext";

const ProfessionalScreenKycOne = () => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  const router = useRouter();
  const [firstName, setFirstName] = useState<string>("")
  const [lastName, setLastName] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [position,setPosition]=useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shouldProceed, setShouldProceed] = useState<boolean>(false);
  const dispatch = useDispatch();
  const {state}=useRole()
  const role=state.role
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 4000);
      return () => clearTimeout(timer); // Cleanup on unmount or on new error
    }
  }, [errorMessage])
 



 

  const handleNext=()=>{
    
    if (!firstName || !lastName || !position) {
      setErrorMessage("Please fill all required fields ");
      return;
  }
      dispatch(
        setRegistrationData({
          firstName,
          lastName,
          position,
        })
      );
      router.push("/professionalkyctwolayout");

  }

  return (
    <>
      {successMessage && (
         <AlertMessageBanner type="success" message={successMessage} />
       )}
       {errorMessage && (
         <AlertMessageBanner type="error" message={errorMessage} />
       )}
      <View style={{ backgroundColor: backgroundColor }} className="w-full h-full">
        <AuthComponent title={`Register as a ${role} `}>
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
                <EmptyView height={10} />

                {/* Input Fields */}
                <InputComponent
                  color={primaryColor}
                  placeholder="First Name"
                  placeholdercolor={secondaryTextColor}
                  value={firstName}
                  onChange={setFirstName}
                />
                <EmptyView height={10} />
                <InputComponent
                  color={primaryColor}
                  placeholder="Last Name"
                  placeholdercolor={secondaryTextColor}
                  value={lastName}
                  onChange={setLastName}
                />
                 
                <EmptyView height={10} />
                <InputComponent
                  color={primaryColor}
                  placeholder="Your Role"
                  placeholdercolor={secondaryTextColor}
                  value={position}
                  onChange={setPosition}
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

export default ProfessionalScreenKycOne

