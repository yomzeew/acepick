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
import { useState, useEffect } from "react"
import { useRouter } from "expo-router"
import { InteractionManager } from "react-native"
import PaymentmethodModal from "./paymentModal"
import PinModal from "component/pinModal"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "redux/store"
import { updateUserFromDashboard } from "redux/slices/authSlice"
import { fetchWalletAsync } from "redux/slices/walletSlice"
import { Wallet } from "types/type"
import { useToast } from "context/ToastContext"
import { resetPinFn, setPinFn, forgotPinFn } from "services/userService"
import { useMutation } from "@tanstack/react-query"
import BankDetails, { BankDetailsCard } from "./bankdetails"
import TransferFund from "./transferfund"

const WalletPay = () => {
    const role = useSelector((state: RootState) => state.auth.user?.role)
    const wallet: Wallet | null = useSelector((state: RootState) => state?.auth.user?.wallet) ?? null;
    const pinSetFromSlice = useSelector((state: RootState) => state.wallet.pinSet);
    const dispatch = useDispatch();
    const toast = useToast();

    const router = useRouter();

    useEffect(() => {
        dispatch(fetchWalletAsync() as any);
    }, []);

    const [showFundModal, setShowFundModal] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [showBankModal, setShowBankModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [pinMode, setPinMode] = useState<'reset' | 'update'>('reset');

    // Holds the Paystack URL + reference to navigate to once the fund modal is
    // fully closed. We can't navigate while the native <Modal> is still mounted
    // because it renders above the entire navigation stack.
    const [pendingPayment, setPendingPayment] = useState<{ url: string; reference: string } | null>(null);

    // Navigate only after the native Modal has fully closed.
    // useEffect fires after the render where showFundModal=false (so
    // <Modal visible={false}> has been committed to the native layer), then
    // InteractionManager waits for all in-flight animations/interactions
    // (including the modal dismiss) to settle before pushing the new screen.
    useEffect(() => {
        if (!showFundModal && pendingPayment) {
            const { url, reference } = pendingPayment;
            setPendingPayment(null);
            const task = InteractionManager.runAfterInteractions(() => {
                router.push({
                    pathname: "/paystackViewLayout",
                    params: { url, reference, context: 'fund' },
                } as any);
            });
            return () => task.cancel();
        }
    }, [showFundModal, pendingPayment]);

    const { theme } = useTheme();
    const hasPin = pinSetFromSlice || !!wallet?.isPinSet || !!wallet?.isActive;
    const { primaryColor, selectioncardColor, secondaryTextColor, backgroundColor, backgroundColortwo, textColor, borderColor } = getColors(theme);
    const isDark = theme === "dark";
    const cardBg = selectioncardColor;
    const iconBg = (color: string) => color + "15";

    const mutationNewPin = useMutation({
        mutationFn: setPinFn,
        onSuccess: () => {
            toast.success("Transaction PIN Created", "Your 4-digit PIN has been set successfully");
            setShowPinModal(false);
            // Update Redux state so hasPin becomes true immediately
            if (wallet) {
                dispatch(updateUserFromDashboard({ wallet: { ...wallet, pin: null, isActive: true } }));
            }
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Failed to set PIN";
            toast.error("PIN Error", msg);
        },
    });

    const mutationResetPin = useMutation({
        mutationFn: resetPinFn,
        onSuccess: () => {
            toast.success("PIN Changed", "Your transaction PIN has been updated");
            setShowPinModal(false);
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Failed to change PIN";
            toast.error("PIN Error", msg);
        },
    });

    const mutationForgotPin = useMutation({
        mutationFn: forgotPinFn,
        onSuccess: () => {
            toast.success("Reset Link Sent", "Check your email or phone for PIN reset instructions");
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Failed to send reset instructions";
            toast.error("Error", msg);
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
                <Text style={{ fontSize: 14, fontWeight: "600", color: secondaryTextColor }}>{label}</Text>
                {subtitle && <Text style={{ fontSize: 11, color: textColor, marginTop: 2 }}>{subtitle}</Text>}
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
                            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: primaryColor + '15', alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                                <Feather name="arrow-up-right" size={20} color={primaryColor} />
                            </View>
                            <Text style={{ fontSize: 12, fontWeight: "600", color: secondaryTextColor }}>Withdraw</Text>
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
                                <Text style={{ fontSize: 12, fontWeight: "600", color: secondaryTextColor }}>Fund Wallet</Text>
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
                            <Text style={{ fontSize: 12, fontWeight: "600", color: secondaryTextColor }}>Add Bank</Text>
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
                        <>
                            <MenuItem
                                icon="refresh-cw"
                                iconColor={primaryColor}
                                label="Change PIN"
                                subtitle="Update your existing transaction PIN"
                                onPress={() => handleShowPinModal("reset")}
                            />
                            <MenuItem
                                icon="help-circle"
                                iconColor="#F59E0B"
                                label="Forgot PIN"
                                subtitle="Reset your PIN via email or phone"
                                onPress={() => mutationForgotPin.mutate()}
                            />
                        </>
                    )}

                    <MenuItem
                        icon="credit-card"
                        iconColor={primaryColor}
                        label="Manage Bank Accounts"
                        subtitle="Add or remove bank accounts"
                        onPress={() => setShowBankModal(true)}
                    />

                    {/* Bank Accounts List */}
                    <EmptyView height={10} />
                    <Text style={{ fontSize: 13, fontWeight: "700", color: secondaryTextColor, marginBottom: 10, paddingLeft: 4 }}>SAVED BANKS</Text>
                    <BankDetailsCard showmodal={showBankModal} />
                </ScrollView>
            </ContainerTemplate>

            {/* Fund Wallet Modal — always in tree so visible={false} cleanly
                dismisses the native Modal dialog before we navigate away. */}
            <SliderModalTemplate modalHeight={"60%"} showmodal={showFundModal} setshowmodal={setShowFundModal} dismissable={!pendingPayment}>
                <PaymentmethodModal
                    setErrorMessage={(msg: any) => toast.error("Payment Error", msg)}
                    errorMessage=""
                    onPaymentReady={(url, reference) => {
                        // 1. Store nav target
                        // 2. Close modal → SliderModalTemplate gets visible={false}
                        //    → native Modal dialog is properly dismissed
                        // 3. useEffect fires after render → navigate
                        setPendingPayment({ url, reference });
                        setShowFundModal(false);
                    }}
                />
            </SliderModalTemplate>

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