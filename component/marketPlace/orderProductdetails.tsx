import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { useMutation } from "@tanstack/react-query"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import RatingStar from "component/rating"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { useEffect, useState, type FC, useCallback, useMemo, memo } from "react"
import { View, Image, ActivityIndicator, TouchableOpacity, Text, StyleSheet, TextInput } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { getProductByTransactionFn } from "services/marketplaceServices"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

import { Modal, FlatList, Dimensions } from "react-native";
import { Order, ProductTransactionDetail } from "types/getProductByTrans"
import { confirmDeliverdFn, disputeOrderFn, enRouteToPickupFn, arrivedAtPickupFn, arrivedAtDropoffFn, PickupFn, confirmPickupFn, deliveredFn } from "services/deliveryServices"
import { UserDetailsComp } from "component/delivery/orderCard"
import { useToast } from "context/ToastContext"
import { formatNaira } from "utilizes/amountFormat"

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const placeholderImage = require("../../assets/samplework.png")

// Normalize status: backend may return 'pt_pending' (Prisma key) or 'pending' (mapped value)
const normalizeStatus = (status?: string) => status?.toLowerCase().replace(/^pt_/, '') || '';

const getStatusConfig = (status: string, primaryColor: string, backgroundColortwo: string) => {
    const s = normalizeStatus(status);
    switch (s) {
        case 'pending': return { bg: backgroundColortwo + '15', text: backgroundColortwo, icon: 'time-outline' as const, label: 'Pending' };
        case 'ordered': return { bg: primaryColor + '15', text: primaryColor, icon: 'cart-outline' as const, label: 'Ordered' };
        case 'delivered': return { bg: primaryColor + '15', text: primaryColor, icon: 'checkmark-circle-outline' as const, label: 'Delivered' };
        case 'disputed': return { bg: backgroundColortwo + '15', text: backgroundColortwo, icon: 'warning-outline' as const, label: 'Disputed' };
        case 'cancelled': return { bg: backgroundColortwo + '15', text: backgroundColortwo, icon: 'close-circle-outline' as const, label: 'Cancelled' };
        default: return { bg: backgroundColortwo + '15', text: backgroundColortwo, icon: 'help-circle-outline' as const, label: s || 'Unknown' };
    }
};

interface OrderProductDetailsProps { 
  id?: string | string[];
  onProductLoad?: (product: ProductTransactionDetail) => void;
}

const OrderProductDetails: FC<OrderProductDetailsProps> = memo(({ id, onProductLoad }) => {
    const router = useRouter();
    const { theme } = useTheme();
    const { primaryColor, selectioncardColor, backgroundColor, backgroundColortwo, successColor, errorColor } = getColors(theme);
    const toast = useToast();

    const isDark = theme === 'dark';
    const cardBg = isDark ? '#1F2937' : '#FFFFFF';
    const textPrimary = isDark ? '#F9FAFB' : '#111827';
    const textSecondary = isDark ? '#9CA3AF' : '#6B7280';
    const borderColor = isDark ? '#374151' : '#E5E7EB';

    const [productData, setProductData] = useState<ProductTransactionDetail | null>(null);
    const userId = useSelector((state: RootState) => state.auth?.user?.id);
    const [pickupAddress, setPickupAddress] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

    const [previewVisible, setPreviewVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [disputeReason, setDisputeReason] = useState('');
    const [disputeDescription, setDisputeDescription] = useState('');

    const openPreview = useCallback((index: number) => {
        setCurrentIndex(index);
        setPreviewVisible(true);
    }, []);
    const closePreview = useCallback(() => setPreviewVisible(false), []);

    // Fetch transaction data
    const mutation = useMutation({
        mutationFn: getProductByTransactionFn,
        onSuccess: (response) => {
            setProductData(response.data || null);
        },
        onError: (error: any) => {
            toast.error('Error', error?.message || 'Failed to load item details');
        },
    });

    const getId = useMemo(() => Number(Array.isArray(id) ? id?.[0] : id), [id]);

    useEffect(() => {
        if (!Number.isNaN(getId) && getId > 0) {
            mutation.mutate({ id: getId });
        }
    }, [getId]);

    // Parse images
    useEffect(() => {
        if (productData?.product?.images) {
            let parsed: string[] = [];
            if (Array.isArray(productData.product.images)) {
                parsed = productData.product.images;
            } else if (typeof productData.product.images === 'string') {
                try {
                    const temp = JSON.parse(productData.product.images);
                    parsed = Array.isArray(temp) ? temp : [productData.product.images];
                } catch {
                    parsed = [productData.product.images];
                }
            }
            setImages(parsed);
        }
    }, [productData]);

    // Reverse geocode pickup address via Nominatim
    useEffect(() => {
        const loc = productData?.product?.pickupLocation;
        if (!loc?.latitude || !loc?.longitude) return;
        (async () => {
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.latitude}&lon=${loc.longitude}`,
                    { headers: { 'User-Agent': 'AcepickApp/1.0' } }
                );
                const data = await res.json();
                if (data?.display_name) setPickupAddress(data.display_name);
            } catch { /* silent */ }
        })();
    }, [productData?.product?.pickupLocation]);

    // Confirm delivery mutation
    const confirmMutation = useMutation({
        mutationFn: () => confirmDeliverdFn(productData!.id),
        onSuccess: () => {
            toast.success('Delivery Confirmed', 'Payment has been released to the seller');
            mutation.mutate({ id: getId });
        },
        onError: (error: any) => {
            toast.error('Error', error?.message || 'Failed to confirm delivery');
        },
    });

    // Dispute mutation
    const disputeMutation = useMutation({
        mutationFn: disputeOrderFn,
        onSuccess: () => {
            toast.success('Dispute Raised', 'Your dispute has been submitted for review');
            setShowDisputeModal(false);
            setDisputeReason('');
            setDisputeDescription('');
            mutation.mutate({ id: getId });
        },
        onError: (error: any) => {
            toast.error('Dispute Failed', error?.message || 'Failed to raise dispute');
        },
    });

    const handleConfirmDelivery = () => {
        if (!productData) return;
        confirmMutation.mutate();
    };

    const handleRaiseDispute = () => {
        if (!disputeReason.trim()) {
            toast.error('Required', 'Please enter a reason for the dispute');
            return;
        }
        if (!disputeDescription.trim()) {
            toast.error('Required', 'Please describe the issue in detail');
            return;
        }
        disputeMutation.mutate({
            reason: disputeReason.trim(),
            description: disputeDescription.trim(),
            productTransactionId: productData!.id,
            partnerId: productData!.sellerId,
        });
    };

    const status = normalizeStatus(productData?.status);
    const statusConfig = productData?.status ? getStatusConfig(productData.status, primaryColor, backgroundColortwo) : null;
    const isBuyer = productData?.buyerId === userId;
    const canConfirm = isBuyer && (status === 'ordered' || status === 'delivered');
    const canDispute = isBuyer && (status === 'ordered' || status === 'delivered');

    if (mutation.isPending) {
        return (
            <ContainerTemplate>
                <View className="justify-center items-center h-full">
                    <ActivityIndicator size="large" color={primaryColor} />
                </View>
            </ContainerTemplate>
        );
    }

    return (
        <>
            <ContainerTemplate>
                <HeaderComponent title={"Order Details"} />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    {/* ── Product Images ── */}
                    {images.length > 0 ? (
                        images.length === 1 ? (
                            <TouchableOpacity onPress={() => openPreview(0)}>
                                <Image
                                    source={imageErrors[0] ? placeholderImage : { uri: images[0] }}
                                    resizeMode="cover"
                                    style={{ width: '100%', height: 220, borderRadius: 16, marginTop: 12 }}
                                    defaultSource={placeholderImage}
                                    onError={() => setImageErrors(prev => ({ ...prev, 0: true }))}
                                />
                            </TouchableOpacity>
                        ) : (
                            <View style={{ flexDirection: 'row', width: '100%', height: 220, marginTop: 12, gap: 4 }}>
                                <TouchableOpacity style={{ flex: 3, borderRadius: 16, overflow: 'hidden' }} onPress={() => openPreview(0)}>
                                    <Image source={{ uri: images[0] }} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
                                </TouchableOpacity>
                                <View style={{ flex: 2, gap: 4 }}>
                                    {images.slice(1, 3).map((img, i) => (
                                        <TouchableOpacity key={i + 1} onPress={() => openPreview(i + 1)} style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}>
                                            <Image
                                                source={imageErrors[i + 1] ? placeholderImage : { uri: img }}
                                                resizeMode="cover"
                                                style={{ width: '100%', height: '100%' }}
                                                defaultSource={placeholderImage}
                                                onError={() => setImageErrors(prev => ({ ...prev, [i + 1]: true }))}
                                            />
                                            {i === 1 && images.length > 3 && (
                                                <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', borderRadius: 12 }}>
                                                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>+{images.length - 3}</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )
                    ) : (
                        <Image resizeMode="cover" style={{ width: '100%', height: 220, borderRadius: 16, marginTop: 12 }} source={placeholderImage} />
                    )}

                    {/* ── Product Info Card ── */}
                    <View style={{ backgroundColor: cardBg, borderRadius: 16, marginTop: 16, padding: 16, borderWidth: 1, borderColor }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View style={{ flex: 1, marginRight: 12 }}>
                                <Text style={{ color: textPrimary, fontSize: 18, fontWeight: '700' }}>{productData?.product?.name}</Text>
                                {productData?.product?.category && (
                                    <Text style={{ color: primaryColor, fontSize: 12, fontWeight: '600', marginTop: 2 }}>{productData.product.category.name}</Text>
                                )}
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ color: primaryColor, fontSize: 18, fontWeight: '700' }}>{formatNaira(Number(productData?.price || 0))}</Text>
                                <Text style={{ color: textSecondary, fontSize: 12, marginTop: 2 }}>Qty: {productData?.quantity}</Text>
                            </View>
                        </View>

                        {/* Status Badge */}
                        {statusConfig && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: statusConfig.bg, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 }}>
                                <Ionicons name={statusConfig.icon} size={14} color={statusConfig.text} />
                                <Text style={{ color: statusConfig.text, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' }}>{statusConfig.label}</Text>
                            </View>
                        )}
                    </View>

                    {/* ── Description Card ── */}
                    {productData?.product?.description ? (
                        <View style={{ backgroundColor: cardBg, borderRadius: 16, marginTop: 12, padding: 16, borderWidth: 1, borderColor }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <Ionicons name="document-text-outline" size={16} color={primaryColor} />
                                <Text style={{ color: textPrimary, fontSize: 14, fontWeight: '600' }}>Description</Text>
                            </View>
                            <Text style={{ color: textSecondary, fontSize: 13, lineHeight: 20 }}>{productData.product.description}</Text>
                        </View>
                    ) : null}

                    {/* ── Location Card ── */}
                    <View style={{ backgroundColor: cardBg, borderRadius: 16, marginTop: 12, padding: 16, borderWidth: 1, borderColor }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Ionicons name="location-outline" size={16} color={primaryColor} />
                            <Text style={{ color: textPrimary, fontSize: 14, fontWeight: '600' }}>Pickup Location</Text>
                        </View>
                        <Text style={{ color: textSecondary, fontSize: 13 }}>
                            {pickupAddress || productData?.product?.pickupLocation?.address || 'Fetching address...'}
                        </Text>
                        {productData?.product?.pickupLocation?.lga && (
                            <Text style={{ color: textSecondary, fontSize: 12, marginTop: 4 }}>
                                {productData.product.pickupLocation.lga}, {productData.product.pickupLocation.state}
                            </Text>
                        )}
                    </View>

                    {/* ── Order Method Badge ── */}
                    <View style={{ backgroundColor: cardBg, borderRadius: 16, marginTop: 12, padding: 16, borderWidth: 1, borderColor }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons
                                name={productData?.orderMethod === 'delivery' ? 'bicycle-outline' : 'walk-outline'}
                                size={16} color={primaryColor}
                            />
                            <Text style={{ color: textPrimary, fontSize: 14, fontWeight: '600' }}>
                                {productData?.orderMethod === 'delivery' ? 'Delivery' : 'Self Pickup'}
                            </Text>
                        </View>
                    </View>

                    {/* ── Transaction Info ── */}
                    {productData?.transaction && (
                        <View style={{ backgroundColor: cardBg, borderRadius: 16, marginTop: 12, padding: 16, borderWidth: 1, borderColor }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <Ionicons name="receipt-outline" size={16} color={primaryColor} />
                                <Text style={{ color: textPrimary, fontSize: 14, fontWeight: '600' }}>Payment Info</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                <Text style={{ color: textSecondary, fontSize: 13 }}>Amount</Text>
                                <Text style={{ color: textPrimary, fontSize: 13, fontWeight: '600' }}>{formatNaira(Number(productData.transaction.amount))}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                <Text style={{ color: textSecondary, fontSize: 13 }}>Status</Text>
                                <Text style={{ color: normalizeStatus(productData.transaction.status) === 'completed' ? primaryColor : backgroundColortwo, fontSize: 13, fontWeight: '600', textTransform: 'capitalize' }}>
                                    {normalizeStatus(productData.transaction.status)}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ color: textSecondary, fontSize: 13 }}>Reference</Text>
                                <Text style={{ color: textSecondary, fontSize: 11 }}>{productData.transaction.reference}</Text>
                            </View>
                        </View>
                    )}

                    {/* ── Seller Card ── */}
                    <View style={{ marginTop: 12 }}>
                        <SellerDetails user={productData?.seller} />
                    </View>

                    {/* ── Delivery Details Button ── */}
                    {productData?.order && (
                        <TouchableOpacity
                            onPress={() => setShowDeliveryModal(true)}
                            style={{ backgroundColor: primaryColor, borderRadius: 14, padding: 16, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            <Ionicons name="car-outline" size={20} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>View Delivery Details</Text>
                        </TouchableOpacity>
                    )}

                    {/* ── Action Buttons ── */}
                    {(canConfirm || canDispute) && (
                        <View style={{ marginTop: 16, gap: 10 }}>
                            {canConfirm && (
                                <TouchableOpacity
                                    onPress={handleConfirmDelivery}
                                    disabled={confirmMutation.isPending}
                                    style={{ backgroundColor: primaryColor, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: confirmMutation.isPending ? 0.6 : 1 }}
                                >
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
                                        {confirmMutation.isPending ? 'Confirming...' : 'Confirm Received & Release Payment'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {canDispute && (
                                <TouchableOpacity
                                    onPress={() => setShowDisputeModal(true)}
                                    style={{ backgroundColor: backgroundColortwo, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                >
                                    <Ionicons name="warning-outline" size={20} color="#fff" />
                                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Raise Dispute</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Disputed notice */}
                    {status === 'disputed' && (
                        <View style={{ backgroundColor: backgroundColortwo + '15', borderRadius: 14, padding: 16, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Ionicons name="alert-circle" size={24} color={backgroundColortwo} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: backgroundColortwo, fontSize: 14, fontWeight: '600' }}>Dispute In Progress</Text>
                                <Text style={{ color: backgroundColortwo, fontSize: 12, marginTop: 2 }}>Your dispute is being reviewed by our team.</Text>
                            </View>
                        </View>
                    )}

                    <EmptyView height={20} />
                </ScrollView>

                {/* ── Image Preview Modal ── */}
                <Modal visible={previewVisible} transparent animationType="fade">
                    <View style={{ flex: 1, backgroundColor: 'black' }}>
                        <FlatList
                            data={images}
                            horizontal
                            pagingEnabled
                            initialScrollIndex={currentIndex}
                            getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item: imgUri }) => (
                                <Image source={{ uri: imgUri }} style={{ width: screenWidth, height: screenHeight, resizeMode: 'contain' }} />
                            )}
                        />
                        <TouchableOpacity
                            onPress={closePreview}
                            style={{ position: 'absolute', top: 50, right: 20, backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 20 }}
                        >
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </Modal>

                {/* ── Delivery Modal ── */}
                <Modal animationType="slide" transparent visible={showDeliveryModal} onRequestClose={() => setShowDeliveryModal(false)}>
                    <View style={styles.overlay}>
                        <View style={[styles.modalBox, { backgroundColor }]}>
                            {productData?.order && <DeliveryTracker item={productData.order} />}
                            <TouchableOpacity style={styles.closeButton} onPress={() => setShowDeliveryModal(false)}>
                                <FontAwesome5 color={backgroundColortwo} size={24} name="times-circle" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* ── Dispute Modal ── */}
                <Modal animationType="slide" transparent visible={showDisputeModal} onRequestClose={() => setShowDisputeModal(false)}>
                    <View style={styles.overlay}>
                        <View style={[styles.disputeBox, { backgroundColor }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <Text style={{ color: textPrimary, fontSize: 18, fontWeight: '700' }}>Raise Dispute</Text>
                                <TouchableOpacity onPress={() => setShowDisputeModal(false)}>
                                    <Ionicons name="close" size={24} color={textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <Text style={{ color: textSecondary, fontSize: 13, marginBottom: 16 }}>
                                Please explain the issue with your order. Our team will review and resolve it.
                            </Text>

                            <Text style={{ color: textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>Reason</Text>
                            <TextInput
                                value={disputeReason}
                                onChangeText={setDisputeReason}
                                placeholder="e.g. Wrong item, Damaged product..."
                                placeholderTextColor={textSecondary}
                                style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6', borderRadius: 12, padding: 14, color: textPrimary, fontSize: 14, marginBottom: 12, borderWidth: 1, borderColor }}
                            />

                            <Text style={{ color: textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>Description</Text>
                            <TextInput
                                value={disputeDescription}
                                onChangeText={setDisputeDescription}
                                placeholder="Describe the issue in detail..."
                                placeholderTextColor={textSecondary}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6', borderRadius: 12, padding: 14, color: textPrimary, fontSize: 14, marginBottom: 16, minHeight: 100, borderWidth: 1, borderColor }}
                            />

                            <TouchableOpacity
                                onPress={handleRaiseDispute}
                                disabled={disputeMutation.isPending}
                                style={{ backgroundColor: backgroundColortwo, borderRadius: 12, padding: 16, alignItems: 'center', opacity: disputeMutation.isPending ? 0.6 : 1 }}
                            >
                                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
                                    {disputeMutation.isPending ? 'Submitting...' : 'Submit Dispute'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </ContainerTemplate>
        </>
    )
})
export default OrderProductDetails

const SellerDetails = ({ user }: any) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { selectioncardColor, primaryColor, backgroundColortwo } = getColors(theme);
    const textPrimary = isDark ? '#F9FAFB' : '#111827';
    const borderColor = isDark ? '#374151' : '#E5E7EB';

    const avatar: string = user?.profile?.avatar || '';
    const clientName: string = `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim() || 'Seller';
    const numberOfStars: number = user?.profile?.rate || 0;
    const userIDprofessionalId = { userId: user?.id, professionalId: '' };
    const router = useRouter();

    return (
        <View style={{ backgroundColor: selectioncardColor, borderRadius: 16, padding: 14, borderWidth: 1, borderColor }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Ionicons name="storefront-outline" size={16} color={primaryColor} />
                <Text style={{ color: textPrimary, fontSize: 14, fontWeight: '600' }}>Seller</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: primaryColor + '15', overflow: 'hidden' }}>
                        <Image resizeMode="cover" style={{ width: 44, height: 44, borderRadius: 22 }} source={{ uri: avatar }} />
                    </View>
                    <View>
                        <Text style={{ color: textPrimary, fontSize: 14, fontWeight: '600' }}>{clientName}</Text>
                        <RatingStar numberOfStars={numberOfStars} />
                    </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={{ backgroundColor: backgroundColortwo, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }}>
                        <FontAwesome5 color="#fff" name="phone" size={14} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push(`/mainchat/${JSON.stringify(userIDprofessionalId)}`)} style={{ backgroundColor: primaryColor, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="chatbubbles-sharp" color="#fff" size={18} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const statusFlow = [
    { value: "accepted", label: "Rider Accepted" },
    { value: "picked_up", label: "Rider Picked Up" },
    { value: "confirm_pickup", label: "Seller Confirmed Pickup" },
    { value: "in_transit", label: "Rider In Transit" },
    { value: "delivered", label: "Rider Delivered" },
    { value: "confirm_delivery", label: "Buyer Confirmed Delivery" },
    { value: "missed", label: "Missed" },
];

const statusActions: Record<string, { label: string; fn: (id: number) => Promise<any> }> = {
    accepted: { label: "En Route to Pickup", fn: enRouteToPickupFn },
    en_route_to_pickup: { label: "Arrived at Pickup", fn: arrivedAtPickupFn },
    arrived_at_pickup: { label: "Mark Pickup", fn: PickupFn },
    picked_up: { label: "Confirm Pickup", fn: confirmPickupFn },
    confirm_pickup: { label: "Arrived at Dropoff", fn: arrivedAtDropoffFn },
    in_transit: { label: "Arrived at Dropoff", fn: arrivedAtDropoffFn },
    arrived_at_dropoff: { label: "Mark Delivered", fn: deliveredFn },
    delivered: { label: "Confirm Delivery", fn: confirmDeliverdFn },
    confirm_delivery: { label: "Completed", fn: async () => {} },
    missed: { label: "Missed", fn: async () => {} },
    cancelled: { label: "Cancelled", fn: async () => {} },
};

const statusColors: Record<string, { bg: string; text: string }> = {
    pending:          { bg: '#FEF3C7', text: '#92400E' },
    accepted:         { bg: '#DBEAFE', text: '#1E40AF' },
    en_route_to_pickup: { bg: '#E0E7FF', text: '#3730A3' },
    arrived_at_pickup:  { bg: '#EDE9FE', text: '#5B21B6' },
    picked_up:        { bg: '#F3E8FF', text: '#7C3AED' },
    confirm_pickup:   { bg: '#CCFBF1', text: '#115E59' },
    in_transit:       { bg: '#FEF9C3', text: '#854D0E' },
    arrived_at_dropoff: { bg: '#D1FAE5', text: '#065F46' },
    delivered:        { bg: '#BBF7D0', text: '#166534' },
    confirm_delivery: { bg: '#DCFCE7', text: '#14532D' },
    cancelled:        { bg: '#FEE2E2', text: '#991B1B' },
};

interface ShippingCardProps {
    item: Order;
}

const DeliveryTracker = ({ item }: ShippingCardProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { primaryColor } = getColors(theme);
    const textPrimary = isDark ? '#F9FAFB' : '#111827';
    const textSecondary = isDark ? '#9CA3AF' : '#6B7280';
    const [dropAddress, setDropAddress] = useState('');

    const mutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            statusActions[status].fn(id),
        onSuccess: (_data, variables) => {
            console.log("Status updated:", variables.status);
        },
        onError: (err: any) => {
            console.error("Failed to update delivery:", err.message);
        },
    });

    const getNextStatus = (current: string) => {
        const idx = statusFlow.findIndex((s) => s.value === current);
        if (idx !== -1 && idx < statusFlow.length - 1) {
            return { value: statusFlow[idx + 1].value, label: statusFlow[idx + 1].label };
        }
        return null;
    };

    const handleAction = () => {
        const next = getNextStatus(item.status);
        if (next && statusActions[next.value]) {
            mutation.mutate({ id: item.id, status: next.value });
        }
    };

    const nextStatus = getNextStatus(item.status);
    const currentStatusColor = statusColors[item.status] || { bg: '#F3F4F6', text: '#6B7280' };

    useEffect(() => {
        const loc = item?.dropoffLocation;
        if (!loc?.latitude || !loc?.longitude) return;
        (async () => {
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.latitude}&lon=${loc.longitude}`,
                    { headers: { 'User-Agent': 'AcepickApp/1.0' } }
                );
                const data = await res.json();
                if (data?.display_name) setDropAddress(data.display_name);
            } catch { /* silent */ }
        })();
    }, [item.dropoffLocation]);

    const currentStepIdx = statusFlow.findIndex(s => s.value === item.status);

    return (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ color: textPrimary, fontSize: 16, fontWeight: '700' }}>Delivery #{item.id}</Text>
                <View style={{ backgroundColor: currentStatusColor.bg, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 }}>
                    <Text style={{ color: currentStatusColor.text, fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
                        {item.status?.replace(/_/g, ' ')}
                    </Text>
                </View>
            </View>

            {/* Status Timeline */}
            <View style={{ marginBottom: 16 }}>
                {statusFlow.slice(0, -1).map((step, index) => {
                    const isCompleted = index <= currentStepIdx;
                    const isCurrent = index === currentStepIdx;
                    return (
                        <View key={step.value} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: index < statusFlow.length - 2 ? 0 : 0 }}>
                            <View style={{ alignItems: 'center', width: 24 }}>
                                <View style={{
                                    width: 20, height: 20, borderRadius: 10,
                                    backgroundColor: isCompleted ? primaryColor : isDark ? '#374151' : '#E5E7EB',
                                    justifyContent: 'center', alignItems: 'center',
                                    borderWidth: isCurrent ? 3 : 0, borderColor: isCurrent ? primaryColor + '40' : 'transparent',
                                }}>
                                    {isCompleted && <Ionicons name="checkmark" size={12} color="#fff" />}
                                </View>
                                {index < statusFlow.length - 2 && (
                                    <View style={{ width: 2, height: 20, backgroundColor: isCompleted ? primaryColor : isDark ? '#374151' : '#E5E7EB' }} />
                                )}
                            </View>
                            <Text style={{ marginLeft: 10, fontSize: 13, fontWeight: isCurrent ? '600' : '400', color: isCompleted ? textPrimary : textSecondary, marginTop: 1 }}>
                                {step.label}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* Dropoff Location */}
            <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Ionicons name="location-outline" size={14} color={primaryColor} />
                    <Text style={{ color: textPrimary, fontSize: 13, fontWeight: '600' }}>Dropoff Location</Text>
                </View>
                <Text style={{ color: textSecondary, fontSize: 12, marginLeft: 20 }}>{dropAddress || 'Fetching address...'}</Text>
            </View>

            {/* Distance & Cost */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                {item.distance !== undefined && (
                    <View style={{ flex: 1, backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderRadius: 12, padding: 12, alignItems: 'center' }}>
                        <Ionicons name="navigate-outline" size={18} color={primaryColor} />
                        <Text style={{ color: textSecondary, fontSize: 11, marginTop: 4 }}>Distance</Text>
                        <Text style={{ color: textPrimary, fontSize: 14, fontWeight: '600' }}>{item.distance} km</Text>
                    </View>
                )}
                {item.cost && (
                    <View style={{ flex: 1, backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderRadius: 12, padding: 12, alignItems: 'center' }}>
                        <Ionicons name="cash-outline" size={18} color={primaryColor} />
                        <Text style={{ color: textSecondary, fontSize: 11, marginTop: 4 }}>Delivery Fee</Text>
                        <Text style={{ color: textPrimary, fontSize: 14, fontWeight: '600' }}>{formatNaira(Number(item.cost))}</Text>
                    </View>
                )}
            </View>

            {/* Rider */}
            {item.rider && (
                <View style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <Ionicons name="bicycle-outline" size={14} color={primaryColor} />
                        <Text style={{ color: textPrimary, fontSize: 13, fontWeight: '600' }}>Rider</Text>
                    </View>
                    <UserDetailsComp
                        firstName={item.rider.profile.firstName}
                        lastName={item.rider.profile.lastName}
                        userId={item.riderId}
                        avatar={item.rider.profile.avatar}
                    />
                </View>
            )}

            {/* Action Button */}
            {item.status !== "cancelled" && item.status !== "confirm_delivery" && nextStatus && (
                <TouchableOpacity
                    onPress={handleAction}
                    disabled={mutation.isPending}
                    style={{
                        backgroundColor: primaryColor,
                        padding: 14,
                        borderRadius: 12,
                        alignItems: 'center',
                        marginTop: 8,
                        opacity: mutation.isPending ? 0.6 : 1,
                    }}
                >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                        {mutation.isPending ? 'Updating...' : `Move to ${nextStatus.label}`}
                    </Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        width: '85%',
        maxHeight: '80%',
        padding: 20,
        borderRadius: 16,
    },
    disputeBox: {
        width: '90%',
        padding: 20,
        borderRadius: 16,
    },
    closeButton: {
        right: 8,
        top: 8,
        position: 'absolute',
    },
});