import axios from "axios"
import { FontAwesome5, Feather,AntDesign } from "@expo/vector-icons"
import { useMutation } from "@tanstack/react-query"
import ButtonComponent from "component/buttoncomponent"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "component/dashboardComponent/headercomponent"
import WalletCard from "component/dashboardComponent/walletcompoment"
import EmptyView from "component/emptyview"
import SliderModalTemplate, { SliderModalNoScrollview } from "component/slideupModalTemplate"
import VerificationBadge from "component/controls/verificationBadge"
import { useRouter } from "expo-router"
import { useCurrentLocation } from "hooks/useLocation"
import { useTheme } from "hooks/useTheme"
import { useBVNVerification } from "hooks/useBVNVerification"
import { useEffect, useState } from "react"
import { Text, TouchableOpacity, View, ScrollView, RefreshControl, FlatList, ActivityIndicator } from "react-native"
import { useSelector } from "react-redux"
import { RootState, store } from "redux/store"
import { SaveTokenFunction } from "services/userService"
import { API_BASE_URL } from "utilizes/endpoints"
import { useDashboard } from "hooks/useDashboard"
import { getColors } from "static/color"
import { DeliveryData } from "types/type"
import { formatAmount } from "utilizes/amountFormat"
import { Ionicons } from "@expo/vector-icons"
import TransferFund from "component/menuComponent/walletPages/transferfund"
import React from "react"
import { acceptDeliveryFn, pendingdeliveryFn } from "services/deliveryServices"
import SectorSkeletonCard from "component/sectorSkeletonCard"
import * as Location from "expo-location"
import { Modal } from "react-native"
import { useToast } from "context/ToastContext"

const HomeDelivery = () => {
    const router = useRouter();
    const toast = useToast();
    const [showmodal, setshowmodal] = useState(false);
    const [showwithdraw, setshowwithdraw] = useState(false);

    const { theme } = useTheme();
    const { primaryColor, backgroundColor, secondaryTextColor, selectioncardColor, backgroundColortwo, successColor, errorColor, borderColor } = getColors(theme);
    const isDark = theme === "dark";
    const cardBg = isDark ? "#1F2937" : "#FFFFFF";
    const [balanceRefreshTrigger, setBalanceRefreshTrigger] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const fcmToken = useSelector((state: RootState) => state.auth.user?.fcmToken);
    const { data: dashboardData, refresh: refreshDashboard } = useDashboard();
    const { isVerified: isBVNVerified, isLoading: bvnLoading } = useBVNVerification();
    const recentTransactions = (dashboardData as any)?.recentTransactions || [];

    const saveFcmToken = async () => {
        try {
            await SaveTokenFunction(fcmToken);
        } catch (error) {
            console.error("SaveTokenUrl error:", error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        setBalanceRefreshTrigger((prev) => !prev);
        refreshDashboard();
        setTimeout(() => setRefreshing(false), 1000);
    };

    const user = useSelector((state: RootState) => state?.auth?.user) ?? null;
    const { location, address, state, lga } = useCurrentLocation();

    const syncLocation = async (latitude: number, longitude: number) => {
        const token = store.getState().auth?.token;
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        // Pick the most recently updated location record to keep coords current
        const locations: any[] = user?.location ?? [];
        const latest = [...locations].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];
        const locationId = latest?.id?.toString();

        const payload = { latitude, longitude, address, state, lga };
        try {
            if (locationId) {
                await axios.put(`${API_BASE_URL}/location/${locationId}`, payload, { headers });
            } else {
                await axios.post(`${API_BASE_URL}/locations`, payload, { headers });
            }
        } catch (err: any) {
            console.error('GPS sync failed:', err?.response?.data?.message || err?.message);
        }
    };

    useEffect(() => {
        saveFcmToken();
    }, []);

    useEffect(() => {
        const { latitude, longitude } = location?.coords ?? {};
        if (latitude && longitude) {
            syncLocation(latitude, longitude);
        }
    }, [location?.coords?.latitude]);

    const statsData = [
        { label: "Completed", value: user?.profile?.totalJobsCompleted || 0, icon: "check-circle", color: primaryColor, bg: primaryColor + '15' },
        { label: "Active", value: user?.profile?.totalJobsOngoing || 0, icon: "clock", color: primaryColor, bg: primaryColor + '15' },
        { label: "Cancelled", value: user?.profile?.totalJobsDeclined || 0, icon: "x-circle", color: backgroundColortwo, bg: backgroundColortwo + '15' },
    ];

    const earningsData = [
        { label: "Completed", value: formatAmount(user?.profile?.professional?.completedAmount || 0), icon: "trending-up", color: primaryColor },
        { label: "Pending", value: formatAmount(user?.profile?.professional?.pendingAmount || 0), icon: "clock", color: backgroundColortwo },
        { label: "Withdrawable", value: formatAmount(user?.profile?.professional?.availableWithdrawalAmount || 0), icon: "download", color: primaryColor },
        { label: "Rejected", value: formatAmount(user?.profile?.professional?.rejectedAmount || 0), icon: "alert-triangle", color: backgroundColortwo },
    ];

    return (
        <>
            {showmodal && (
                <SliderModalTemplate modalHeight={"60%"} showmodal={showmodal} setshowmodal={setshowmodal}>
                    <SlideupContent setshowmodal={setshowmodal} />
                </SliderModalTemplate>
            )}

            <ContainerTemplate>
                <HeaderComponent showSettings={false} />

                <ScrollView
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    <EmptyView height={8} />
                    {!bvnLoading && (
                        <VerificationBadge 
                            isVerified={isBVNVerified} 
                            onPress={() => !isBVNVerified && router.push('/bvnActivation')}
                            size="medium"
                        />
                    )}
                    {bvnLoading && (
                        <View className="flex-row items-center justify-center py-2">
                            <ActivityIndicator size="small" color={primaryColor} />
                            <Text className="ml-2" style={{ color: secondaryTextColor, fontSize: 12 }}>
                                Checking verification status...
                            </Text>
                        </View>
                    )}
                    <EmptyView height={14} />

                    <WalletCard
                        setshowmodal={setshowmodal}
                        showmodal={showmodal}
                        refreshTrigger={balanceRefreshTrigger}
                        setshowwithdraw={setshowwithdraw}
                        showwithdraw={showwithdraw}
                    />

                    {/* Stats Cards */}
                    <EmptyView height={18} />
                    <View style={{ flexDirection: "row", gap: 10 }}>
                        {statsData.map((stat) => (
                            <View key={stat.label} style={{ flex: 1, backgroundColor: cardBg, borderRadius: 14, padding: 14, alignItems: "center" }}>
                                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: stat.bg, alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                                    <Feather name={stat.icon as any} size={18} color={stat.color} />
                                </View>
                                <Text style={{ fontSize: 22, fontWeight: "700", color: stat.color }}>{stat.value}</Text>
                                <Text style={{ fontSize: 11, color: secondaryTextColor, marginTop: 2 }}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Pending Deliveries */}
                    <EmptyView height={22} />
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <Text style={{ fontSize: 15, fontWeight: "700", color: isDark ? "#F9FAFB" : "#111827" }}>Pending Deliveries</Text>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: primaryColor }} />
                    </View>
                    <CurrentDelivery balanceRefreshTrigger={balanceRefreshTrigger} />

                    {/* Earnings Section */}
                    <EmptyView height={22} />
                    <Text style={{ fontSize: 15, fontWeight: "700", color: isDark ? "#F9FAFB" : "#111827", marginBottom: 10 }}>Earnings Overview</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                        {earningsData.map((item) => (
                            <View key={item.label} style={{ width: "48%", backgroundColor: cardBg, borderRadius: 14, padding: 14 }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                    <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: item.color + "15", alignItems: "center", justifyContent: "center" }}>
                                        <Feather name={item.icon as any} size={14} color={item.color} />
                                    </View>
                                    <Text style={{ fontSize: 11, color: secondaryTextColor }}>{item.label}</Text>
                                </View>
                                <Text style={{ fontSize: 16, fontWeight: "700", color: isDark ? "#F9FAFB" : "#111827" }}>{item.value}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Recent Transactions */}
                    {recentTransactions.length > 0 && (
                        <View style={{ marginTop: 22 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                <Text style={{ fontSize: 15, fontWeight: "700", color: isDark ? "#F9FAFB" : "#111827" }}>Recent Transactions</Text>
                                <TouchableOpacity
                                    onPress={() => router.push("/billhistorylayout")}
                                    style={{ backgroundColor: primaryColor + "15", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}
                                >
                                    <Text style={{ color: primaryColor, fontSize: 11, fontWeight: "600" }}>View All</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ backgroundColor: cardBg, borderRadius: 14, padding: 14 }}>
                                {recentTransactions.slice(0, 4).map((txn: any, index: number) => (
                                    <View key={txn.id}>
                                        <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
                                            <View style={{
                                                width: 36, height: 36, borderRadius: 10,
                                                backgroundColor: (txn.type === "credit" ? successColor : errorColor) + '15',
                                                alignItems: "center", justifyContent: "center", marginRight: 12,
                                            }}>
                                                <Feather
                                                    name={txn.type === "credit" ? "arrow-down-left" : "arrow-up-right"}
                                                    size={16}
                                                    color={txn.type === "credit" ? successColor : errorColor}
                                                />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 13, fontWeight: "600", color: isDark ? "#F9FAFB" : "#111827" }}>
                                                    {txn.description || (txn.type === "credit" ? "Credit" : "Debit")}
                                                </Text>
                                                <Text style={{ fontSize: 10, color: secondaryTextColor, marginTop: 2 }}>
                                                    {new Date(txn.createdAt).toLocaleDateString()}
                                                </Text>
                                            </View>
                                            <Text style={{ fontSize: 14, fontWeight: "700", color: txn.type === "credit" ? successColor : errorColor }}>
                                                {txn.type === "credit" ? "+" : "-"}{Number(txn.amount).toLocaleString()}
                                            </Text>
                                        </View>
                                        {index < Math.min(recentTransactions.length, 4) - 1 && (
                                            <View style={{ backgroundColor: isDark ? "#374151" : "#F3F4F6", height: 1 }} />
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </ScrollView>
            </ContainerTemplate>

            {/* Withdraw Modal */}
            <SliderModalNoScrollview showmodal={showwithdraw} modalHeight={"85%"} setshowmodal={setshowwithdraw}>
                <TransferFund setshowmodal={setshowwithdraw} />
            </SliderModalNoScrollview>
        </>
    );
};
export default HomeDelivery;
const SlideupContent = ({ setshowmodal }: { setshowmodal: (value: boolean) => void }) => {
    const { theme } = useTheme();
    const { primaryColor, backgroundColortwo } = getColors(theme);
    const isDark = theme === "dark";

    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: backgroundColortwo + '15', alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <Feather name="shield-off" size={32} color={backgroundColortwo} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "700", color: isDark ? "#F9FAFB" : "#111827", textAlign: "center", marginBottom: 8 }}>
                Account Not Activated
            </Text>
            <Text style={{ fontSize: 13, color: isDark ? "#9CA3AF" : "#6B7280", textAlign: "center", lineHeight: 20, marginBottom: 32 }}>
                Please activate your account to become visible to clients and start receiving delivery orders.
            </Text>
            <View style={{ width: "100%" }}>
                <ButtonComponent
                    color={primaryColor}
                    text="Activate Now"
                    textcolor="#ffffff"
                    onPress={() => setshowmodal(true)}
                />
            </View>
        </View>
    );
};




// Status config
const getStatusConfig = (primaryColor: string, backgroundColortwo: string): Record<string, { color: string; label: string; progress: number }> => ({
    pending: { color: backgroundColortwo, label: "Pending", progress: 10 },
    awaitingPickup: { color: primaryColor, label: "Awaiting Pickup", progress: 30 },
    pickup: { color: primaryColor, label: "Picked Up", progress: 50 },
    onTheWay: { color: primaryColor, label: "On The Way", progress: 75 },
    delivered: { color: primaryColor, label: "Delivered", progress: 100 },
    rejected: { color: backgroundColortwo, label: "Rejected", progress: 0 },
});

interface ShippingCardProps {
    item: DeliveryData;
}

const ShippingCard: React.FC<ShippingCardProps> = ({ item }) => {
    const { theme } = useTheme();
    const { selectioncardColor, backgroundColor, primaryColor, secondaryTextColor, backgroundColortwo, successColor, errorColor } = getColors(theme);
    const isDark = theme === "dark";
    const cardBg = isDark ? "#1F2937" : "#FFFFFF";
    const toast = useToast();
    const [showModal, setShowModal] = useState(false);
    const [pickupAddress, setPickupAddress] = useState("");
    const [destinationAddress, setDestinationAddress] = useState("");

    const latPickup = item.productTransaction.product.pickupLocation.latitude || 0;
    const lngPickup = item.productTransaction.product.pickupLocation.longitude || 0;
    const latDest = item.dropoffLocation.latitude || 0;
    const lngDest = item.dropoffLocation.longitude || 0;
    const STATUS_CONFIG = getStatusConfig(primaryColor, backgroundColortwo);
    const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") return;

                const pickup = await Location.reverseGeocodeAsync({ latitude: latPickup, longitude: lngPickup });
                if (pickup.length > 0) {
                    setPickupAddress(`${pickup[0].name || ""} ${pickup[0].street || ""}, ${pickup[0].city || ""}`.trim());
                }
                if (latDest && lngDest) {
                    const dest = await Location.reverseGeocodeAsync({ latitude: latDest, longitude: lngDest });
                    if (dest.length > 0) {
                        setDestinationAddress(`${dest[0].name || ""} ${dest[0].street || ""}, ${dest[0].city || ""}`.trim());
                    }
                }
            } catch (err) {
                console.error("Error getting addresses:", err);
            }
        })();
    }, []);

    const mutationAccept = useMutation({
        mutationFn: acceptDeliveryFn,
        onSuccess: () => {
            toast.success("Order Accepted", "You have been assigned to this delivery");
            setShowModal(false);
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Failed to accept order";
            toast.error("Error", msg);
        },
    });

    const handleAcceptFn = () => mutationAccept.mutate(item.id);

    return (
        <>
            <TouchableOpacity
                onPress={() => setShowModal(true)}
                activeOpacity={0.7}
                style={{
                    backgroundColor: cardBg,
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 10,
                    shadowColor: "#000",
                    shadowOpacity: isDark ? 0.2 : 0.06,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 6,
                    elevation: 3,
                }}
            >
                {/* Header */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: primaryColor + "15", alignItems: "center", justifyContent: "center" }}>
                            <FontAwesome5 name="shipping-fast" size={14} color={primaryColor} />
                        </View>
                        <Text style={{ fontSize: 14, fontWeight: "700", color: isDark ? "#F9FAFB" : "#111827" }}>
                            Order #{String(item.id).slice(-6)}
                        </Text>
                    </View>
                    <View style={{ backgroundColor: statusInfo.color + "20", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 }}>
                        <Text style={{ color: statusInfo.color, fontSize: 11, fontWeight: "600" }}>{statusInfo.label}</Text>
                    </View>
                </View>

                {/* Route */}
                <View style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8 }}>
                        <View style={{ alignItems: "center", marginRight: 10, paddingTop: 2 }}>
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: primaryColor }} />
                            <View style={{ width: 1.5, height: 20, backgroundColor: isDark ? "#4B5563" : "#D1D5DB", marginVertical: 2 }} />
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: backgroundColortwo }} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, color: secondaryTextColor, marginBottom: 2 }}>Pickup</Text>
                            <Text style={{ fontSize: 13, fontWeight: "500", color: isDark ? "#E5E7EB" : "#374151", marginBottom: 10 }}>
                                {pickupAddress || "Loading address..."}
                            </Text>
                            <Text style={{ fontSize: 12, color: secondaryTextColor, marginBottom: 2 }}>Dropoff</Text>
                            <Text style={{ fontSize: 13, fontWeight: "500", color: isDark ? "#E5E7EB" : "#374151" }}>
                                {destinationAddress || "Loading address..."}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Footer: Fare + Progress */}
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Feather name="dollar-sign" size={14} color={primaryColor} />
                        <Text style={{ fontSize: 15, fontWeight: "700", color: primaryColor }}>₦{Number(item.cost).toLocaleString()}</Text>
                    </View>
                    {item.distance && typeof item.distance === 'number' && item.distance > 0 && (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                            <Feather name="navigation" size={12} color={secondaryTextColor} />
                            <Text style={{ fontSize: 11, color: secondaryTextColor }}>{item.distance.toFixed(1)} km</Text>
                        </View>
                    )}
                </View>

                {/* Progress Bar */}
                <View style={{ height: 4, backgroundColor: isDark ? "#374151" : "#E5E7EB", borderRadius: 2 }}>
                    <View style={{ width: `${statusInfo.progress}%`, height: "100%", backgroundColor: statusInfo.color, borderRadius: 2 }} />
                </View>
            </TouchableOpacity>

            {/* Accept / Decline Modal */}
            <Modal animationType="fade" transparent visible={showModal} onRequestClose={() => setShowModal(false)}>
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
                    <View style={{ backgroundColor: isDark ? "#1F2937" : "#FFFFFF", width: "85%", borderRadius: 20, padding: 24 }}>
                        {/* Modal Header */}
                        <View style={{ alignItems: "center", marginBottom: 20 }}>
                            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: primaryColor + "15", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                                <FontAwesome5 name="shipping-fast" size={22} color={primaryColor} />
                            </View>
                            <Text style={{ fontSize: 17, fontWeight: "700", color: isDark ? "#F9FAFB" : "#111827" }}>New Delivery Order</Text>
                            <Text style={{ fontSize: 12, color: secondaryTextColor, marginTop: 4 }}>Order #{String(item.id).slice(-6)}</Text>
                        </View>

                        {/* Delivery Fee — hero number rider cares about most */}
                        <View style={{
                            backgroundColor: primaryColor + '12',
                            borderWidth: 1.5,
                            borderColor: primaryColor,
                            borderRadius: 14,
                            padding: 16,
                            marginBottom: 14,
                            alignItems: "center",
                        }}>
                            <Text style={{ fontSize: 11, fontWeight: "700", color: primaryColor, letterSpacing: 0.8, marginBottom: 4 }}>
                                YOUR DELIVERY EARNINGS
                            </Text>
                            <Text style={{ fontSize: 28, fontWeight: "800", color: primaryColor }}>
                                ₦{Number(item.cost).toLocaleString()}
                            </Text>
                            <Text style={{ fontSize: 10, color: secondaryTextColor, marginTop: 4 }}>
                                Platform commission will be deducted at settlement
                            </Text>
                        </View>

                        {/* Order Details */}
                        <View style={{ backgroundColor: isDark ? "#111827" : "#F9FAFB", borderRadius: 12, padding: 14, marginBottom: 14 }}>
                            {/* Product info */}
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: isDark ? "#374151" : "#E5E7EB" }}>
                                <View style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: primaryColor + '15', alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                                    <Ionicons name="cube-outline" size={14} color={primaryColor} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 10, color: secondaryTextColor }}>PACKAGE</Text>
                                    <Text style={{ fontSize: 12, fontWeight: "600", color: isDark ? "#E5E7EB" : "#374151" }}>
                                        {item.productTransaction.product.name}
                                    </Text>
                                    <Text style={{ fontSize: 11, color: secondaryTextColor, marginTop: 2 }}>
                                        Qty: {item.productTransaction.quantity}  •  Value: ₦{Number(item.productTransaction.price).toLocaleString()}
                                    </Text>
                                </View>
                            </View>

                            {/* Pickup */}
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                                <View style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: primaryColor + '15', alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                                    <Ionicons name="location" size={14} color={primaryColor} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 10, color: secondaryTextColor }}>PICKUP</Text>
                                    <Text style={{ fontSize: 12, fontWeight: "500", color: isDark ? "#E5E7EB" : "#374151" }}>{pickupAddress || "Loading..."}</Text>
                                </View>
                            </View>

                            {/* Dropoff */}
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                                <View style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: backgroundColortwo + '15', alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                                    <Ionicons name="flag" size={14} color={backgroundColortwo} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 10, color: secondaryTextColor }}>DROPOFF</Text>
                                    <Text style={{ fontSize: 12, fontWeight: "500", color: isDark ? "#E5E7EB" : "#374151" }}>{destinationAddress || "Loading..."}</Text>
                                </View>
                            </View>

                            {/* Distance + expiry row */}
                            <View style={{ flexDirection: "row", gap: 10 }}>
                                {item.distance != null && (
                                    <View style={{ flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: isDark ? "#1F2937" : "#FFFFFF", borderRadius: 8, padding: 8, gap: 6 }}>
                                        <Feather name="navigation" size={12} color={secondaryTextColor} />
                                        <View>
                                            <Text style={{ fontSize: 9, color: secondaryTextColor }}>DISTANCE</Text>
                                            <Text style={{ fontSize: 12, fontWeight: "600", color: isDark ? "#E5E7EB" : "#374151" }}>
                                                {typeof item.distance === 'number' ? `${item.distance.toFixed(1)} km` : item.distance}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                                {item.expiresAt && (
                                    <View style={{ flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: isDark ? "#1F2937" : "#FFFFFF", borderRadius: 8, padding: 8, gap: 6 }}>
                                        <Feather name="clock" size={12} color={backgroundColortwo} />
                                        <View>
                                            <Text style={{ fontSize: 9, color: secondaryTextColor }}>EXPIRES</Text>
                                            <Text style={{ fontSize: 12, fontWeight: "600", color: backgroundColortwo }}>
                                                {new Date(item.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Actions */}
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <TouchableOpacity
                                onPress={() => setShowModal(false)}
                                style={{ flex: 1, backgroundColor: isDark ? "#374151" : "#F3F4F6", borderRadius: 12, paddingVertical: 14, alignItems: "center" }}
                            >
                                <Text style={{ fontSize: 14, fontWeight: "600", color: isDark ? "#F9FAFB" : "#374151" }}>Decline</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleAcceptFn}
                                disabled={mutationAccept.isPending}
                                style={{ flex: 1, backgroundColor: primaryColor, borderRadius: 12, paddingVertical: 14, alignItems: "center", opacity: mutationAccept.isPending ? 0.7 : 1 }}
                            >
                                <Text style={{ fontSize: 14, fontWeight: "600", color: "#FFFFFF" }}>
                                    {mutationAccept.isPending ? "Accepting..." : "Accept"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Close */}
                        <TouchableOpacity
                            onPress={() => setShowModal(false)}
                            style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: isDark ? "#374151" : "#F3F4F6", alignItems: "center", justifyContent: "center" }}
                        >
                            <Feather name="x" size={16} color={secondaryTextColor} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};

interface CurrentDeliveryProps {
    balanceRefreshTrigger: boolean;
}

const CurrentDelivery = ({ balanceRefreshTrigger }: CurrentDeliveryProps) => {
    const [data, setData] = useState<DeliveryData[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const { theme } = useTheme();
    const { secondaryTextColor, selectioncardColor } = getColors(theme);
    const isDark = theme === "dark";

    const mutation = useMutation({
        mutationFn: pendingdeliveryFn,
        onSuccess: async (response) => {
            if (response.status) {
                setData(response.data || []);
            } else {
                console.error("Pending deliveries fetch failed:", response.message || 'Unknown error');
            }
            setRefreshing(false);
        },
        onError: (error: any) => {
            console.error("Pending deliveries fetch failed:", error.message);
            setRefreshing(false);
        },
    });

    useEffect(() => {
        mutation.mutate();
    }, [balanceRefreshTrigger]);

    const onRefresh = () => {
        setRefreshing(true);
        mutation.mutate();
    };

    if (mutation.isPending && data.length === 0) {
        return <SectorSkeletonCard />;
    }

    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <ShippingCard item={item} />}
            scrollEnabled={false}
            ListEmptyComponent={
                <View style={{
                    backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                    borderRadius: 14,
                    padding: 24,
                    alignItems: "center",
                }}>
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: selectioncardColor, alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                        <FontAwesome5 name="shipping-fast" size={18} color={secondaryTextColor} />
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: isDark ? "#9CA3AF" : "#6B7280" }}>No pending deliveries</Text>
                    <Text style={{ fontSize: 11, color: secondaryTextColor, marginTop: 4, textAlign: "center" }}>New delivery orders will appear here</Text>
                </View>
            }
        />
    );
};