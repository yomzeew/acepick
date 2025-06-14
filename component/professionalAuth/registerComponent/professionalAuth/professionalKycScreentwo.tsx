import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View, Image } from "react-native"
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
import { useLocalSearchParams, useRouter } from "expo-router";
import EmptyView from "component/emptyview";
import { Modaldisplay } from "component/controls/stateandlga";
import * as ImagePicker from 'expo-image-picker';
import { uploadPhotoUser } from "services/uploadServices";
import { getAllSector, getProfessionsBySector } from "utilizes/fetchlistofjobs";
import { setCooperationData, setRegistrationData } from "redux/registerSlice";
import { useDispatch } from "react-redux";
import { AlertMessageBanner } from "component/AlertMessageBanner";

const ProfessionalScreenKycTwo = () => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor, backgroundColor } = getColors(theme)

    const [lga, setlga] = useState<string>("")
    const [state, setstate] = useState<string>("")
    const [address, setAddress] = useState<string>("")
    const [nameOfOrg, setNameOfOrg] = useState<string>("")
    const [phone, setphone] = useState<string>("")
    const [regNum, setRegNum] = useState<string>("")
    const [noOfEmployees, setNoofEmployees] = useState<number>(1)



    const [lgalist, setlgalist] = useState<string[]>([])
    const statelist: string[] = getAllStates()
    const [photoUrl, setphotoUrl] = useState<string>('')
    const [sectorList, setSectorList] = useState<any[]>([]);
    const [professionArray, setProfessionArray] = useState<any[]>([]);
    const [sectorValue, setSectorValue] = useState<string>('')
    const [professionValue, setProfessionValue] = useState<string>('')

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [shouldProceed, setShouldProceed] = useState<boolean>(false);


    // Load sectors when the component mounts
    useEffect(() => {
        const loadSectors = async () => {
            const sectors = await getAllSector();
            const arraySectors = sectors.map((item) => item.title)
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
        const arrayProfessions = professionalList.map((item) => item.title)
        setProfessionArray(arrayProfessions);
    };

    useEffect(() => {
        getProfessionList()
    }, [sectorValue])

    useEffect(() => {
        getlgalist()
    }, [state])

    const getlgalist = () => {
        const lgaArray: string[] = getLgasByState(state)
        setlgalist(lgaArray)
    }
    useEffect(() => {
        getlgalist()
    }, [state])
    const [showOption, setShowOption] = useState<boolean>(false);
    const [isStateSelection, setIsStateSelection] = useState<boolean>(true); // Track if selecting state or LGA
    const [data, setData] = useState<string[]>([]);

    const dispatch = useDispatch();
    const router=useRouter()

    const handleNext = async() => {
        if (professionArray.length < 1) {
            setErrorMessage("Profession list is invalid ");
            return

        }
        const professionalList = await getProfessionsBySector(sectorValue);
        const professionObject = professionalList.find((item) => (
            item.title === professionValue
        ))
        console.log(professionObject)

       const professionId = professionObject?.id
       console.log(professionId)
        // Basic validation
        if (!state || !lga || !address ||!photoUrl||!professionId || !noOfEmployees || !state  || !lga || !regNum) {
            setErrorMessage("Please fill all required fields and upload a profile photo.");
            return;
        }

        // Prepare user data
        const avatar = photoUrl;
        dispatch(
            setCooperationData({
                nameOfOrg,
                phone,
                state,
                lga,
                address,
                avatar,
                professionId,
                regNum,
                noOfEmployees:Number(noOfEmployees)
            })
        );
        router.push("/directorkyclayout");
    }

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
            {showOption &&
                <Modaldisplay
                    data={data}
                    isStateSelection={isStateSelection}
                    setstate={(text: string) => setstate(text)}
                    setlga={(text: string) => setlga(text)}
                    setShowOption={(text: boolean) => setShowOption(text)}
                />
            }
               {successMessage && (
                    <AlertMessageBanner type="success" message={successMessage} />
                  )}
                  {errorMessage && (
                    <AlertMessageBanner type="error" message={errorMessage} />
                  )}
            <View style={{ backgroundColor: backgroundColor }} className="w-full h-full">
                <AuthComponent title="Register as a professional">
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

                                <EmptyView height={10} />
                                <InputComponent
                                    color={primaryColor}
                                    placeholder="Company Name"
                                    placeholdercolor={secondaryTextColor}
                                    value={nameOfOrg}
                                    onChange={setNameOfOrg}
                                />


                                <EmptyView height={10} />
                                <InputComponent
                                    color={primaryColor}
                                    placeholder="Company Phone Number"
                                    placeholdercolor={secondaryTextColor}
                                    value={phone}
                                    onChange={setphone}
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

                                <SelectComponent title={"Select Sector"}
                                    width={"100%"}
                                    data={sectorList}
                                    setValue={(text) => setSectorValue(text)}
                                    value={sectorValue}
                                />
                                  <EmptyView height={10} />
                                <SelectComponent title={"Select Profession"}
                                    width={"100%"}
                                    data={professionArray}
                                    setValue={(text) => setProfessionValue(text)}
                                    value={professionValue}
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
                                <InputComponent
                                    color={primaryColor}
                                    placeholder="Registration Number"
                                    placeholdercolor={secondaryTextColor}
                                    value={regNum}
                                    onChange={setRegNum}

                                />
                                <EmptyView height={10} />
                                <InputComponent
                                    color={primaryColor}
                                    placeholder="No of Employees"
                                    placeholdercolor={secondaryTextColor}
                                    value={noOfEmployees}
                                    onChange={setNoofEmployees}
                                />
                                <View className="h-5" />
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

export default ProfessionalScreenKycTwo
