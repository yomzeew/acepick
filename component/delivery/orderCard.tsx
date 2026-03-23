import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { useTheme } from "hooks/useTheme";
import { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, Modal, StyleSheet, ScrollView, Alert, Image, Dimensions } from "react-native";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import { DeliveryData, OrderStatusType } from "types/type";
import * as Location from "expo-location";
import EmptyView from "component/emptyview";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import ClientDetails, { ClientDetailsForProf } from "component/dashboardComponent/clientdetail";
import { acceptDeliveryFn, confirmDeliverdFn, confirmPickupFn, deliveredFn, enRouteToPickupFn, arrivedAtPickupFn, arrivedAtDropoffFn, PickupFn } from "services/deliveryServices";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { getInitials } from "utilizes/initialsName";

const { width: screenWidth } = Dimensions.get('window');

interface ShippingCardProps {
    item: DeliveryData
    onPress?: () => void;
    showModal?: boolean
    setShowModal?: (value: boolean) => void
    onRefresh?: () => void; // 👈 new prop
}

// Map status to colors


  
  
  // Status colors are resolved per-component using theme colors
  const getStatusColors = (primaryColor: string, backgroundColortwo: string): Record<OrderStatusType, string> => ({
    pending: backgroundColortwo,
    paid: backgroundColortwo,
    accepted: primaryColor,
    en_route_to_pickup: primaryColor,
    arrived_at_pickup: primaryColor,
    picked_up: primaryColor,
    confirm_pickup: primaryColor,
    in_transit: primaryColor,
    arrived_at_dropoff: primaryColor,
    delivered: primaryColor,
    confirm_delivery: primaryColor,
    cancelled: backgroundColortwo,
    disputed: backgroundColortwo,
    expired: backgroundColortwo,
    not_required: backgroundColortwo,
  });

  const statusLabels: Record<OrderStatusType, string> = {
    pending: "Pending",
    paid: "Paid",
    accepted: "Accepted",
    en_route_to_pickup: "En Route to Pickup",
    arrived_at_pickup: "At Pickup",
    picked_up: "Picked Up",
    confirm_pickup: "Pickup Confirmed",
    in_transit: "In Transit",
    arrived_at_dropoff: "At Dropoff",
    delivered: "Delivered",
    confirm_delivery: "Completed",
    cancelled: "Cancelled",
    disputed: "Disputed",
    expired: "Expired",
    not_required: "Not Required",
  };

  const statusIcons: Record<OrderStatusType, keyof typeof Ionicons.glyphMap> = {
    pending: "time-outline",
    paid: "time-outline",
    accepted: "checkmark-circle-outline",
    en_route_to_pickup: "car-outline",
    arrived_at_pickup: "location-outline",
    picked_up: "cube-outline",
    confirm_pickup: "checkmark-done-outline",
    in_transit: "navigate-outline",
    arrived_at_dropoff: "flag-outline",
    delivered: "home-outline",
    confirm_delivery: "checkmark-done",
    cancelled: "close-circle-outline",
    disputed: "alert-circle-outline",
    expired: "hourglass-outline",
    not_required: "information-circle-outline",
  };
const OrderCard: React.FC<ShippingCardProps> = ({ item,onRefresh }) => {

    const { theme } = useTheme();
    const { selectioncardColor, backgroundColor, primaryColor, backgroundColortwo, secondaryTextColor, borderColor } = getColors(theme);
    const statusColors = getStatusColors(primaryColor, backgroundColortwo);
    const [showModal, setShowModal] = useState<boolean>(false)
    const [successMessage, setSuccessMessage] = useState<string | null>("")
    const [errorMessage, setErrorMessage] = useState<string | null>("")

    const [pickupAddress, setPickupAddress] = useState("");
    const [destinationAddress, setDestinationAddress] = useState("");

    const latPickup = item.productTransaction.product.pickupLocation.latitude || 0;
    const lngPickup = item.productTransaction.product.pickupLocation.longitude || 0;

    // Replace with real destination lat/lng from your API
    const latDest = item.dropoffLocation.latitude || 0;
    const lngDest = item.dropoffLocation.longitude || 0;

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 4000);
            return () => clearTimeout(timer); // Cleanup on unmount or on new error
        }
    }, [successMessage])

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null);
            }, 4000);
            return () => clearTimeout(timer); // Cleanup on unmount or on new error
        }
    }, [errorMessage])

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
                }

                // Reverse geocode destination if exists
                if (latDest && lngDest) {
                    const dest = await Location.reverseGeocodeAsync({
                        latitude: latDest,
                        longitude: lngDest,
                    });
                    if (dest.length > 0) {
                        setDestinationAddress(
                            `${dest[0].name || ""} ${dest[0].street || ""}, ${dest[0].city || ""}`
                        );
                    }
                }
            } catch (error) {
                console.error("Error getting addresses:", error);
            }
        })();
    }, []);




    const handleAcceptFn = () => {
        console.log(item.id)
    }

    return (
        <>
            <TouchableOpacity
                onPress={() => setShowModal(true)}
                style={{
                    backgroundColor: selectioncardColor,
                    padding: 16,
                    marginBottom: 12,
                    borderRadius: 16,
                    shadowColor: "#000",
                    shadowOpacity: 0.08,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 8,
                    elevation: 3,
                    borderLeftWidth: 4,
                    borderLeftColor: statusColors[item.status],
                }}
                className="w-full"
            >
                {/* Order header with status */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                        <ThemeText size={Textstyles.text_cmedium} className="font-semibold">Order #{item.id}</ThemeText>
                        <ThemeTextsecond>
                            {item.productTransaction.product.name}
                        </ThemeTextsecond>
                    </View>
                    <View
                        style={{
                            backgroundColor: statusColors[item.status] + '20',
                            borderWidth: 1,
                            borderColor: statusColors[item.status],
                            paddingVertical: 4,
                            paddingHorizontal: 10,
                            borderRadius: 20,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <Ionicons name={statusIcons[item.status]} size={12} color={statusColors[item.status]} />
                        <Text style={{ color: statusColors[item.status], fontSize: 11, fontWeight: "600", marginLeft: 4 }}>
                            {statusLabels[item.status]}
                        </Text>
                    </View>
                </View>

                {/* Product info */}
                <View style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                            <Text style={{ fontSize: 12, color: theme === 'dark' ? '#9ca3af' : '#6b7280', marginBottom: 4 }}>Product</Text>
                            <Text style={{ fontSize: 14, fontWeight: '500', color: theme === 'dark' ? '#f3f4f6' : '#111827' }}>
                                {item.productTransaction.product.name}
                            </Text>
                            <Text style={{ fontSize: 12, color: theme === 'dark' ? '#9ca3af' : '#6b7280', marginTop: 4 }}>
                                Qty: {item.productTransaction.quantity} • ₦{item.productTransaction.price}
                            </Text>
                        </View>
                        <View style={{ backgroundColor: primaryColor + '15', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
                            <Text style={{ color: primaryColor, fontWeight: '600' }}>₦{item.cost}</Text>
                        </View>
                    </View>
                </View>

                {/* Route info */}
                <View style={{ marginBottom: 12 }}>
                    <View className="flex-row items-start" style={{ marginBottom: 8 }}>
                        <View style={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: 12, 
                            backgroundColor: primaryColor + '15', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            marginRight: 12, 
                            marginTop: 2 
                        }}>
                            <Ionicons name="location" size={14} color={primaryColor} />
                        </View>
                        <View className="flex-1">
                            <Text style={{ fontSize: 12, color: theme === 'dark' ? '#9ca3af' : '#6b7280', marginBottom: 4 }}>Pickup</Text>
                            <Text style={{ fontSize: 14, color: theme === 'dark' ? '#f3f4f6' : '#111827' }}>
                                {pickupAddress || "Loading pickup address..."}
                            </Text>
                        </View>
                    </View>
                    
                    <View className="flex-row items-start">
                        <View style={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: 12, 
                            backgroundColor: backgroundColortwo + '15', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            marginRight: 12, 
                            marginTop: 2 
                        }}>
                            <Ionicons name="flag" size={14} color={backgroundColortwo} />
                        </View>
                        <View className="flex-1">
                            <Text style={{ fontSize: 12, color: theme === 'dark' ? '#9ca3af' : '#6b7280', marginBottom: 4 }}>Dropoff</Text>
                            <Text style={{ fontSize: 14, color: theme === 'dark' ? '#f3f4f6' : '#111827' }}>
                                {destinationAddress || "Loading destination address..."}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Distance and time info */}
                {(item.distance || item.expiresAt) && (
                    <View className="flex-row items-center justify-between" style={{ marginBottom: 12 }}>
                        {item.distance && (
                            <View className="flex-row items-center">
                                <Ionicons name="navigate" size={14} color={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                <Text style={{ fontSize: 12, color: theme === 'dark' ? '#9ca3af' : '#6b7280', marginLeft: 4 }}>
                                    {item.distance ? `${item.distance.toFixed(1)} km` : 'N/A'}
                                </Text>
                            </View>
                        )}
                        {item?.expiresAt && (
                            <View className="flex-row items-center">
                                <Ionicons name="time" size={14} color={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                <Text style={{ fontSize: 12, color: theme === 'dark' ? '#9ca3af' : '#6b7280', marginLeft: 4 }}>
                                    Expires: {new Date(item?.expiresAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Progress Bar */}
                <View>
                    <View className="flex-row items-center justify-between" style={{ marginBottom: 4 }}>
                        <Text style={{ fontSize: 12, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>Progress</Text>
                        <Text style={{ fontSize: 12, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>{getProgressWidth(item.status)}%</Text>
                    </View>
                    <View style={{ height: 8, backgroundColor: borderColor, borderRadius: 4 }}>
                        <View
                            style={{
                                width: `${getProgressWidth(item.status)}%`,
                                height: "100%",
                                backgroundColor: statusColors[item.status],
                                borderRadius: 4,
                            }}
                        />
                    </View>
                </View>
            </TouchableOpacity>
            <Modal
                animationType="slide"   // or "fade"
                transparent={true}      // makes the background transparent
                visible={showModal}  // show/hide
                onRequestClose={() => { // Android back button handler
                    setShowModal(false);
                }}
            >
                <View style={styles.overlay}>
                    
                        <View  style={[styles.modalBox,{backgroundColor:backgroundColor}]}>
                           
                 <DeliveryDetails onRefresh={onRefresh} item={item}/>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowModal(false)}
                            >
                                <FontAwesome5 color={backgroundColortwo} size={24} name="times-circle" />
                            </TouchableOpacity>
                            </View>
                        

                 
                </View>
            </Modal>
        </>

    );
};

// Helper: map status to progress %
const getProgressWidth = (status: string): number => {
    switch (status) {
      case "paid":
        return 10;
      case "accepted":
        return 20;
      case "en_route_to_pickup":
        return 30;
      case "arrived_at_pickup":
        return 40;
      case "picked_up":
        return 50;
      case "confirm_pickup":
        return 60;
      case "in_transit":
        return 75;
      case "arrived_at_dropoff":
        return 90;
      case "delivered":
        return 95;
      case "confirm_delivery":
        return 100;
      case "cancelled":
        return 100; // stays at full bar but maybe show red
      case "expired":
        return 0;
      default:
        return 0;
    }
  };
export default OrderCard

// Status Flow
const statusFlow = [
    { value: "paid", label: "Awaiting Rider" },              // order paid, waiting for rider
    { value: "accepted", label: "Rider Accepted" },          // rider accepts
    { value: "en_route_to_pickup", label: "En Route to Pickup" }, // rider heading to pickup
    { value: "arrived_at_pickup", label: "At Pickup Location" }, // rider at pickup
    { value: "picked_up", label: "Picked Up" },              // rider picks up item
    { value: "confirm_pickup", label: "Pickup Confirmed" },  // seller confirms pickup
    { value: "in_transit", label: "In Transit" },            // rider moving to dropoff
    { value: "arrived_at_dropoff", label: "At Dropoff" },    // rider at dropoff
    { value: "delivered", label: "Delivered" },              // rider drops item
    { value: "confirm_delivery", label: "Completed" },        // buyer confirms
    { value: "cancelled", label: "Cancelled" },
    { value: "expired", label: "Expired" }
  ];
  
  // Status Actions
  const statusActions: Record<
    string,
    { label: string; fn: (id: number) => Promise<any> }
  > = {
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
    cancelled: { label: "Cancelled", fn: async () => {} },           // no-op
  };


 const DeliveryDetails = ({ item,onRefresh }: ShippingCardProps) => {
    const { theme } = useTheme();
    const { primaryColor, backgroundColortwo } = getColors(theme);
    const statusColors = getStatusColors(primaryColor, backgroundColortwo);
  
    const mutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
          statusActions[status].fn(id),
        onSuccess: (data, variables) => {
          console.log("Status updated:", data);
          Alert.alert("Success ✅", `Order moved to ${variables.status}`);
          // optionally: refetch deliveries or invalidate queries here
          if (onRefresh) onRefresh(); // 👈 refresh parent list

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
  
        {/* Product Info */}
        <View className="mb-4">
          <ThemeText size={Textstyles.text_small}>
            {item.productTransaction.product.name}
          </ThemeText>
          <ThemeTextsecond>
            Price: ₦{item.productTransaction.price}
          </ThemeTextsecond>
          <ThemeTextsecond>
            Quantity: {item.productTransaction.quantity}
          </ThemeTextsecond>
        </View>
  
        {/* Pickup & Dropoff */}
        <View className="mb-4">
          <ThemeText size={Textstyles.text_small}>Pickup Location</ThemeText>
          <ThemeTextsecond>
            Lat: {item.productTransaction.product.pickupLocation.latitude}, Lng:{" "}
            {item.productTransaction.product.pickupLocation.longitude}
          </ThemeTextsecond>
  
          <EmptyView height={10} />
          <ThemeText size={Textstyles.text_small}>Dropoff Location</ThemeText>
          <ThemeTextsecond>
            Lat: {item.dropoffLocation.latitude}, Lng:{" "}
            {item.dropoffLocation.longitude}
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
        <View className="mb-4">
          <ThemeText size={Textstyles.text_small}>From</ThemeText>
          {item.productTransaction.seller?.profile ? (
            <UserDetailsComp 
              firstName={item.productTransaction.seller.profile.firstName} 
              lastName={item.productTransaction.seller.profile.lastName} 
              userId={item.productTransaction.sellerId} 
              avatar={item.productTransaction.seller.profile.avatar ?? ''} 
            />
          ) : (
            <ThemeTextsecond>Seller information unavailable</ThemeTextsecond>
          )}
          <EmptyView height={10} />
          <ThemeText size={Textstyles.text_small}>To</ThemeText>
          {item.productTransaction.buyer?.profile ? (
            <UserDetailsComp 
              firstName={item.productTransaction.buyer.profile.firstName} 
              lastName={item.productTransaction.buyer.profile.lastName} 
              userId={item.productTransaction.buyerId} 
              avatar={item.productTransaction.buyer.profile.avatar ?? ''} 
            />
          ) : (
            <ThemeTextsecond>Buyer information unavailable</ThemeTextsecond>
          )}
        </View>
  
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

interface GeneralUserDetailsProps{
  userId:string;
  firstName:string
  lastName:string
  avatar:string
}

export const UserDetailsComp = ({userId,firstName,lastName,avatar}:GeneralUserDetailsProps) => {
    const { theme } = useTheme()
    const { selectioncardColor,primaryColor } = getColors(theme)
    const [imageError,setImageError]=useState<boolean>(false)

    const [data, setData] = useState<any| null>(null);

  
    const router=useRouter()

    const userIDprofessionalId={userId,professionalId:''}
    return (
        <>
            <View
                style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                className="w-full h-auto py-3 px-3 shadow-sm shadow-black rounded-xl"
            >
                <View className="w-full flex-row justify-between items-center">
                <View className="flex-row gap-x-2 items-center">
                      <View className="w-10 h-10 rounded-full bg-white overflow-hidden justify-center items-center">
                              {avatar && !imageError ? (
                                <Image
                                  resizeMode="cover"
                                  source={{ uri:avatar }}
                                  className="h-full w-full"
                                  onError={() => setImageError(true)}
                                />
                              ) : (
                                <Text style={{ color: primaryColor }} className="text-xl">
                                  {getInitials({ firstName:firstName, lastName:lastName })}
                                </Text>
                              )}
                            </View>
                    <View>
                    <ThemeText size={Textstyles.text_xxxsmall}>
                        {firstName} {lastName}
                    </ThemeText>
                    </View>
               

                </View>
                <View className="flex-row gap-x-2">
                    <TouchableOpacity style={{backgroundColor:"red"}} className="w-6 h-6 rounded-full justify-center items-center">
                        <FontAwesome5 color="#ffffff" name="phone"/>
                    </TouchableOpacity>
                    <TouchableOpacity  onPress={() => router.push(`/mainchat/${JSON.stringify(userIDprofessionalId)}`)} style={{backgroundColor:primaryColor}} className="w-6 h-6 rounded-full justify-center items-center">
                    <Ionicons name="chatbubbles-sharp" color={"#ffffff"} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>router.push('/clientProfileLayout')} style={{borderColor:primaryColor,borderWidth:1}} className="w-6 h-6 rounded-full justify-center items-center">
                        <FontAwesome5 color={primaryColor} name="user"/>
                    </TouchableOpacity>

                </View>

                </View>
    


            </View>
        </>
    )
}

