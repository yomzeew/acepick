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
import StateandLga, { Modaldisplay } from "component/controls/stateandlga";
import { getAllSector, getProfessionsBySector } from "utilizes/fetchlistofjobs";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";
import { setCooperationData } from "redux/registerSlice";
import { normalizePhone } from "utilizes/phoneNumberNormalize";
import { AlertMessageBanner } from "component/AlertMessageBanner";

const DirectorScreenKyc = () => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  const router = useRouter();
  const [firstName, setFirstName] = useState<string>("")
  const [lastName, setLastName] = useState<string>("")
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<string>('')
  const [lga, setlga] = useState<string>("")
  const [state, setstate] = useState<string>("")
  const [lgalist, setlgalist] = useState<string[]>([])
  const statelist: string[] = getAllStates()
  const [sectorList, setSectorList] = useState<any[]>([]);
  const [professionArray, setProfessionArray] = useState<any[]>([]);
  const [sectorValue,setSectorValue]=useState<string>('')
  const [professionValue,setProfessionValue]=useState<string>('')
  const [showOption, setShowOption] = useState<boolean>(false);
  const [isStateSelection, setIsStateSelection] = useState<boolean>(true);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shouldProceed, setShouldProceed] = useState<boolean>(false);
  const [data, setData] = useState<string[]>([]);

  const getlgalist = () => {
    const lgaArray: string[] = getLgasByState(state)
    setlgalist(lgaArray)
  }
 // Load sectors when the component mounts
 useEffect(() => {
  const loadSectors = async () => {
    const sectors = await getAllSector();
    const arraySectors=sectors.map((item)=>item.title)
    setSectorList(arraySectors);
  };

  loadSectors();
}, []);

// Fetch professions based on selected sector
const getProfessionList = async () => {
  if (!sectorValue) {
    console.warn('No sector selected');
    return;
  }
  const professionalList = await getProfessionsBySector(sectorValue);
  const arrayProfessions=professionalList.map((item)=>item.title)
  setProfessionArray(arrayProfessions);
};

useEffect(()=>{
  getProfessionList()
},[sectorValue])

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
  const cooporateData = useSelector((state: RootState) => state.register.cooperationData);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
      return () => clearTimeout(timer); // Cleanup on unmount or on new error
    }
  }, [successMessage])
  
  
  const dispatch = useDispatch();
const handleNext=()=>{
     if (!email || !phone) {
            setErrorMessage('Please fill both fields')
            return;
          }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+234[0-9]{10}$/; // Ensures +234 followed by 10 digits
      
        if (!emailRegex.test(email)) {
          setErrorMessage("Please enter a valid email address");
          return;
        }
       const phoneformat=normalizePhone(phone)
        if (!phoneRegex.test(phoneformat)) {
          setErrorMessage("Please enter a valid phone number");
          return;
        }
  if (!firstName || !lastName || !state || !lga || !address ) {
    setErrorMessage("Please fill all required fields.");
    return;
  }
  const director={
  firstName,
  lastName,
  email,
  phone,
  address,
  state,
  lga,


  }
   dispatch(
              setCooperationData({
                 ...cooporateData,director
              })
          );
  router.push("/passwordpagelayout");


}


  return (
    <>
    {successMessage && (
             <AlertMessageBanner type="success" message={successMessage} />
           )}
           {errorMessage && (
             <AlertMessageBanner type="error" message={errorMessage} />
           )}
      {showOption &&
        <Modaldisplay
          data={data}
          isStateSelection={isStateSelection}
          setstate={(text: string) => setstate(text)}
          setlga={(text: string) => setlga(text)}
          setShowOption={(text: boolean) => setShowOption(text)}
        />
      }
      <View style={{ backgroundColor: backgroundColor }} className="w-full h-full">
        <AuthComponent title="Directors Details">
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
                  placeholder="Email"
                  placeholdercolor={secondaryTextColor}
                  value={email}
                  onChange={setEmail}
                />
                <EmptyView height={10} />
                <InputComponent
                  color={primaryColor}
                  placeholder="Phone Number"
                  placeholdercolor={secondaryTextColor}
                  value={phone}
                  onChange={setPhone}
                />
                <EmptyView height={10} />
                <SelectComponent title={"Select State"}
                  width={"100%"}
                  data={statelist}
                  setValue={(text) => setstate(text)}
                  value={state}
                />
                <EmptyView height={10} />
                <SelectComponent title={"Select LGA"}
                  width={"100%"}
                  data={lgalist}
                  setValue={(text) => setlga(text)}
                  value={lga}
                />
                <EmptyView height={10} />
                <InputComponent
                  color={primaryColor}
                  placeholder="Office Address"
                  placeholdercolor={secondaryTextColor}
                  value={address}
                  onChange={setAddress}
                />
               <EmptyView height={10} />
                <View className=" w-full ">
                  <View className="items-center w-full">
                    <ButtonComponent color={primaryColor} text="Next" textcolor="#fff" onPress={handleNext} />
                    <View className="h-5"></View>

                  </View>

                </View>

              </View>
            </ScrollView>
          </KeyboardAvoidingView>

        </AuthComponent>

      </View>
    </>

  );
}

export default DirectorScreenKyc