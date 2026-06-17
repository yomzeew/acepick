import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { useTheme } from "hooks/useTheme";
import { useEffect, useState } from "react";
import {
  TouchableOpacity, View, Text, Modal, StyleSheet,
  ScrollView, Alert, Image, Dimensions, ActivityIndicator,
} from "react-native";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import { DeliveryData, OrderStatusType } from "types/type";
import * as Location from "expo-location";
import { deliveredFn, enRouteToPickupFn, arrivedAtPickupFn, arrivedAtDropoffFn, PickupFn } from "services/deliveryServices";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { getInitials } from "utilizes/initialsName";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

interface ShippingCardProps {
  item: DeliveryData;
  onPress?: () => void;
  showModal?: boolean;
  setShowModal?: (value: boolean) => void;
  onRefresh?: () => void;
}

// ─────────────────── Status config ───────────────────

const getStatusColors = (
  primaryColor: string,
  backgroundColortwo: string
): Record<OrderStatusType, string> => ({
  pending: backgroundColortwo,
  paid: "#F59E0B",
  accepted: primaryColor,
  en_route_to_pickup: primaryColor,
  arrived_at_pickup: primaryColor,
  picked_up: primaryColor,
  confirm_pickup: primaryColor,
  in_transit: primaryColor,
  arrived_at_dropoff: primaryColor,
  delivered: "#10B981",
  confirm_delivery: "#10B981",
  cancelled: "#EF4444",
  disputed: "#F59E0B",
  expired: "#6B7280",
  not_required: "#6B7280",
});

const statusLabels: Record<OrderStatusType, string> = {
  pending: "Pending",
  paid: "Awaiting Rider",
  accepted: "Rider Assigned",
  en_route_to_pickup: "Heading to Seller",
  arrived_at_pickup: "At Seller",
  picked_up: "Item Collected",
  confirm_pickup: "Item Collected",
  in_transit: "On the Way",
  arrived_at_dropoff: "Arrived at Buyer",
  delivered: "Delivered",
  confirm_delivery: "Completed ✓",
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

// ─────────────────── Status flow & actions ───────────────────

const statusFlow = [
  { value: "paid",              label: "Awaiting Rider" },
  { value: "accepted",          label: "Rider Accepted" },
  { value: "en_route_to_pickup",label: "Heading to Seller" },
  { value: "arrived_at_pickup", label: "At Seller Location" },
  { value: "in_transit",        label: "Item Collected — In Transit" },
  { value: "arrived_at_dropoff",label: "Arrived at Buyer" },
  { value: "delivered",         label: "Delivered" },
  { value: "confirm_delivery",  label: "Completed" },
  { value: "cancelled",         label: "Cancelled" },
  { value: "expired",           label: "Expired" },
];

const statusActions: Record<string, { label: string; fn: (id: number) => Promise<any> }> = {
  accepted:           { label: "I'm Heading to Seller",   fn: enRouteToPickupFn },
  en_route_to_pickup: { label: "I've Arrived at Seller",  fn: arrivedAtPickupFn },
  arrived_at_pickup:  { label: "I've Collected the Item", fn: PickupFn },
  in_transit:         { label: "I've Arrived at Buyer",   fn: arrivedAtDropoffFn },
  arrived_at_dropoff: { label: "Mark as Delivered",       fn: deliveredFn },
  // delivered → buyer confirms receipt (CLIENT/PROFESSIONAL only)
};

const getProgressWidth = (status: string): number => {
  const map: Record<string, number> = {
    paid: 10, accepted: 20, en_route_to_pickup: 35,
    arrived_at_pickup: 50, in_transit: 65,
    arrived_at_dropoff: 80, delivered: 92,
    confirm_delivery: 100, cancelled: 100, expired: 0,
    // legacy statuses (backward compat)
    picked_up: 55, confirm_pickup: 60,
  };
  return map[status] ?? 0;
};

// ─────────────────── Mini step indicator ───────────────────

const ACTIVE_STEPS = [
  "accepted", "en_route_to_pickup", "arrived_at_pickup",
  "in_transit", "arrived_at_dropoff", "delivered", "confirm_delivery",
];

const StepDots = ({ status, primaryColor }: { status: string; primaryColor: string }) => {
  const currentIdx = ACTIVE_STEPS.indexOf(status);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      {ACTIVE_STEPS.map((s, i) => {
        const done = i <= currentIdx;
        return (
          <View
            key={s}
            style={{
              width: i === currentIdx ? 20 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: done ? primaryColor : "#E5E7EB",
            }}
          />
        );
      })}
    </View>
  );
};

// ─────────────────── Order Card (list item) ───────────────────

const OrderCard: React.FC<ShippingCardProps> = ({ item, onRefresh }) => {
  const { theme } = useTheme();
  const {
    selectioncardColor, backgroundColor, primaryColor,
    backgroundColortwo, borderColor,
  } = getColors(theme);
  const statusColors = getStatusColors(primaryColor, backgroundColortwo);
  const [showModal, setShowModal] = useState(false);

  const [pickupAddress, setPickupAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");

  const latPickup = item.productTransaction.product.pickupLocation.latitude || 0;
  const lngPickup = item.productTransaction.product.pickupLocation.longitude || 0;
  const latDest   = item.dropoffLocation.latitude  || 0;
  const lngDest   = item.dropoffLocation.longitude || 0;

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const pickup = await Location.reverseGeocodeAsync({ latitude: latPickup, longitude: lngPickup });
        if (pickup.length > 0)
          setPickupAddress(`${pickup[0].name || ""} ${pickup[0].street || ""}, ${pickup[0].city || ""}`.trim());
        if (latDest && lngDest) {
          const dest = await Location.reverseGeocodeAsync({ latitude: latDest, longitude: lngDest });
          if (dest.length > 0)
            setDestinationAddress(`${dest[0].name || ""} ${dest[0].street || ""}, ${dest[0].city || ""}`.trim());
        }
      } catch { /* silent */ }
    })();
  }, []);

  const accentColor = statusColors[item.status];
  const isDark = theme === "dark";

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
          borderLeftColor: accentColor,
        }}
      >
        {/* Header row */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <ThemeText size={Textstyles.text_cmedium} className="font-semibold">
              Order #{item.id}
            </ThemeText>
            <ThemeTextsecond>{item.productTransaction.product.name}</ThemeTextsecond>
          </View>
          <View style={{
            backgroundColor: accentColor + "20",
            borderWidth: 1,
            borderColor: accentColor,
            paddingVertical: 4, paddingHorizontal: 10,
            borderRadius: 20,
            flexDirection: "row", alignItems: "center",
          }}>
            <Ionicons name={statusIcons[item.status]} size={12} color={accentColor} />
            <Text style={{ color: accentColor, fontSize: 11, fontWeight: "600", marginLeft: 4 }}>
              {statusLabels[item.status]}
            </Text>
          </View>
        </View>

        {/* Package + earnings */}
        <View style={{ backgroundColor: isDark ? "#1f2937" : "#f9fafb", borderRadius: 10, padding: 12, marginBottom: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: isDark ? "#9ca3af" : "#6b7280", marginBottom: 4 }}>Package</Text>
              <Text style={{ fontSize: 14, fontWeight: "500", color: isDark ? "#f3f4f6" : "#111827" }}>
                {item.productTransaction.product.name}
              </Text>
              <Text style={{ fontSize: 12, color: isDark ? "#9ca3af" : "#6b7280", marginTop: 4 }}>
                Qty: {item.productTransaction.quantity}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 10, color: isDark ? "#9ca3af" : "#6b7280", textAlign: "right", marginBottom: 2 }}>Package Value</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: isDark ? "#f3f4f6" : "#374151", textAlign: "right" }}>
                ₦{Number(item.productTransaction.price).toLocaleString()}
              </Text>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: isDark ? "#374151" : "#E5E7EB", marginBottom: 10 }} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="wallet-outline" size={14} color={primaryColor} />
              <Text style={{ fontSize: 12, fontWeight: "600", color: isDark ? "#9ca3af" : "#6b7280" }}>
                Your Earnings
              </Text>
            </View>
            <View style={{ backgroundColor: primaryColor + "15", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
              <Text style={{ color: primaryColor, fontWeight: "700", fontSize: 14 }}>
                ₦{Number(item.cost).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Route */}
        <View style={{ marginBottom: 12 }}>
          {[
            { icon: "location" as const, label: "Pickup", address: pickupAddress || "Loading…", color: primaryColor },
            { icon: "flag" as const,     label: "Dropoff", address: destinationAddress || "Loading…", color: accentColor },
          ].map((r, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: i === 0 ? 8 : 0 }}>
              <View style={{
                width: 24, height: 24, borderRadius: 12,
                backgroundColor: r.color + "15",
                alignItems: "center", justifyContent: "center",
                marginRight: 12, marginTop: 2,
              }}>
                <Ionicons name={r.icon} size={13} color={r.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: isDark ? "#9ca3af" : "#6b7280", marginBottom: 2 }}>{r.label}</Text>
                <Text style={{ fontSize: 13, color: isDark ? "#f3f4f6" : "#111827" }}>{r.address}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Distance / expiry */}
        {(item.distance || item.expiresAt) && (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            {item.distance && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="navigate" size={13} color={isDark ? "#9ca3af" : "#6b7280"} />
                <Text style={{ fontSize: 12, color: isDark ? "#9ca3af" : "#6b7280", marginLeft: 4 }}>
                  {typeof item.distance === "number" ? `${item.distance.toFixed(1)} km` : "N/A"}
                </Text>
              </View>
            )}
            {item?.expiresAt && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="time" size={13} color={isDark ? "#9ca3af" : "#6b7280"} />
                <Text style={{ fontSize: 12, color: isDark ? "#9ca3af" : "#6b7280", marginLeft: 4 }}>
                  Expires {new Date(item.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Progress bar */}
        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ fontSize: 11, color: isDark ? "#9ca3af" : "#6b7280" }}>Progress</Text>
            <Text style={{ fontSize: 11, color: isDark ? "#9ca3af" : "#6b7280" }}>
              {getProgressWidth(item.status)}%
            </Text>
          </View>
          <View style={{ height: 6, backgroundColor: borderColor, borderRadius: 3 }}>
            <View style={{
              width: `${getProgressWidth(item.status)}%`,
              height: "100%",
              backgroundColor: accentColor,
              borderRadius: 3,
            }} />
          </View>
        </View>
      </TouchableOpacity>

      {/* ── Bottom-sheet modal ── */}
      <Modal
        animationType="slide"
        transparent
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.sheetBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowModal(false)} />
          <View style={[styles.sheet, { backgroundColor }]}>
            {/* Drag handle */}
            <View style={styles.dragHandle} />
            <DeliveryDetails
              item={item}
              onRefresh={onRefresh}
              pickupAddress={pickupAddress}
              destinationAddress={destinationAddress}
              onClose={() => setShowModal(false)}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

// ─────────────────── Bottom-sheet content ───────────────────

interface DeliveryDetailsProps extends ShippingCardProps {
  pickupAddress: string;
  destinationAddress: string;
  onClose: () => void;
}

const DeliveryDetails = ({ item, onRefresh, pickupAddress, destinationAddress, onClose }: DeliveryDetailsProps) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColortwo, borderColor, backgroundColor } = getColors(theme);
  const statusColors = getStatusColors(primaryColor, backgroundColortwo);
  const accentColor = statusColors[item.status];
  const isDark = theme === "dark";

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      statusActions[status].fn(id),
    onSuccess: (_data, variables) => {
      if (onRefresh) onRefresh();
      // Close modal and show success briefly
      onClose();
      Alert.alert("✅ Updated", `Delivery moved to: ${statusLabels[variables.status as OrderStatusType] ?? variables.status}`);
    },
    onError: (err: any) => {
      Alert.alert("❌ Failed", err?.message || "Something went wrong. Please try again.");
    },
  });

  const currentAction = statusActions[item.status];
  const progress = getProgressWidth(item.status);

  const sectionLabel = (txt: string) => (
    <Text style={{ fontSize: 11, fontWeight: "700", color: isDark ? "#6b7280" : "#9ca3af", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10, marginTop: 20 }}>
      {txt}
    </Text>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* ── Scrollable body ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24 }}
      >
        {/* ── Status hero ── */}
        <View style={{
          backgroundColor: accentColor + "12",
          borderRadius: 16, padding: 16, marginBottom: 4,
          borderWidth: 1, borderColor: accentColor + "30",
          alignItems: "center",
        }}>
          <View style={{
            width: 56, height: 56, borderRadius: 28,
            backgroundColor: accentColor + "20",
            alignItems: "center", justifyContent: "center",
            marginBottom: 10,
          }}>
            <Ionicons name={statusIcons[item.status]} size={26} color={accentColor} />
          </View>
          <Text style={{ fontSize: 17, fontWeight: "700", color: accentColor, marginBottom: 4 }}>
            {statusLabels[item.status]}
          </Text>
          <Text style={{ fontSize: 13, color: isDark ? "#9ca3af" : "#6b7280", textAlign: "center" }}>
            Order #{item.id} · {item.productTransaction.product.name}
          </Text>
          {/* Step dots */}
          <View style={{ marginTop: 14 }}>
            <StepDots status={item.status} primaryColor={accentColor} />
          </View>
          {/* Progress */}
          <View style={{ width: "100%", marginTop: 10 }}>
            <View style={{ height: 5, backgroundColor: accentColor + "25", borderRadius: 3 }}>
              <View style={{ width: `${progress}%`, height: "100%", backgroundColor: accentColor, borderRadius: 3 }} />
            </View>
          </View>
        </View>

        {/* ── Earnings ── */}
        {sectionLabel("Your Earnings")}
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          backgroundColor: isDark ? "#1f2937" : "#f9fafb",
          borderRadius: 14, padding: 16,
          borderWidth: 1, borderColor: isDark ? "#374151" : "#e5e7eb",
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: primaryColor + "15", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="wallet-outline" size={20} color={primaryColor} />
            </View>
            <View>
              <Text style={{ fontSize: 12, color: isDark ? "#9ca3af" : "#6b7280" }}>Delivery Fee</Text>
              <Text style={{ fontSize: 20, fontWeight: "800", color: primaryColor }}>
                ₦{Number(item.cost).toLocaleString()}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 11, color: isDark ? "#9ca3af" : "#6b7280", marginBottom: 2 }}>Package Value</Text>
            <Text style={{ fontSize: 14, fontWeight: "600", color: isDark ? "#e5e7eb" : "#374151" }}>
              ₦{Number(item.productTransaction.price).toLocaleString()}
            </Text>
            <Text style={{ fontSize: 11, color: isDark ? "#9ca3af" : "#6b7280", marginTop: 2 }}>
              Qty: {item.productTransaction.quantity}
            </Text>
          </View>
        </View>

        {/* ── Route card ── */}
        {sectionLabel("Delivery Route")}
        <View style={{
          backgroundColor: isDark ? "#1f2937" : "#f9fafb",
          borderRadius: 14, padding: 16,
          borderWidth: 1, borderColor: isDark ? "#374151" : "#e5e7eb",
        }}>
          {/* Pickup */}
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View style={{ alignItems: "center", marginRight: 14 }}>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: primaryColor + "15", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="location" size={16} color={primaryColor} />
              </View>
              {/* vertical dashes */}
              <View style={{ width: 2, height: 32, marginTop: 4, backgroundColor: isDark ? "#374151" : "#e5e7eb", borderRadius: 1 }} />
            </View>
            <View style={{ flex: 1, paddingTop: 4 }}>
              <Text style={{ fontSize: 11, color: isDark ? "#6b7280" : "#9ca3af", marginBottom: 2 }}>PICKUP</Text>
              <Text style={{ fontSize: 14, fontWeight: "600", color: isDark ? "#f3f4f6" : "#111827", marginBottom: 4 }}>
                {pickupAddress || "Loading address…"}
              </Text>
              {item.productTransaction.product.pickupLocation.latitude ? (
                <Text style={{ fontSize: 11, color: isDark ? "#6b7280" : "#9ca3af" }}>
                  {Number(item.productTransaction.product.pickupLocation.latitude).toFixed(5)}, {Number(item.productTransaction.product.pickupLocation.longitude).toFixed(5)}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Dropoff */}
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View style={{ alignItems: "center", marginRight: 14 }}>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "#10B98115", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="flag" size={16} color="#10B981" />
              </View>
            </View>
            <View style={{ flex: 1, paddingTop: 4 }}>
              <Text style={{ fontSize: 11, color: isDark ? "#6b7280" : "#9ca3af", marginBottom: 2 }}>DROPOFF</Text>
              <Text style={{ fontSize: 14, fontWeight: "600", color: isDark ? "#f3f4f6" : "#111827", marginBottom: 4 }}>
                {destinationAddress || "Loading address…"}
              </Text>
              {item.dropoffLocation.latitude ? (
                <Text style={{ fontSize: 11, color: isDark ? "#6b7280" : "#9ca3af" }}>
                  {Number(item.dropoffLocation.latitude).toFixed(5)}, {Number(item.dropoffLocation.longitude).toFixed(5)}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Distance pill */}
          {item.distance ? (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, gap: 6 }}>
              <Ionicons name="navigate-circle-outline" size={14} color={isDark ? "#6b7280" : "#9ca3af"} />
              <Text style={{ fontSize: 12, color: isDark ? "#6b7280" : "#9ca3af" }}>
                {typeof item.distance === "number" ? `${item.distance.toFixed(1)} km total` : item.distance}
              </Text>
              {item.expiresAt && (
                <>
                  <Text style={{ color: isDark ? "#374151" : "#d1d5db", fontSize: 12 }}>·</Text>
                  <Ionicons name="time-outline" size={14} color={isDark ? "#6b7280" : "#9ca3af"} />
                  <Text style={{ fontSize: 12, color: isDark ? "#6b7280" : "#9ca3af" }}>
                    Expires {new Date(item.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </>
              )}
            </View>
          ) : null}
        </View>

        {/* ── People ── */}
        {sectionLabel("Sender & Recipient")}
        <View style={{ gap: 10 }}>
          {item.productTransaction.seller?.profile && (
            <UserDetailsComp
              label="Seller"
              firstName={item.productTransaction.seller.profile.firstName}
              lastName={item.productTransaction.seller.profile.lastName}
              userId={item.productTransaction.sellerId}
              avatar={item.productTransaction.seller.profile.avatar ?? ""}
            />
          )}
          {item.productTransaction.buyer?.profile && (
            <UserDetailsComp
              label="Buyer"
              firstName={item.productTransaction.buyer.profile.firstName}
              lastName={item.productTransaction.buyer.profile.lastName}
              userId={item.productTransaction.buyerId}
              avatar={item.productTransaction.buyer.profile.avatar ?? ""}
            />
          )}
        </View>

        {/* Bottom spacer for the sticky button */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Sticky CTA ── */}
      {!["cancelled", "confirm_delivery", "expired"].includes(item.status) && (
        <View style={[styles.stickyFooter, { backgroundColor, borderColor: isDark ? "#1f2937" : "#f3f4f6" }]}>
          {currentAction ? (
            <TouchableOpacity
              onPress={() => mutation.mutate({ id: item.id, status: item.status })}
              disabled={mutation.isPending}
              style={[styles.ctaBtn, { backgroundColor: accentColor, opacity: mutation.isPending ? 0.7 : 1 }]}
            >
              {mutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name={statusIcons[item.status]} size={18} color="#fff" />
              )}
              <Text style={styles.ctaText}>
                {mutation.isPending ? "Updating…" : currentAction.label}
              </Text>
            </TouchableOpacity>
          ) : (
            /* Waiting state — buyer must confirm receipt */
            item.status === "delivered" ? (
              <View style={[styles.ctaBtn, { backgroundColor: isDark ? "#1f2937" : "#f3f4f6", borderWidth: 1, borderColor: isDark ? "#374151" : "#e5e7eb" }]}>
                <ActivityIndicator size="small" color="#10B981" />
                <Text style={[styles.ctaText, { color: isDark ? "#9ca3af" : "#6b7280" }]}>
                  Waiting for buyer to confirm receipt
                </Text>
              </View>
            ) : null
          )}
        </View>
      )}
    </View>
  );
};

// ─────────────────── User details row ───────────────────

interface GeneralUserDetailsProps {
  userId: string | null;
  firstName: string;
  lastName: string;
  avatar: string | null;
  label?: string;
  role?: 'client' | 'professional' | 'delivery' | string;
}

export const UserDetailsComp = ({ userId, firstName, lastName, avatar, label, role }: GeneralUserDetailsProps) => {
  const { theme } = useTheme();
  const { selectioncardColor, primaryColor, borderColor } = getColors(theme);
  const [imageError, setImageError] = useState(false);
  const isDark = theme === "dark";
  const router = useRouter();
  const userIDprofessionalId = { userId, professionalId: "" };
  const handleViewProfile = () => {
    if (!userId) return;
    if (role === 'delivery') {
      router.push(`/rider/${userId}` as any);
    } else {
      router.push(`/professional/${userId}?byUser=1` as any);
    }
  };

  return (
    <View style={{
      backgroundColor: selectioncardColor,
      borderRadius: 14, padding: 14,
      borderWidth: 1, borderColor: isDark ? "#1f2937" : "#f3f4f6",
      flexDirection: "row", alignItems: "center",
    }}>
      {/* Avatar */}
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isDark ? "#374151" : "#f3f4f6", overflow: "hidden", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
        {avatar && !imageError ? (
          <Image resizeMode="cover" source={{ uri: avatar }} style={{ width: "100%", height: "100%" }} onError={() => setImageError(true)} />
        ) : (
          <Text style={{ color: primaryColor, fontWeight: "700", fontSize: 16 }}>
            {getInitials({ firstName, lastName })}
          </Text>
        )}
      </View>

      {/* Name + label */}
      <View style={{ flex: 1 }}>
        {label && (
          <Text style={{ fontSize: 10, fontWeight: "700", color: isDark ? "#6b7280" : "#9ca3af", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2 }}>
            {label}
          </Text>
        )}
        <Text style={{ fontSize: 15, fontWeight: "600", color: isDark ? "#f3f4f6" : "#111827" }}>
          {firstName} {lastName}
        </Text>
      </View>

      {/* Action buttons */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TouchableOpacity style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "#EF444415", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="call-outline" size={16} color="#EF4444" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(`/mainchat/${JSON.stringify(userIDprofessionalId)}`)}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: primaryColor + "15", alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={primaryColor} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleViewProfile}
          style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: isDark ? "#374151" : "#e5e7eb", alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="person-outline" size={16} color={isDark ? "#9ca3af" : "#6b7280"} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─────────────────── Styles ───────────────────

const styles = StyleSheet.create({
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    height: SCREEN_H * 0.88,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d1d5db",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 14,
  },
  stickyFooter: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    borderRadius: 14,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default OrderCard;
