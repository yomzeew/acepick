import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { useMutation } from "@tanstack/react-query"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import RatingStar from "component/rating"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import React, { useEffect, useState, type FC, useCallback, useMemo, memo } from "react"
import { View, Image, ActivityIndicator, TouchableOpacity, Text, StyleSheet, TextInput, Linking, Alert } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { getProductByTransactionFn } from "services/marketplaceServices"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

import { Modal, FlatList, Dimensions } from "react-native";
import { Order, ProductTransactionDetail } from "types/getProductByTrans"
import { confirmDeliverdFn, disputeOrderFn, sellerAcceptOrderFn, sellerRejectOrderFn, sellerMarkReadyFn, sellerHandOverFn, buyerCancelOrderFn, giveRatingForOrderFn, requestReturnFn, retryRiderSearchFn } from "services/deliveryServices"
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
        case 'pending':
            return { bg: '#FEF3C715', text: '#D97706', icon: 'time-outline' as const, label: 'Pending' };
        case 'ordered':
            return { bg: primaryColor + '18', text: primaryColor, icon: 'cart-outline' as const, label: 'Ordered' };
        case 'accepted_by_seller':
            return { bg: '#DBEAFE', text: '#1D4ED8', icon: 'checkmark-circle-outline' as const, label: 'Accepted' };
        case 'rejected_by_seller':
            return { bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle-outline' as const, label: 'Rejected' };
        case 'ready_for_delivery':
            return { bg: '#EDE9FE', text: '#7C3AED', icon: 'cube-outline' as const, label: 'Ready for Delivery' };
        case 'awaiting_confirmation':
            return { bg: '#FEF9C3', text: '#A16207', icon: 'hourglass-outline' as const, label: 'Awaiting Completion' };
        case 'completed':
            return { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-done-circle-outline' as const, label: 'Completed' };
        case 'delivered':
            return { bg: '#DCFCE7', text: '#16A34A', icon: 'home-outline' as const, label: 'Delivered' };
        case 'return_requested':
            return { bg: '#FFF7ED', text: '#C2410C', icon: 'return-down-back-outline' as const, label: 'Return Requested' };
        case 'returned':
            return { bg: '#F3F4F6', text: '#374151', icon: 'refresh-outline' as const, label: 'Returned' };
        case 'disputed':
            return { bg: '#FEF3C7', text: '#B45309', icon: 'warning-outline' as const, label: 'Disputed' };
        case 'cancelled':
            return { bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle-outline' as const, label: 'Cancelled' };
        default:
            return { bg: '#F3F4F6', text: '#6B7280', icon: 'ellipse-outline' as const, label: s.replace(/_/g, ' ') || 'Unknown' };
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
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [hasRated, setHasRated] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnReason, setReturnReason] = useState('');
    const [returnDescription, setReturnDescription] = useState('');

    const openPreview = useCallback((index: number) => {
        setCurrentIndex(index);
        setPreviewVisible(true);
    }, []);
    const closePreview = useCallback(() => setPreviewVisible(false), []);

    // Fetch transaction data
    const mutation = useMutation({
        mutationFn: getProductByTransactionFn,
        onSuccess: (response) => {
            console.log('Order Product Details Data:', response.data);
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

    const refresh = () => mutation.mutate({ id: getId });

    // ── Seller mutations ──
    const sellerAcceptMutation = useMutation({
        mutationFn: () => sellerAcceptOrderFn(productData!.id),
        onSuccess: () => { toast.success('Order Accepted', 'Buyer has been notified.'); refresh(); },
        onError: (e: any) => toast.error('Failed', e?.message || 'Could not accept order'),
    });
    const sellerRejectMutation = useMutation({
        mutationFn: (reason: string) => sellerRejectOrderFn({ id: productData!.id, reason }),
        onSuccess: () => {
            toast.success('Order Rejected', 'Buyer has been refunded.');
            setShowRejectModal(false);
            setRejectReason('');
            refresh();
        },
        onError: (e: any) => toast.error('Failed', e?.message || 'Could not reject order'),
    });
    const sellerMarkReadyMutation = useMutation({
        mutationFn: () => sellerMarkReadyFn(productData!.id),
        onSuccess: () => { toast.success('Marked Ready', 'Buyer notified that item is ready.'); refresh(); },
        onError: (e: any) => toast.error('Failed', e?.message || 'Could not mark ready'),
    });
    const sellerHandOverMutation = useMutation({
        mutationFn: () => sellerHandOverFn(productData!.id),
        onSuccess: () => { toast.success('Handover Recorded', 'Buyer has been asked to confirm receipt.'); refresh(); },
        onError: (e: any) => toast.error('Failed', e?.message || 'Could not record handover'),
    });

    // ── Buyer mutations ──
    const confirmMutation = useMutation({
        mutationFn: () => confirmDeliverdFn(productData!.id),
        onSuccess: () => {
            toast.success('Confirmed!', 'Payment has been released to the seller.');
            refresh();
        },
        onError: (error: any) => {
            toast.error('Error', error?.message || 'Failed to confirm');
        },
    });

    // ── Cancel mutation ──
    const cancelMutation = useMutation({
        mutationFn: () => buyerCancelOrderFn(productData!.id),
        onSuccess: () => {
            toast.success('Cancelled', 'Your order has been cancelled and payment refunded to your wallet.');
            setShowCancelModal(false);
            refresh();
        },
        onError: (e: any) => toast.error('Failed', e?.message || 'Could not cancel order'),
    });

    // ── Rating mutation ──
    const ratingMutation = useMutation({
        mutationFn: () => giveRatingForOrderFn(
            productData?.order
                ? { rating: selectedRating, orderId: productData.order.id }
                : { rating: selectedRating, sellerId: productData!.sellerId }
        ),
        onSuccess: () => {
            toast.success('Thanks!', 'Your rating has been submitted.');
            setShowRatingModal(false);
            setHasRated(true);
        },
        onError: (e: any) => toast.error('Failed', e?.message || 'Could not submit rating'),
    });

    // ── Return request mutation ──
    const returnMutation = useMutation({
        mutationFn: () => requestReturnFn({
            reason: returnReason.trim(),
            description: returnDescription.trim(),
            productTransactionId: productData!.id,
        }),
        onSuccess: () => {
            toast.success('Return Requested', 'Your return request has been submitted.');
            setShowReturnModal(false);
            setReturnReason('');
            setReturnDescription('');
            refresh();
        },
        onError: (e: any) => toast.error('Failed', e?.message || 'Could not submit return request'),
    });

    // ── Retry rider mutation (expired delivery orders) ──
    const retryRiderMutation = useMutation({
        mutationFn: () => retryRiderSearchFn(productData!.order!.id),
        onSuccess: () => {
            toast.success('Searching…', 'Looking for a nearby rider for your order.');
            refresh();
        },
        onError: (e: any) => toast.error('Failed', e?.message || 'Could not retry rider search'),
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
    const isSeller = !isBuyer && productData?.sellerId === userId;
    const isSelfPickup = productData?.orderMethod === 'self_pickup';
    const isDeliveryOrder = productData?.orderMethod === 'delivery';
    const orderStatus = normalizeStatus(productData?.order?.status);
    const isOrderDelivered = orderStatus === 'delivered';

    // Seller action visibility
    const sellerCanAccept    = isSeller && status === 'ordered';
    const sellerCanMarkReady = isSeller && status === 'accepted_by_seller';
    const sellerCanHandOver  = isSeller && isSelfPickup && status === 'ready_for_delivery';

    // Buyer confirm: self-pickup waits for seller handover; delivery waits for rider delivery
    const canConfirm = isBuyer && (
        (isSelfPickup && status === 'awaiting_confirmation') ||
        (isDeliveryOrder && status === 'ordered' && isOrderDelivered)
    );
    const canDispute = canConfirm;

    // Buyer can cancel before seller marks ready (and before rider assigned)
    const canCancel = isBuyer && ['ordered', 'accepted_by_seller'].includes(status) &&
        (!productData?.order || ['pending', 'paid'].includes(orderStatus));

    // Buyer can rate after completion (only once)
    const canRate = isBuyer && status === 'completed' && !hasRated;

    // Buyer can request return within 7 days of completion (use updatedAt as completion timestamp)
    const completedAt = productData?.updatedAt ? new Date(productData.updatedAt) : null;
    const returnWindowOpen = completedAt
        ? (Date.now() - completedAt.getTime()) < 7 * 24 * 60 * 60 * 1000
        : false;
    const canReturn = isBuyer && status === 'completed' && returnWindowOpen;

    // Show retry for expired delivery orders
    const isExpired = isDeliveryOrder && orderStatus === 'expired';

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
                <HeaderComponent
                  title={"Order Details"}
                  fallback="/(Authenticated)/(marketplace)/myItemsLayout?tab=Bought"
                />

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

                    {/* ── Seller Actions ── */}
                    {(sellerCanAccept || sellerCanMarkReady || sellerCanHandOver) && (
                        <View style={{ marginTop: 16, gap: 10 }}>
                            {sellerCanAccept && (
                                <View style={{ gap: 10 }}>
                                    <TouchableOpacity
                                        onPress={() => sellerAcceptMutation.mutate()}
                                        disabled={sellerAcceptMutation.isPending || sellerRejectMutation.isPending}
                                        style={{ backgroundColor: '#10B981', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: sellerAcceptMutation.isPending ? 0.6 : 1 }}
                                    >
                                        {sellerAcceptMutation.isPending
                                            ? <ActivityIndicator size="small" color="#fff" />
                                            : <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />}
                                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                                            {sellerAcceptMutation.isPending ? 'Accepting…' : 'Accept Order'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setShowRejectModal(true)}
                                        disabled={sellerAcceptMutation.isPending}
                                        style={{ backgroundColor: backgroundColortwo, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                    >
                                        <Ionicons name="close-circle-outline" size={20} color="#fff" />
                                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Reject Order</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            {sellerCanMarkReady && (
                                <TouchableOpacity
                                    onPress={() => sellerMarkReadyMutation.mutate()}
                                    disabled={sellerMarkReadyMutation.isPending}
                                    style={{ backgroundColor: primaryColor, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: sellerMarkReadyMutation.isPending ? 0.6 : 1 }}
                                >
                                    {sellerMarkReadyMutation.isPending
                                        ? <ActivityIndicator size="small" color="#fff" />
                                        : <Ionicons name="cube-outline" size={20} color="#fff" />}
                                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                                        {sellerMarkReadyMutation.isPending ? 'Updating…' : isSelfPickup ? 'Item is Ready — Set Meetup' : 'Item is Ready for Rider'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {sellerCanHandOver && (
                                <TouchableOpacity
                                    onPress={() => sellerHandOverMutation.mutate()}
                                    disabled={sellerHandOverMutation.isPending}
                                    style={{ backgroundColor: '#7C3AED', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: sellerHandOverMutation.isPending ? 0.6 : 1 }}
                                >
                                    {sellerHandOverMutation.isPending
                                        ? <ActivityIndicator size="small" color="#fff" />
                                        : <Ionicons name="hand-right-outline" size={20} color="#fff" />}
                                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                                        {sellerHandOverMutation.isPending ? 'Recording…' : "I've Handed Over to Buyer"}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* ── Buyer Actions ── */}
                    {(canConfirm || canDispute) && (
                        <View style={{ marginTop: 16, gap: 10 }}>
                            {canConfirm && (
                                <TouchableOpacity
                                    onPress={() => confirmMutation.mutate()}
                                    disabled={confirmMutation.isPending}
                                    style={{ backgroundColor: '#10B981', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: confirmMutation.isPending ? 0.6 : 1 }}
                                >
                                    {confirmMutation.isPending
                                        ? <ActivityIndicator size="small" color="#fff" />
                                        : <Ionicons name="checkmark-done-circle-outline" size={20} color="#fff" />}
                                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                                        {confirmMutation.isPending ? 'Confirming…' : 'I Received It — Release Payment'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {canDispute && (
                                <TouchableOpacity
                                    onPress={() => setShowDisputeModal(true)}
                                    style={{ backgroundColor: backgroundColortwo, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                >
                                    <Ionicons name="warning-outline" size={20} color="#fff" />
                                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Raise a Dispute</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* ── Buyer waiting banners (self-pickup only — delivery covered by modal) ── */}
                    {isBuyer && isSelfPickup && (() => {
                        const banners: Record<string, { icon: any; color: string; title: string; body: string }> = {
                            ordered: {
                                icon: 'time-outline', color: '#D97706',
                                title: 'Waiting for Seller to Accept',
                                body: 'The seller will accept or reject your order shortly.',
                            },
                            accepted_by_seller: {
                                icon: 'cube-outline', color: primaryColor,
                                title: 'Seller is Preparing Your Item',
                                body: 'They will let you know when it\'s ready for pickup.',
                            },
                            ready_for_delivery: {
                                icon: 'bag-check-outline', color: '#7C3AED',
                                title: 'Item is Ready — Arrange Pickup',
                                body: 'Contact the seller to agree on a meetup time and place. They will mark handover once they give you the item.',
                            },
                        };
                        const b = banners[status];
                        if (!b) return null;
                        return (
                            <View style={{ backgroundColor: b.color + '12', borderRadius: 14, padding: 16, marginTop: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderColor: b.color + '30' }}>
                                <Ionicons name={b.icon} size={22} color={b.color} style={{ marginTop: 1 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: b.color, fontSize: 14, fontWeight: '700', marginBottom: 3 }}>{b.title}</Text>
                                    <Text style={{ color: b.color, fontSize: 12, lineHeight: 18, opacity: 0.85 }}>{b.body}</Text>
                                </View>
                            </View>
                        );
                    })()}

                    {/* ── Buyer waiting banner — delivery ── */}
                    {isBuyer && isDeliveryOrder && !isOrderDelivered && status === 'ordered' && productData?.order && (
                        <View style={{ backgroundColor: primaryColor + '10', borderRadius: 14, padding: 16, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: primaryColor + '25' }}>
                            <Ionicons name="bicycle-outline" size={22} color={primaryColor} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: primaryColor, fontSize: 14, fontWeight: '700', marginBottom: 2 }}>Delivery in Progress</Text>
                                <Text style={{ color: primaryColor, fontSize: 12, opacity: 0.85 }}>Tap "View Delivery Details" above to track your rider in real time.</Text>
                            </View>
                        </View>
                    )}

                    {/* ── Expired order — retry rider ── */}
                    {isExpired && (
                        <View style={{ backgroundColor: '#FEF3C7', borderRadius: 14, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#FCD34D' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <Ionicons name="time-outline" size={22} color="#D97706" />
                                <Text style={{ color: '#92400E', fontSize: 14, fontWeight: '700', flex: 1 }}>No Rider Found</Text>
                            </View>
                            <Text style={{ color: '#92400E', fontSize: 12, lineHeight: 18, marginBottom: 12 }}>
                                No rider accepted your order in time. You can try again — we'll look for a new rider nearby.
                            </Text>
                            <TouchableOpacity
                                onPress={() => retryRiderMutation.mutate()}
                                disabled={retryRiderMutation.isPending}
                                style={{ backgroundColor: '#D97706', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: retryRiderMutation.isPending ? 0.6 : 1 }}
                            >
                                {retryRiderMutation.isPending
                                    ? <ActivityIndicator size="small" color="#fff" />
                                    : <Ionicons name="refresh-outline" size={18} color="#fff" />}
                                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
                                    {retryRiderMutation.isPending ? 'Searching…' : 'Find a Rider Again'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* ── Cancel order (buyer, early stage) ── */}
                    {canCancel && (
                        <TouchableOpacity
                            onPress={() => setShowCancelModal(true)}
                            style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: backgroundColortwo + '50' }}
                        >
                            <Ionicons name="close-circle-outline" size={18} color={backgroundColortwo} />
                            <Text style={{ color: backgroundColortwo, fontSize: 14, fontWeight: '600' }}>Cancel Order</Text>
                        </TouchableOpacity>
                    )}

                    {/* ── Post-completion: rate + return ── */}
                    {status === 'completed' && isBuyer && (
                        <View style={{ marginTop: 16, gap: 10 }}>
                            {canRate && (
                                <TouchableOpacity
                                    onPress={() => setShowRatingModal(true)}
                                    style={{ backgroundColor: '#F59E0B', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                >
                                    <Ionicons name="star-outline" size={20} color="#fff" />
                                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Rate Your Seller</Text>
                                </TouchableOpacity>
                            )}
                            {hasRated && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                    <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '600' }}>You've rated this order</Text>
                                </View>
                            )}
                            {canReturn && (
                                <TouchableOpacity
                                    onPress={() => setShowReturnModal(true)}
                                    style={{ borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: backgroundColortwo + '50' }}
                                >
                                    <Ionicons name="return-down-back-outline" size={18} color={backgroundColortwo} />
                                    <Text style={{ color: backgroundColortwo, fontSize: 14, fontWeight: '600' }}>Request a Return</Text>
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
                            {productData?.order && (
                                <DeliveryTracker
                                    item={productData.order}
                                    isBuyer={isBuyer}
                                    productTransactionId={productData.id}
                                    productTransactionStatus={productData.status}
                                    onClose={() => setShowDeliveryModal(false)}
                                    onRefresh={() => mutation.mutate({ id: getId })}
                                />
                            )}
                            <TouchableOpacity style={styles.closeButton} onPress={() => setShowDeliveryModal(false)}>
                                <FontAwesome5 color={backgroundColortwo} size={24} name="times-circle" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* ── Reject Order Modal ── */}
                <Modal animationType="slide" transparent visible={showRejectModal} onRequestClose={() => setShowRejectModal(false)}>
                    <View style={styles.overlay}>
                        <View style={[styles.disputeBox, { backgroundColor }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <Text style={{ color: textPrimary, fontSize: 18, fontWeight: '700' }}>Reject Order</Text>
                                <TouchableOpacity onPress={() => setShowRejectModal(false)}>
                                    <Ionicons name="close" size={24} color={textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <View style={{ backgroundColor: backgroundColortwo + '15', borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                                <Ionicons name="information-circle-outline" size={18} color={backgroundColortwo} style={{ marginTop: 1 }} />
                                <Text style={{ color: backgroundColortwo, fontSize: 13, flex: 1, lineHeight: 18 }}>
                                    The buyer will be fully refunded and notified with your reason.
                                </Text>
                            </View>

                            <Text style={{ color: textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>Reason for rejection</Text>
                            <TextInput
                                value={rejectReason}
                                onChangeText={setRejectReason}
                                placeholder="e.g. Item no longer available, Out of stock…"
                                placeholderTextColor={textSecondary}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6', borderRadius: 12, padding: 14, color: textPrimary, fontSize: 14, marginBottom: 16, minHeight: 80, borderWidth: 1, borderColor }}
                            />

                            <TouchableOpacity
                                onPress={() => {
                                    if (!rejectReason.trim()) {
                                        toast.error('Required', 'Please provide a reason for rejection');
                                        return;
                                    }
                                    sellerRejectMutation.mutate(rejectReason.trim());
                                }}
                                disabled={sellerRejectMutation.isPending}
                                style={{ backgroundColor: backgroundColortwo, borderRadius: 12, padding: 16, alignItems: 'center', opacity: sellerRejectMutation.isPending ? 0.6 : 1 }}
                            >
                                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                                    {sellerRejectMutation.isPending ? 'Rejecting…' : 'Confirm Rejection'}
                                </Text>
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

                {/* ── Cancel Order Modal ── */}
                <Modal animationType="slide" transparent visible={showCancelModal} onRequestClose={() => setShowCancelModal(false)}>
                    <View style={styles.overlay}>
                        <View style={[styles.disputeBox, { backgroundColor }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <Text style={{ color: textPrimary, fontSize: 18, fontWeight: '700' }}>Cancel Order</Text>
                                <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                                    <Ionicons name="close" size={24} color={textSecondary} />
                                </TouchableOpacity>
                            </View>

                            {/* Refund notice */}
                            <View style={{ backgroundColor: '#10B98115', borderRadius: 12, padding: 14, marginBottom: 16, flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                                <Ionicons name="wallet-outline" size={20} color="#10B981" style={{ marginTop: 1 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: '#065F46', fontSize: 13, fontWeight: '700', marginBottom: 3 }}>Full Refund Guaranteed</Text>
                                    <Text style={{ color: '#065F46', fontSize: 12, lineHeight: 18 }}>
                                        Your payment will be refunded to your wallet immediately upon cancellation.
                                    </Text>
                                </View>
                            </View>

                            <Text style={{ color: textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 20 }}>
                                Are you sure you want to cancel this order? The seller will be notified.
                            </Text>

                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity
                                    onPress={() => setShowCancelModal(false)}
                                    style={{ flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor }}
                                >
                                    <Text style={{ color: textSecondary, fontSize: 14, fontWeight: '600' }}>Keep Order</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => cancelMutation.mutate()}
                                    disabled={cancelMutation.isPending}
                                    style={{ flex: 1, backgroundColor: backgroundColortwo, borderRadius: 12, padding: 14, alignItems: 'center', opacity: cancelMutation.isPending ? 0.6 : 1 }}
                                >
                                    {cancelMutation.isPending
                                        ? <ActivityIndicator size="small" color="#fff" />
                                        : <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>Yes, Cancel</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* ── Rating Modal ── */}
                <Modal animationType="slide" transparent visible={showRatingModal} onRequestClose={() => setShowRatingModal(false)}>
                    <View style={styles.overlay}>
                        <View style={[styles.disputeBox, { backgroundColor }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <Text style={{ color: textPrimary, fontSize: 18, fontWeight: '700' }}>Rate Your Seller</Text>
                                <TouchableOpacity onPress={() => setShowRatingModal(false)}>
                                    <Ionicons name="close" size={24} color={textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <Text style={{ color: textSecondary, fontSize: 13, marginBottom: 20 }}>
                                How was your experience with {productData?.seller?.profile?.firstName || 'this seller'}?
                            </Text>

                            {/* Star selector */}
                            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 10 }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity key={star} onPress={() => setSelectedRating(star)}>
                                        <Ionicons
                                            name={star <= selectedRating ? 'star' : 'star-outline'}
                                            size={40}
                                            color={star <= selectedRating ? '#F59E0B' : (isDark ? '#4B5563' : '#D1D5DB')}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Rating label */}
                            <Text style={{ color: textSecondary, fontSize: 13, textAlign: 'center', marginBottom: 24, minHeight: 18 }}>
                                {selectedRating === 1 ? '😞 Poor'
                                    : selectedRating === 2 ? '😐 Fair'
                                    : selectedRating === 3 ? '🙂 Good'
                                    : selectedRating === 4 ? '😊 Very Good'
                                    : selectedRating === 5 ? '🤩 Excellent!'
                                    : 'Tap a star to rate'}
                            </Text>

                            <TouchableOpacity
                                onPress={() => {
                                    if (selectedRating === 0) {
                                        toast.error('Required', 'Please select a star rating');
                                        return;
                                    }
                                    ratingMutation.mutate();
                                }}
                                disabled={ratingMutation.isPending}
                                style={{ backgroundColor: '#F59E0B', borderRadius: 12, padding: 16, alignItems: 'center', opacity: ratingMutation.isPending ? 0.6 : 1 }}
                            >
                                {ratingMutation.isPending
                                    ? <ActivityIndicator size="small" color="#fff" />
                                    : <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Submit Rating</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* ── Return Request Modal ── */}
                <Modal animationType="slide" transparent visible={showReturnModal} onRequestClose={() => setShowReturnModal(false)}>
                    <View style={styles.overlay}>
                        <View style={[styles.disputeBox, { backgroundColor }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <Text style={{ color: textPrimary, fontSize: 18, fontWeight: '700' }}>Request a Return</Text>
                                <TouchableOpacity onPress={() => setShowReturnModal(false)}>
                                    <Ionicons name="close" size={24} color={textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <View style={{ backgroundColor: '#FEF3C7', borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                                <Ionicons name="information-circle-outline" size={18} color="#D97706" style={{ marginTop: 1 }} />
                                <Text style={{ color: '#92400E', fontSize: 12, flex: 1, lineHeight: 18 }}>
                                    Returns are accepted within 7 days of completion. Our team will review your request.
                                </Text>
                            </View>

                            <Text style={{ color: textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>Reason</Text>
                            <TextInput
                                value={returnReason}
                                onChangeText={setReturnReason}
                                placeholder="e.g. Wrong item received, Damaged on arrival…"
                                placeholderTextColor={textSecondary}
                                style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6', borderRadius: 12, padding: 14, color: textPrimary, fontSize: 14, marginBottom: 12, borderWidth: 1, borderColor }}
                            />

                            <Text style={{ color: textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>Description</Text>
                            <TextInput
                                value={returnDescription}
                                onChangeText={setReturnDescription}
                                placeholder="Describe the issue in detail…"
                                placeholderTextColor={textSecondary}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6', borderRadius: 12, padding: 14, color: textPrimary, fontSize: 14, marginBottom: 16, minHeight: 90, borderWidth: 1, borderColor }}
                            />

                            <TouchableOpacity
                                onPress={() => {
                                    if (!returnReason.trim()) {
                                        toast.error('Required', 'Please provide a reason for the return');
                                        return;
                                    }
                                    if (!returnDescription.trim()) {
                                        toast.error('Required', 'Please describe the issue in detail');
                                        return;
                                    }
                                    returnMutation.mutate();
                                }}
                                disabled={returnMutation.isPending}
                                style={{ backgroundColor: backgroundColortwo, borderRadius: 12, padding: 16, alignItems: 'center', opacity: returnMutation.isPending ? 0.6 : 1 }}
                            >
                                {returnMutation.isPending
                                    ? <ActivityIndicator size="small" color="#fff" />
                                    : <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Submit Return Request</Text>}
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
    // Use the professional entity ID if present, otherwise fall back to user ID with byUser flag
    const profEntityId = user?.profile?.professional?.id;
    const profileRoute = profEntityId
        ? `/professional/${profEntityId}`
        : `/professional/${user?.id}?byUser=1`;

    return (
        <View style={{ backgroundColor: selectioncardColor, borderRadius: 16, padding: 14, borderWidth: 1, borderColor }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Ionicons name="storefront-outline" size={16} color={primaryColor} />
                <Text style={{ color: textPrimary, fontSize: 14, fontWeight: '600' }}>Seller</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity
                        onPress={() => router.push(profileRoute as any)}
                        activeOpacity={0.8}
                        style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: primaryColor + '15', overflow: 'hidden' }}
                    >
                        <Image resizeMode="cover" style={{ width: 44, height: 44, borderRadius: 22 }} source={{ uri: avatar }} />
                    </TouchableOpacity>
                    <View>
                        <Text style={{ color: textPrimary, fontSize: 14, fontWeight: '600' }}>{clientName}</Text>
                        <RatingStar numberOfStars={numberOfStars} />
                    </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                        onPress={() => {
                            if (user?.phone) {
                                Linking.openURL(`tel:${user.phone}`);
                            } else {
                                Alert.alert('No Phone', 'Phone number not available for this seller.');
                            }
                        }}
                        style={{ backgroundColor: backgroundColortwo, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }}
                    >
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
    { value: "accepted",          label: "Rider Assigned" },
    { value: "en_route_to_pickup",label: "Rider Heading to Seller" },
    { value: "arrived_at_pickup", label: "Rider at Seller" },
    { value: "in_transit",        label: "Item Collected — In Transit" },
    { value: "arrived_at_dropoff",label: "Rider Arrived at Your Location" },
    { value: "delivered",         label: "Item Delivered" },
    { value: "confirm_delivery",  label: "Delivery Confirmed ✓" },
];

// Delivery tracking: all actions belong to the RIDER role.
// Seller & buyer have no actions in this modal — seller sees delivery progress,
// buyer confirms receipt via the green button below.
const statusActions: Record<string, { label: string; fn: (id: number) => Promise<any> }> = {};

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
    isBuyer?: boolean;
    productTransactionId?: number;
    productTransactionStatus?: string;
    onClose?: () => void;
    onRefresh?: () => void;
}

const DeliveryTracker = ({ item, isBuyer, productTransactionId, productTransactionStatus: rawPtStatus, onClose, onRefresh }: ShippingCardProps) => {
    const productTransactionStatus = normalizeStatus(rawPtStatus);
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { primaryColor } = getColors(theme);
    const textPrimary = isDark ? '#F9FAFB' : '#111827';
    const textSecondary = isDark ? '#9CA3AF' : '#6B7280';
    const [dropAddress, setDropAddress] = useState('');
    const toast = useToast();

    const mutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            statusActions[status].fn(id),
        onSuccess: (_data, variables) => {
            const label = statusActions[variables.status]?.label ?? variables.status;
            toast.success('Updated', `${label} confirmed successfully`);
            onClose?.();
            setTimeout(() => onRefresh?.(), 300);
        },
        onError: (err: any) => {
            console.error("Failed to update delivery:", err.message);
            toast.error('Failed', err?.message || 'Could not update delivery status');
        },
    });

    // Buyer-only: confirm delivery uses productTransactionId, not order id
    const confirmDeliveryMutation = useMutation({
        mutationFn: () => confirmDeliverdFn(productTransactionId!),
        onSuccess: () => {
            toast.success('Delivery Confirmed', 'Payment has been released to the seller.');
            onClose?.();
            setTimeout(() => onRefresh?.(), 300);
        },
        onError: (err: any) => {
            toast.error('Failed', err?.message || 'Could not confirm delivery');
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
        const action = statusActions[item.status];
        if (action) {
            mutation.mutate({ id: item.id, status: item.status });
        }
    };

    const currentAction = statusActions[item.status] ?? null;
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
                        role="delivery"
                    />
                </View>
            )}

            {/* Action Button — hide entirely once delivery is confirmed by buyer */}
            {!['cancelled', 'confirm_delivery', 'expired'].includes(item.status)
             && !(item.status === 'delivered' && productTransactionStatus !== 'ordered')
             && (
                currentAction ? (
                    <TouchableOpacity
                        onPress={handleAction}
                        disabled={mutation.isPending}
                        style={{
                            backgroundColor: primaryColor,
                            padding: 14,
                            borderRadius: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            marginTop: 8,
                            opacity: mutation.isPending ? 0.6 : 1,
                        }}
                    >
                        {mutation.isPending
                            ? <ActivityIndicator size="small" color="#fff" />
                            : <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />}
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                            {mutation.isPending ? 'Updating...' : currentAction.label}
                        </Text>
                    </TouchableOpacity>
                ) : item.status === 'delivered' && isBuyer && productTransactionStatus === 'ordered' ? (
                    /* Buyer confirms delivery */
                    <TouchableOpacity
                        onPress={() => confirmDeliveryMutation.mutate()}
                        disabled={confirmDeliveryMutation.isPending}
                        style={{
                            backgroundColor: '#10B981',
                            padding: 14,
                            borderRadius: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            marginTop: 8,
                            opacity: confirmDeliveryMutation.isPending ? 0.6 : 1,
                        }}
                    >
                        {confirmDeliveryMutation.isPending
                            ? <ActivityIndicator size="small" color="#fff" />
                            : <Ionicons name="checkmark-done-circle-outline" size={18} color="#fff" />}
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                            {confirmDeliveryMutation.isPending ? 'Confirming…' : 'Confirm Delivery'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    /* Waiting — rider or seller is handling this step */
                    <View style={{
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                        gap: 8, padding: 14, borderRadius: 12, marginTop: 8,
                        backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                        borderWidth: 1, borderColor: isDark ? '#374151' : '#E5E7EB',
                    }}>
                        <ActivityIndicator size="small" color={isDark ? '#6B7280' : '#9CA3AF'} />
                        <Text style={{ color: isDark ? '#6B7280' : '#9CA3AF', fontSize: 13, fontWeight: '500' }}>
                            {item.status === 'paid'
                                ? 'Looking for a nearby rider…'
                                : nextStatus
                                    ? `Next: ${nextStatus.label}`
                                    : 'Awaiting next step…'}
                        </Text>
                    </View>
                )
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