import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import HeaderComponent from "component/headerComp";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import PinModal from "component/pinModal";
import { useMutation } from "@tanstack/react-query";
import { resetPinFn } from "services/userService";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import { useRouter } from "expo-router";
import EmptyView from "component/emptyview";

const ResetPinPage = () => {
    const { theme } = useTheme();
    const { primaryColor, selectioncardColor, secondaryTextColor } = getColors(theme);
    const router = useRouter();
    
    const [showPinModal, setShowPinModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Auto-clear messages after 4 seconds
    const clearMessages = () => {
        setTimeout(() => {
            setSuccessMessage(null);
            setErrorMessage(null);
        }, 4000);
    };

    const resetPinMutation = useMutation({
        mutationFn: resetPinFn,
        onSuccess: () => {
            setSuccessMessage("Transaction PIN reset successfully!");
            clearMessages();
            setTimeout(() => {
                router.back();
            }, 2000);
        },
        onError: (error: any) => {
            let msg = "Failed to reset PIN";
            if (error?.response?.data?.message) {
                msg = error.response.data.message;
            } else if (error?.message) {
                msg = error.message;
            } else if (error?.response?.status === 400) {
                msg = "Invalid PIN provided. Please check and try again.";
            } else if (error?.response?.status === 401) {
                msg = "Unauthorized. Please login again.";
            } else if (error?.response?.status >= 500) {
                msg = "Server error. Please try again later.";
            }
            setErrorMessage(msg);
            clearMessages();
        },
    });

    const handlePinReset = (pinData: any) => {
        resetPinMutation.mutate(pinData);
    };

    const handleResetPin = () => {
        setShowPinModal(true);
    };

    const handleCloseModal = () => {
        setShowPinModal(false);
    };

    return (
        <>
            <ContainerTemplate>
                <HeaderComponent title="Reset Transaction PIN" />
                
                {successMessage && (
                    <AlertMessageBanner type="success" message={successMessage} />
                )}
                {errorMessage && (
                    <AlertMessageBanner type="error" message={errorMessage} />
                )}

                <View className="flex-1 px-6">
                    <EmptyView height={40} />
                    
                    <View className="items-center mb-8">
                        <View className="w-20 h-20 rounded-full bg-orange-100 items-center justify-center mb-4">
                            <Text className="text-3xl">🔐</Text>
                        </View>
                        <ThemeText size={Textstyles.text_cmedium} className="text-center mb-4">
                            Reset Your Transaction PIN
                        </ThemeText>
                        <ThemeTextsecond size={Textstyles.text_small}>
                            You will need to enter your current PIN and then set a new one. 
                            Make sure to choose a PIN that you can remember but others cannot guess.
                        </ThemeTextsecond>
                    </View>

                    <View style={{ backgroundColor: selectioncardColor }} className="rounded-2xl p-6 mb-6">
                        <ThemeTextsecond size={Textstyles.text_small}>
                            Important Information:
                        </ThemeTextsecond>
                        <View className="space-y-3">
                            <View className="flex-row items-start">
                                <Text className="text-orange-500 mr-2">•</Text>
                                <ThemeTextsecond size={Textstyles.text_xsmall}>
                                    Your PIN must be 4 digits
                                </ThemeTextsecond>
                            </View>
                            <View className="flex-row items-start">
                                <Text className="text-orange-500 mr-2">•</Text>
                                <ThemeTextsecond size={Textstyles.text_xsmall}>
                                    Avoid using obvious numbers like 1234 or 0000
                                </ThemeTextsecond>
                            </View>
                            <View className="flex-row items-start">
                                <Text className="text-orange-500 mr-2">•</Text>
                                <ThemeTextsecond size={Textstyles.text_xsmall}>
                                    You will need your current PIN to set a new one
                                </ThemeTextsecond>
                            </View>
                            <View className="flex-row items-start">
                                <Text className="text-orange-500 mr-2">•</Text>
                                <ThemeTextsecond size={Textstyles.text_xsmall}>
                                    Keep your PIN secure and do not share it with anyone
                                </ThemeTextsecond>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleResetPin}
                        disabled={resetPinMutation.isPending}
                        style={{ backgroundColor: primaryColor }}
                        className="rounded-xl py-4 px-6 items-center"
                    >
                        <Text className="text-white font-semibold text-base">
                            {resetPinMutation.isPending ? "Resetting..." : "Reset PIN"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-4 items-center"
                    >
                        <Text style={{ color: secondaryTextColor }} className="text-sm">
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
            </ContainerTemplate>

            <PinModal
                visible={showPinModal}
                mode="reset"
                onComplete={handlePinReset}
                onClose={handleCloseModal}
            />
        </>
    );
};

export default ResetPinPage;
