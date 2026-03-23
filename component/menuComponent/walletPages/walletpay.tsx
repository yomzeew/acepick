import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import EmptyView from "component/emptyview"
import WalletCard from "component/dashboardComponent/walletcompoment"
import { ScrollView, TouchableOpacity, View, Text } from "react-native"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { Feather, FontAwesome5 } from "@expo/vector-icons"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import SliderModalTemplate, { SliderModalNoScrollview } from "component/slideupModalTemplate"
import { useState } from "react"
import PaymentmethodModal from "./paymentModal"
import PinModal from "component/pinModal"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { Wallet } from "types/type"
import { useToast } from "context/ToastContext"
import { resetPinFn, setPinFn } from "services/userService"
import { useMutation } from "@tanstack/react-query"
import BankDetails, { BankDetailsCard } from "./bankdetails"
import TransferFund from "./transferfund"

const WalletPay = () => {
    const role = useSelector((state: RootState) => state.auth.user?.role)
    const wallet: Wallet | null = useSelector((state: RootState) => state?.auth.user?.wallet) ?? null;
    const toast = useToast();

    const [showFundModal, setShowFundModal] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [showBankModal, setShowBankModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [pinMode, setPinMode] = useState<'reset' | 'update'>('reset');

    const { theme } = useTheme();
    const hasPin = !!wallet?.isActive;
    const { primaryColor, selectioncardColor, secondaryTextColor, backgroundColor, backgroundColortwo } = getColors(theme);
    const isDark = theme === "dark";
    const cardBg = isDark ? "#1F2937" : "#FFFFFF";
    const iconBg = (color: string) => color + "15";

    const mutationNewPin = useMutation({
        mutationFn: setPinFn,
        onSuccess: () => {
            toast.success("Transaction PIN Created", "Your 4-digit PIN has been set successfully");
            setShowPinModal(false);
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Failed to set PIN";
            toast.error("PIN Error", msg);
        },
    });

    const mutationResetPin = useMutation({
        mutationFn: resetPinFn,
        onSuccess: () => {
            toast.success("PIN Reset Successful", "Your transaction PIN has been updated");
            setShowPinModal(false);
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Failed to reset PIN";
            toast.error("PIN Error", msg);
        },
    });

    const onCompleteNewPin = (pin: string) => mutationNewPin.mutate({ pin });

    const onCompleteResetPin = (payload: any) => {
        if (typeof payload === "object" && payload.oldPin && payload.newPin) {
            mutationResetPin.mutate(payload);
        } else {
            toast.error("Invalid Input", "Please enter valid PIN values");
        }
    };

    const handleShowPinModal = (mode: 'reset' | 'update') => {
        setPinMode(mode);
        setShowPinModal(true);
    };

    const MenuItem = ({ icon, iconColor, label, subtitle, onPress }: {
        icon: string; iconColor: string; label: string; subtitle?: string; onPress: () => void;
    }) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={{ backgroundColor: cardBg, borderRadius: 14, padding: 14, marginBottom: 10 }}
            className="flex-row items-center"
        >
            <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: iconBg(iconColor), alignItems: "center", justifyContent: "center" }}>
                <Feather name={icon as any} size={18} color={iconColor} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: isDark ? "#F9FAFB" : "#111827" }}>{label}</Text>
                {subtitle && <Text style={{ fontSize: 11, color: secondaryTextColor, marginTop: 2 }}>{subtitle}</Text>}
            </View>
            <Feather name="chevron-right" size={18} color={secondaryTextColor} />
        </TouchableOpacity>
    );

    return (
        <>
            <ContainerTemplate>
                <HeaderComponent title="Wallet & Payments" />
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    <EmptyView height={12} />
                    <WalletCard
                        showmodal={showFundModal}
                        setshowmodal={setShowFundModal}
                        setshowwithdraw={setShowWithdrawModal}
                        showwithdraw={showWithdrawModal}
                    />

                    <EmptyView height={24} />

                    {/* Quick Actions */}
                    <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
                        <TouchableOpacity
                            onPress={() => setShowWithdrawModal(true)}
                            activeOpacity={0.7}
                            style={{ flex: 1, backgroundColor: cardBg, borderRadius: 14, padding: 16, alignItems: "center" }}
                        >
                            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: backgroundColortwo + '15', alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                                <Feather name="arrow-up-right" size={20} color={backgroundColortwo} />
                            </View>
                            <Text style={{ fontSize: 12, fontWeight: "600", color: isDark ? "#F9FAFB" : "#111827" }}>Withdraw</Text>
                        </TouchableOpacity>

                        {role === "client" && (
                            <TouchableOpacity
                                onPress={() => setShowFundModal(true)}
                                activeOpacity={0.7}
                                style={{ flex: 1, backgroundColor: cardBg, borderRadius: 14, padding: 16, alignItems: "center" }}
                            >
                                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: primaryColor + '15', alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                                    <Feather name="arrow-down-left" size={20} color={primaryColor} />
                                </View>
                                <Text style={{ fontSize: 12, fontWeight: "600", color: isDark ? "#F9FAFB" : "#111827" }}>Fund Wallet</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={() => setShowBankModal(true)}
                            activeOpacity={0.7}
                            style={{ flex: 1, backgroundColor: cardBg, borderRadius: 14, padding: 16, alignItems: "center" }}
                        >
                            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: primaryColor + "15", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                                <FontAwesome5 name="university" size={16} color={primaryColor} />
                            </View>
                            <Text style={{ fontSize: 12, fontWeight: "600", color: isDark ? "#F9FAFB" : "#111827" }}>Add Bank</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Settings Menu */}
                    <Text style={{ fontSize: 13, fontWeight: "700", color: secondaryTextColor, marginBottom: 10, paddingLeft: 4 }}>SETTINGS</Text>

                    {!hasPin ? (
                        <MenuItem
                            icon="lock"
                            iconColor={primaryColor}
                            label="Create Transaction PIN"
                            subtitle="Set up a 4-digit PIN for transactions"
                            onPress={() => handleShowPinModal("update")}
                        />
                    ) : (
                        <MenuItem
                            icon="refresh-cw"
                            iconColor={backgroundColortwo}
                            label="Reset Transaction PIN"
                            subtitle="Change your existing transaction PIN"
                            onPress={() => handleShowPinModal("reset")}
                        />
                    )}

                    <MenuItem
                        icon="credit-card"
                        iconColor={primaryColor}
                        label="Manage Bank Accounts"
                        subtitle="Add or remove bank accounts"
                        onPress={() => setShowBankModal(true)}
                    />

                    <MenuItem
                        icon="send"
                        iconColor={backgroundColortwo}
                        label="Withdraw Funds"
                        subtitle="Transfer money to your bank account"
                        onPress={() => setShowWithdrawModal(true)}
                    />

                    {/* Bank Accounts List */}
                    <EmptyView height={10} />
                    <Text style={{ fontSize: 13, fontWeight: "700", color: secondaryTextColor, marginBottom: 10, paddingLeft: 4 }}>SAVED BANKS</Text>
                    <BankDetailsCard showmodal={showBankModal} />
                </ScrollView>
            </ContainerTemplate>

            {/* Fund Wallet Modal */}
            {showFundModal && (
                <SliderModalTemplate modalHeight={"60%"} showmodal={showFundModal} setshowmodal={setShowFundModal}>
                    <PaymentmethodModal
                        setSuccessMessage={(msg: any) => toast.success("Payment", msg)}
                        setErrorMessage={(msg: any) => toast.error("Payment Error", msg)}
                        errorMessage=""
                        successMessage=""
                    />
                </SliderModalTemplate>
            )}

            {/* PIN Modal */}
            <SliderModalNoScrollview showmodal={showPinModal} modalHeight={"80%"} setshowmodal={setShowPinModal}>
                {pinMode === "update" && (
                    <PinModal
                        mode="update"
                        onComplete={(value: string) => onCompleteNewPin(value)}
                        onClose={() => setShowPinModal(false)}
                        visible={showPinModal}
                        loading={mutationNewPin.isPending}
                    />
                )}
                {pinMode === "reset" && (
                    <PinModal
                        mode="reset"
                        onComplete={(payload) => {
                            if (typeof payload === "object") onCompleteResetPin(payload);
                        }}
                        onClose={() => setShowPinModal(false)}
                        visible={showPinModal}
                        loading={mutationResetPin.isPending}
                    />
                )}
            </SliderModalNoScrollview>

            {/* Bank Details Modal */}
            <SliderModalNoScrollview showmodal={showBankModal} modalHeight={"80%"} setshowmodal={setShowBankModal}>
                <BankDetails setshowmodal={setShowBankModal} />
            </SliderModalNoScrollview>

            {/* Withdraw Modal */}
            <SliderModalNoScrollview showmodal={showWithdrawModal} modalHeight={"85%"} setshowmodal={setShowWithdrawModal}>
                <TransferFund setshowmodal={setShowWithdrawModal} />
            </SliderModalNoScrollview>
        </>
    );
};
export default WalletPay