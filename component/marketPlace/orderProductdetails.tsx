import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { useMutation } from "@tanstack/react-query"
import ButtonFunction from "component/buttonfunction"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import RatingStar from "component/rating"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { useEffect, useState, type FC, useCallback, useMemo, memo } from "react"
import { View, Image, ActivityIndicator, TouchableOpacity, Alert, Text, StyleSheet } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { getproductByIdFn, getProductByTransactionFn } from "services/marketplaceServices"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"
import { baseUrl } from "utilizes/endpoints"
import * as Location from "expo-location";

import { Modal, FlatList, Dimensions } from "react-native";
import { ProductData } from "types/productdataType"
import { ProductTransaction } from "types/productTransType"
import { Order, ProductTransactionDetail } from "types/getProductByTrans"
import { acceptDeliveryFn, confirmDeliverdFn, confirmPickupFn, deliveredFn, inTransitFn, PickupFn } from "services/deliveryServices"
import { UserDetailsComp } from "component/delivery/orderCard"


const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const placeholderImage = require("../../assets/samplework.png")

interface OrderProductDetailsProps { 
  id?: string | string[];
  onProductLoad?: (product: ProductTransactionDetail) => void;
}

const OrderProductDetails: FC<OrderProductDetailsProps> = memo(({ id, onProductLoad }) => {
    const router = useRouter();
    const { theme } = useTheme();
    const { primaryColor, selectioncardColor, backgroundColor } = getColors(theme);

    const [productData, setProductData] = useState<ProductTransactionDetail | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const userId = useSelector((state: RootState) => state.auth?.user?.id);
    const [pickupAddress, setPickupAddress] = useState('')
    const [city, setCity] = useState('')
    const [images, setImages] = useState<string[]>([])
    const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})

    // ✅ State for modal preview
    const [previewVisible, setPreviewVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);

    const openPreview = useCallback((index: number) => {
        setCurrentIndex(index);
        setPreviewVisible(true);
    }, []);

    const closePreview = useCallback(() => setPreviewVisible(false), []);
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const mutation = useMutation({
        mutationFn: getProductByTransactionFn,
        onSuccess: (response) => {
            console.log(response.data,'mee')
            setProductData(response.data || []);
        },
        onError: (error: any) => {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Failed to load products";
            setErrorMessage(msg);
        },
    });

    const getId = useMemo(() => 
        Number(Array.isArray(id) ? id?.[0] : id), 
        [id]
    );

    useEffect(() => {
        console.log(getId)
        if (!Number.isNaN(getId) && getId > 0) {
        mutation.mutate({ id: getId });
        }
    }, [getId]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    const latPickup = useMemo(() => 
        productData?.product?.pickupLocation?.latitude || 0, 
        [productData?.product?.pickupLocation?.latitude]
    );
    
    const lngPickup = useMemo(() => 
        productData?.product?.pickupLocation?.longitude || 0, 
        [productData?.product?.pickupLocation?.longitude]
    );


    useEffect(() => {
        if (productData?.product?.images) {
          let parsed: string[] = [];
      
          if (Array.isArray(productData.product.images)) {
            // Already array
            parsed = productData.product.images;
          } else if (typeof productData.product.images === "string") {
            try {
              // Try parsing stringified array
              const temp = JSON.parse(productData.product.images);
              if (Array.isArray(temp)) {
                parsed = temp;
              } else {
                // If it's just a single string (not JSON array)
                parsed = [productData.product.images];
              }
            } catch {
              // If not JSON, just wrap in array
              parsed = [productData.product.images];
            }
          }
      
          setImages(parsed);
        }
      }, [productData]);




    useEffect(() => {
        (async () => {
            try {
                // Ask for permission once
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    console.warn("Permission to access location was denied");
                    return;
                }

                // Reverse geocode pickup
                const pickup = await Location.reverseGeocodeAsync({
                    latitude: latPickup,
                    longitude: lngPickup,
                });
                if (pickup.length > 0) {
                    setPickupAddress(
                        `${pickup[0].name || ""} ${pickup[0].street || ""}, ${pickup[0].city || ""}`
                    );
                    setCity(pickup[0].city || "")
                }

            } catch (error) {
                console.error("Error getting addresses:", error);
            }
        })();
    }, [productData?.product?.pickupLocation]);


    if (mutation.isPending) {
        return (
            <ContainerTemplate>
                <View className="justify-center items-center h-full">
                    <ActivityIndicator size="large" />
                </View>
            </ContainerTemplate>
        );
    }
    console.log('ok')
    return (
        <>
            <ContainerTemplate>
                <HeaderComponent title={"Item Details"} />
                <EmptyView height={20} />
                {/* Product Images Grid */}
                {images.length ? (
                    images.length === 1 ? (
                        <TouchableOpacity onPress={() => openPreview(0)}>
                            <Image
                                source={imageErrors[0] ? placeholderImage : { uri: `${images[0]}` }}
                                resizeMode="cover"
                                style={{ width: "100%", height: 250, borderRadius: 10, marginBottom: 10 }}
                                defaultSource={placeholderImage}
                                onError={() => setImageErrors(prev => ({ ...prev, 0: true }))}
                            />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ flexDirection: "row", width: "100%", height: 250, marginBottom: 10 }}>
                            {/* First image */}
                            <TouchableOpacity
                                style={{ width: "60%", height: "100%", marginRight: 5 }}
                                onPress={() => openPreview(0)}
                            >
                                <Image
                                    source={{ uri: `${images[0]}` }}
                                    resizeMode="cover"
                                    style={{ width: "100%", height: "100%", borderRadius: 10 }}
                                />
                            </TouchableOpacity>

                            {/* Remaining images */}
                            <View style={{ width: "40%", height: "100%", flexDirection: "row", flexWrap: "wrap" }}>
                                {images.slice(1, 5).map((img, index) => (
                                    <TouchableOpacity
                                        key={index + 1}
                                        onPress={() => openPreview(index + 1)}
                                        style={{ width: "50%", height: "50%", padding: 2 }}
                                    >
                                        <Image
                                            source={imageErrors[index + 1] ? placeholderImage : { uri: `${img}` }}
                                            resizeMode="cover"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                borderRadius: 8,
                                            }}
                                            defaultSource={placeholderImage}
                                            onError={() => setImageErrors(prev => ({ ...prev, [index + 1]: true }))}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )
                ) : (
                    <Image
                        resizeMode="cover"
                        style={{ width: "100%", height: 250, borderRadius: 10, marginBottom: 10 }}
                        source={placeholderImage}
                    />
                )}


                <EmptyView height={20} />
                <View className="flex-1 w-full">
                    <ScrollView>


                        <View className="flex-row justify-between">
                            <View>
                                <ThemeText size={Textstyles.text_cmedium}>{productData?.product?.name || null}</ThemeText>
                                <ThemeTextsecond size={Textstyles.text_xxxsmall}>{productData?.product?.category?.name || null}</ThemeTextsecond>

                            </View>
                            <View className="items-end">
                                <ThemeText size={Textstyles.text_cmedium}>{productData?.price || null}</ThemeText>
                                <ThemeTextsecond size={Textstyles.text_xxxsmall}>{productData?.quantity || null}</ThemeTextsecond>

                            </View>

                        </View>
                        <View className="flex-row justify-between items-center mt-2">
                            <ThemeText size={Textstyles.text_small}>Status:</ThemeText>
                            <View
                                className={`px-3 py-1 rounded-xl ${productData?.status === "pending"
                                    ? "bg-orange-200"
                                    : productData?.status === "ordered"
                                        ? "bg-amber-200"
                                        : "bg-green-200"
                                    }`}
                            >
                                <ThemeText
                                    size={Textstyles.text_xsmall}
                                    className={
                                        productData?.status === "pending"
                                            ? "text-orange-700"
                                            : productData?.status === "ordered"
                                                ? "text-amber-700"
                                                : "text-green-700"
                                    }
                                >
                                    {productData?.status}
                                </ThemeText>
                            </View>
                        </View>



                        <EmptyView height={20} />
                        <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 py-3 ">
                            <ThemeTextsecond size={Textstyles.text_xsmall}>
                                {productData?.product?.description || null}
                            </ThemeTextsecond>
                        </View>
                        <EmptyView height={20} />
                        <View className="w-full">
                            <ThemeText size={Textstyles.text_xsmall}>
                                Location City:{productData?.product?.pickupLocation?.lga || city}
                            </ThemeText>
                            <ThemeText size={Textstyles.text_xsmall}>
                                Address:{pickupAddress}
                            </ThemeText>
                        </View>
                        <EmptyView height={20} />
                        {/* {productData?.user.id!==userId &&<> */}
                        <SellerDetails
                            user={productData?.seller}
                        />
                        <EmptyView height={10} />
                        {productData?.order && (
                            <ButtonFunction
                                color={primaryColor}
                                text={"View Delivery Details"}
                                textcolor={"#ffffff"}
                                onPress={() => setShowModal(true)}
                            />
                        )
                        }
                        {/* </>} */}


                    </ScrollView>
                </View>
                {/* ✅ Fullscreen Image Preview Modal */}
                <Modal visible={previewVisible} transparent={true} animationType="fade">
                    <View style={{ flex: 1, backgroundColor: "black" }}>
                        {/* Swipeable Image Viewer */}
                        <FlatList
                            data={images}   // ✅ use parsed state
                            horizontal
                            pagingEnabled
                            initialScrollIndex={currentIndex}
                            getItemLayout={(data, index) => ({
                                length: screenWidth,
                                offset: screenWidth * index,
                                index,
                            })}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <Image
                                    source={placeholderImage}
                                    style={{ width: screenWidth, height: screenHeight, resizeMode: "contain" }}
                                />
                            )}
                        />

                        {/* Close Button */}
                        <TouchableOpacity
                            onPress={closePreview}
                            style={{
                                position: "absolute",
                                top: 40,
                                right: 20,
                                backgroundColor: "rgba(0,0,0,0.6)",
                                padding: 10,
                                borderRadius: 20,
                            }}
                        >
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </Modal>

                <Modal
                    animationType="slide"   // or "fade"
                    transparent={true}      // makes the background transparent
                    visible={showModal}  // show/hide
                    onRequestClose={() => { // Android back button handler
                        setShowModal(false);
                    }}
                >
                    <View style={styles.overlay}>

                        <View style={[styles.modalBox, { backgroundColor: backgroundColor }]}>

                            {productData?.order && (
                                <DeliveryDetails item={productData.order} />
                            )}
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowModal(false)}
                            >
                                <FontAwesome5 color="red" size={24} name="times-circle" />
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
    const { theme } = useTheme()

    const { selectioncardColor, primaryColor } = getColors(theme)


    const avatar: string = user?.profile.avatar || ' '
    const clientName: string = user?.profile.firstName + ' ' + user?.profile.lastName || ' '
    const numberOfStars: number = user?.profile.rate || 1

    const userIDprofessionalId = { userId: user?.id, professionalId: '' }

    const router = useRouter()
    return (
        <>
            <View
                style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                className="w-full h-auto py-3 px-3 shadow-sm shadow-black rounded-xl"
            >
                <View className="w-full flex-row justify-between items-center">
                    <View className="flex-row gap-x-2 items-center">
                        <View className="w-12 h-12 bg-slate-200 rounded-full">
                            <Image resizeMode="contain" className="w-12 h-12 rounded-full" source={{ uri: avatar }} />
                        </View>
                        <View>
                            <ThemeText size={Textstyles.text_small}>
                                {clientName}
                            </ThemeText>
                            <RatingStar numberOfStars={numberOfStars} />
                        </View>


                    </View>
                    <View className="flex-row gap-x-2">
                        <TouchableOpacity style={{ backgroundColor: "red" }} className="w-8 h-8 rounded-full justify-center items-center">
                            <FontAwesome5 color="#ffffff" name="phone" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push(`/mainchat/${JSON.stringify(userIDprofessionalId)}`)} style={{ backgroundColor: primaryColor }} className="w-8 h-8 rounded-full justify-center items-center">
                            <Ionicons name="chatbubbles-sharp" color={"#ffffff"} size={20} />
                        </TouchableOpacity>

                    </View>

                </View>



            </View>
        </>
    )
}

const statusFlow = [
    { value: "accepted", label: "Rider Accepted" },          // rider accepts
    { value: "picked_up", label: "Rider Picked Up" },          // rider accepts
    { value: "confirm_pickup", label: "Seller Confirmed Pickup" },// seller hands item
    { value: "in_transit", label: "Rider In Transit" },      // rider moving
    { value: "delivered", label: "Rider Delivered" },        // rider drops item
    { value: "confirm_delivery", label: "Buyer Confirmed Delivery" }, // buyer confirms
    { value: "missed", label: "Missed" }                     // fallback
];

// Status Actions
const statusActions: Record<
    string,
    { label: string; fn: (id: number) => Promise<any> }
> = {
    accepted: { label: "Accept Order", fn: acceptDeliveryFn },             // seller confirms handover
    picked_up: { label: "Mark Pickup", fn: PickupFn },          // rider starts transit
    confirm_pickup: { label: "Confirm Pickup", fn: confirmPickupFn },
    in_transit: { label: "Start Transit", fn: inTransitFn },        // rider delivers
    delivered: { label: "Mark Delivery", fn: deliveredFn }, // buyer confirms
    confirm_delivery: { label: "Mark Delivery", fn: confirmDeliverdFn },   // end
    missed: { label: "Missed", fn: async () => { } },                 // no-op
    cancelled: { label: "Cancelled", fn: async () => { } },           // no-op
};

interface ShippingCardProps {
    item: Order
}
const statusColors: Record<string, string> = {
    pending: "#FFA500",
    accepted: "#1E90FF",
    picked_up: "#9370DB",
    confirm_pickup: "#20B2AA",
    in_transit: "#FFD700",
    delivered: "#32CD32",
    confirm_delivery: "#006400",
    cancelled: "#FF0000",
};
const DeliveryDetails = ({ item }: ShippingCardProps) => {
    const { theme } = useTheme();
    const { primaryColor } = getColors(theme);
    const [dropAddress, setDropAddress] = useState('')

    const mutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            statusActions[status].fn(id),
        onSuccess: (data, variables) => {
            console.log("Status updated:", data);
            Alert.alert("Success ✅", `Order moved to ${variables.status}`);
            // optionally: refetch deliveries or invalidate queries here

        },
        onError: (err: any) => {
            console.error("Failed to update delivery:", err.message);
            Alert.alert("Error ❌", err?.message || "Something went wrong");
        },
    });

    const getNextStatus = (current: string) => {
        const idx = statusFlow.findIndex((s) => s.value === current);
        if (idx !== -1 && idx < statusFlow.length - 1) {
            return {
                value: statusFlow[idx + 1].value,
                label: statusFlow[idx + 1].label,
            };
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

    const latDropoff = item?.dropoffLocation?.latitude || 0
    const lngDropoff = item?.dropoffLocation?.longitude || 0


    useEffect(() => {
        (async () => {
            try {
                // Ask for permission once
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    console.warn("Permission to access location was denied");
                    return;
                }

                // Reverse geocode pickup
                const pickup = await Location.reverseGeocodeAsync({
                    latitude: latDropoff,
                    longitude: lngDropoff,
                });
                if (pickup.length > 0) {
                    setDropAddress(
                        `${pickup[0].name || ""} ${pickup[0].street || ""}, ${pickup[0].city || ""}`
                    );
                }

            } catch (error) {
                console.error("Error getting addresses:", error);
            }
        })();
    }, [item.dropoffLocation]);

    return (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
                <ThemeText size={Textstyles.text_cmedium}>Order #{item.id}</ThemeText>
                <View
                    style={{
                        backgroundColor: statusColors[item.status],
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 16,
                    }}
                >
                    <Text style={{ color: "#fff", fontWeight: "600" }}>
                        {item.status}
                    </Text>
                </View>
            </View>

            {/* Pickup & Dropoff */}
            <View className="mb-4">
                <ThemeText size={Textstyles.text_small}>Dropoff Location</ThemeText>
                <ThemeTextsecond>
                    {dropAddress}
                </ThemeTextsecond>
            </View>

            {/* Distance Covered */}
            {item.distance !== undefined && (
                <View className="mb-4">
                    <ThemeText size={Textstyles.text_small}>Distance Covered</ThemeText>
                    <ThemeTextsecond>{item.distance} km</ThemeTextsecond>
                </View>
            )}

            {/* Buyer & Seller */}
            {item.rider ? (
                <View className="mb-4">
                    <ThemeText size={Textstyles.text_small}>Rider</ThemeText>
                    <UserDetailsComp
                        firstName={item.rider.profile.firstName}
                        lastName={item.rider.profile.lastName}
                        userId={item.riderId}
                        avatar={item.rider.profile.avatar}
                    />
                </View>
            ) : null}

            {/* Action Button */}
            {item.status !== "cancelled" && item.status !== "confirm_delivery" && (
                <TouchableOpacity
                    onPress={handleAction}
                    disabled={mutation.isPending}
                    style={{
                        backgroundColor: primaryColor,
                        padding: 14,
                        borderRadius: 8,
                        alignItems: "center",
                        marginTop: 20,
                        opacity: mutation.isPending ? 0.7 : 1,
                    }}
                >
                    <Text style={{ color: "#fff", fontWeight: "600" }}>
                        {mutation.isPending
                            ? "Updating..."
                            : nextStatus
                                ? `Move to ${nextStatus.label}`
                                : "Completed"}
                    </Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
};



const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)", // dim background
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        width: "80%",
        padding: 20,
        borderRadius: 10,

    },
    closeButton: {
        right: 0,
        position: "absolute"
    },
});