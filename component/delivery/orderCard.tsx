import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { useTheme } from "hooks/useTheme";
import { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, Modal, StyleSheet, ScrollView, Alert,Image } from "react-native";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import { DeliveryData } from "types/type";
import * as Location from "expo-location";
import EmptyView from "component/emptyview";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import ClientDetails, { ClientDetailsForProf } from "component/dashboardComponent/clientdetail";
import { acceptDeliveryFn, confirmDeliverdFn, confirmPickupFn, deliveredFn, inTransitFn, PickupFn } from "services/deliveryServices";
import { useMutation } from "@tanstack/react-query";
import { Delivery } from "types/orderRider";
import { useRouter } from "expo-router";
import { getInitials } from "utilizes/initialsName";

interface ShippingCardProps {
    item: Delivery
    onPress?: () => void;
    showModal?: boolean
    setShowModal?: (value: boolean) => void
    onRefresh?: () => void; // 👈 new prop
}

// Map status to colors


  
  
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
const OrderCard: React.FC<ShippingCardProps> = ({ item,onRefresh }) => {

    const { theme } = useTheme();
    const { selectioncardColor,backgroundColor } = getColors(theme);
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
                    padding: 15,
                    marginBottom: 10,
                    borderRadius: 10,
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 4,
                    elevation: 3,
                }}
                className="w-full"
            >
                {/* Order header */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                    <ThemeText size={Textstyles.text_cmedium}>Order #{item.id}</ThemeText>
                    <View
                        style={{
                            backgroundColor: statusColors[item.status],
                            paddingVertical: 3,
                            paddingHorizontal: 8,
                            borderRadius: 20,
                        }}
                    >
                        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>{item.status}</Text>
                    </View>
                </View>

                {/* Pickup */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                    <Ionicons name="location-outline" size={16} color="#1E90FF" />
                    <ThemeTextsecond>
                        {pickupAddress || "Loading pickup address..."}
                    </ThemeTextsecond>
                </View>

                {/* Destination */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="flag-outline" size={16} color="#32CD32" />
                    <ThemeTextsecond>
                        {destinationAddress || "Loading destination address..."}
                    </ThemeTextsecond>
                </View>

                {/* Fare */}
                <ThemeTextsecond>Fare: ₦{item.cost}</ThemeTextsecond>
                <EmptyView height={10} />

                {/* Progress Bar for Delivery Status */}
                <View style={{ height: 6, backgroundColor: "#E0E0E0", borderRadius: 4 }}>
                    <View
                        style={{
                            width: `${getProgressWidth(item.status)}%`,
                            height: "100%",
                            backgroundColor: statusColors[item.status],
                            borderRadius: 4,
                        }}
                    />
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
                                <FontAwesome5 color="red" size={24} name="times-circle" />
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
      case "pending":
        return 10;
      case "accepted":
        return 25;
      case "picked_up":
        return 40;
      case "confirm_pickup":
        return 55;
      case "in_transit":
        return 70;
      case "delivered":
        return 85;
      case "confirm_delivery":
        return 100;
      case "cancelled":
        return 100; // stays at full bar but maybe show red
      default:
        return 0;
    }
  };
export default OrderCard

// Status Flow
const statusFlow = [
    { value: "accepted", label: "Rider Accepted" },          // rider accepts
    { value: "picked_up", label: "Picked Up" },          // rider accepts
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
    delivered: { label: "Mark Delivery", fn: deliveredFn}, // buyer confirms
    confirm_delivery: { label: "Mark Delivery", fn: confirmDeliverdFn },   // end
    missed: { label: "Missed", fn: async () => {} },                 // no-op
    cancelled: { label: "Cancelled", fn: async () => {} },           // no-op
  };


 const DeliveryDetails = ({ item,onRefresh }: ShippingCardProps) => {
    const { theme } = useTheme();
    const { primaryColor } = getColors(theme);
  
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
          <UserDetailsComp firstName={item.productTransaction.seller.profile.firstName} lastName={item.productTransaction.seller.profile.lastName} userId={item.productTransaction.sellerId} avatar={item.productTransaction.seller.profile.avatar} />
          <EmptyView height={10} />
          <ThemeText size={Textstyles.text_small}>To</ThemeText>
          <UserDetailsComp firstName={item.productTransaction.buyer.profile.firstName} lastName={item.productTransaction.buyer.profile.lastName} userId={item.productTransaction.buyerId} avatar={item.productTransaction.buyer.profile.avatar} />
  
        
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

