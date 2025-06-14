import { useMutation } from "@tanstack/react-query"
import { AlertMessageBanner } from "component/AlertMessageBanner"
import ButtonComponent from "component/buttoncomponent"
import ButtonFunction from "component/buttonfunction"
import Checkbox from "component/controls/checkbox"
import StateandLga from "component/controls/stateandlga"
import InputComponent, { InputComponentTextarea } from "component/controls/textinput"
import { ProfessionalDetailsWithoutChat } from "component/dashboardComponent/clientdetail"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import { ThemeTextsecond } from "component/ThemeText"
import { useLocalSearchParams } from "expo-router"
import { useCurrentLocation } from "hooks/useLocation"
import { useTheme } from "hooks/useTheme"
import { useEffect, useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native"
import { createJobFn } from "services/userService"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const JobOrderScreen = () => {
    const [showmanuallocation, setShowmanuallocation] = useState(true)
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor } = getColors(theme)
    const { fullName, rating, avatar, professionalId } = useLocalSearchParams()
    const [title, setTitle] = useState('')
    const [numOfJobs, setNumOfJobs] = useState(0)
    const [description, setDescription] = useState('')
    const [manualaddress, setManualAddress] = useState('')
    const { address } = useCurrentLocation()
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [shouldProceed, setShouldProceed] = useState<boolean>(false);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null);
            }, 4000);
            return () => clearTimeout(timer); // Cleanup on unmount or on new error
        }
    }, [errorMessage]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 4000);
            return () => clearTimeout(timer); // Cleanup on unmount or on new error
        }
    }, [successMessage])

    const safeFullName = Array.isArray(fullName) ? fullName[0] : fullName ?? "";
    const safeRating = Array.isArray(rating) ? rating[0] : rating ?? 0;
    const safeAvatar = Array.isArray(avatar) ? avatar[0] : avatar ?? 0;
    const safeProfessionalId = Array.isArray(professionalId) ? professionalId[0] : professionalId ?? "";






    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 4000);
            return () => clearTimeout(timer); // Cleanup on unmount or on new error
        }
    }, [successMessage])


    const mutation = useMutation({
        mutationFn: createJobFn,
        onSuccess: (data) => {
            console.log(data)
            setSuccessMessage('Job Created Successfully')
            setShouldProceed(true)

        },
        onError: (error: any) => {
            let msg = "An unexpected error occurred";

            if (error?.response?.data) {
                // Try multiple common formats
                msg =
                    error.response.data.message ||         // Common single message
                    error.response.data.error ||           // Alternative key
                    JSON.stringify(error.response.data);   // Fallback: dump full error object
            } else if (error?.message) {
                msg = error.message;
            }

            setErrorMessage(msg);
            console.error(" failed:", msg);
        },
    });
    const handleCreateJob = () => {
        let finaladdress
        if(!showmanuallocation){
            if(!manualaddress){
                setErrorMessage('Please enter address')
                return
            }
            finaladdress=manualaddress
        }
        else{
            finaladdress=address
        }
        if(!title || !description){
            setErrorMessage('Please enter empty field')
            return

        }

        const payload = { title, description, address:finaladdress, professionalId }
        mutation.mutate(payload)

    };


    return (
        <>
            {successMessage && (
                <AlertMessageBanner type="success" message={successMessage} />
            )}
            {errorMessage && (
                <AlertMessageBanner type="error" message={errorMessage} />
            )}
            <ContainerTemplate>
                <HeaderComponent title={"Job Order"} />
                <EmptyView height={20} />
                <ProfessionalDetailsWithoutChat
                    fullName={safeFullName}
                    avatar={safeAvatar}
                    rating={safeRating}
                />
                <EmptyView height={40} />
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
                >
                    <ScrollView
                        contentContainerStyle={{ width: "100%", alignItems: "center" }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View className="h-full w-full flex-col">

                            <View className="w-full">
                                <InputComponent
                                    color={primaryColor}
                                    placeholder={"Job title"}
                                    placeholdercolor={secondaryTextColor}
                                    value={title}
                                    onChange={setTitle}
                                />
                                <EmptyView height={20} />
                                <ThemeTextsecond size={Textstyles.text_small}>No of Jobs</ThemeTextsecond>
                                <InputComponent
                                    keyboardType="numeric"
                                    color={primaryColor}
                                    placeholder={""}
                                    placeholdercolor={secondaryTextColor}
                                    value={numOfJobs}
                                    onChange={setNumOfJobs}
                                />
                                <EmptyView height={20} />
                                <ThemeTextsecond size={Textstyles.text_small}>Job description</ThemeTextsecond>
                                <InputComponentTextarea
                                    color={primaryColor}
                                    placeholder={"Type it here"}
                                    placeholdercolor={secondaryTextColor}
                                    onChange={setDescription}
                                    value={description}
                                />
                                <EmptyView height={20} />

                                <View className="w-full">
                                    <View className="flex-row gap-x-2">
                                        <Checkbox isChecked={showmanuallocation} onToggle={() => setShowmanuallocation(!showmanuallocation)} />
                                        <ThemeTextsecond size={Textstyles.text_small}>Pick location automatic</ThemeTextsecond>
                                    </View>
                                    <View>

                                    </View>

                                </View>

                                {!showmanuallocation && <View className="w-full">
                                    <EmptyView height={20} />
                                    <InputComponent
                                        color={primaryColor}
                                        placeholder={"Enter the job site address"}
                                        placeholdercolor={secondaryTextColor}
                                        onChange={setManualAddress}
                                        value={manualaddress}

                                    />

                                </View>}
                                <EmptyView height={20} />
                                <View className="w-full">
                                    <ButtonComponent
                                        color={primaryColor}
                                        text="Submit"
                                        textcolor="#fff"
                                        onPress={handleCreateJob}
                                        isLoading={mutation.isPending}
                                        disabled={!title || !description}
                                    />

                                </View>


                            </View>



                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>

            </ContainerTemplate>

        </>
    )
}
export default JobOrderScreen