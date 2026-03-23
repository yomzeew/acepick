import { useMutation } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import FallbackImage from "component/FallbackImage";
import { useRouter } from "expo-router";
import { useTheme } from "hooks/useTheme";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  View,
  Text,
  FlatList,
  RefreshControl,
  Dimensions,
} from "react-native";
import { getBoughtProductFn, getMineProduct, getSoldProductFn } from "services/marketplaceServices";
import { getColors } from "static/color";
import { ProductTransaction } from "types/productTransType";
import { Product } from "types/type";
import { formatAmount } from "utilizes/amountFormat";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Status helpers ───────────────────────────────────────────
const getTransactionStatusStyle = (status: string, primary: string, secondary: string) => {
  // Normalize: backend may return 'pt_pending' (Prisma key) or 'pending' (mapped value)
  const normalized = status?.toLowerCase().replace(/^pt_/, '');
  switch (normalized) {
    case "pending":
      return { bg: secondary + '15', text: secondary, icon: "time-outline" as const, label: "Pending" };
    case "ordered":
      return { bg: primary + '15', text: primary, icon: "cart-outline" as const, label: "Ordered" };
    case "delivered":
      return { bg: primary + '15', text: primary, icon: "checkmark-circle-outline" as const, label: "Delivered" };
    case "disputed":
      return { bg: secondary + '15', text: secondary, icon: "warning-outline" as const, label: "Disputed" };
    case "cancelled":
      return { bg: secondary + '15', text: secondary, icon: "close-circle-outline" as const, label: "Cancelled" };
    default:
      return { bg: secondary + '15', text: secondary, icon: "help-circle-outline" as const, label: normalized || "Unknown" };
  }
};

const getApprovalStatusStyle = (approved: boolean | null | undefined, primary: string, secondary: string) => {
  if (approved === true) {
    return { bg: primary + '15', text: primary, icon: "checkmark-circle" as const, label: "Approved" };
  }
  if (approved === false) {
    return { bg: secondary + '15', text: secondary, icon: "close-circle" as const, label: "Rejected" };
  }
  return { bg: secondary + '15', text: secondary, icon: "time" as const, label: "Awaiting Approval" };
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};

// ─── Main Component ───────────────────────────────────────────
const MyItems = () => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColortwo } = getColors(theme);
  const router = useRouter();

  const isDark = theme === "dark";
  const bgColor = isDark ? "#111827" : "#F3F4F6";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const dividerColor = isDark ? "#374151" : "#E5E7EB";

  const tabs = ["Listings", "Sold", "Bought"] as const;
  type TabType = (typeof tabs)[number];
  const [activeTab, setActiveTab] = useState<TabType>("Listings");

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: primaryColor,
          paddingTop: 50,
          paddingBottom: 20,
          paddingHorizontal: 16,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>My Items</Text>
          <View style={{ width: 32 }} />
        </View>
      </View>

      {/* Tab Switcher */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 16,
          marginTop: 16,
          marginBottom: 8,
          backgroundColor: isDark ? "#374151" : "#E5E7EB",
          borderRadius: 14,
          padding: 3,
        }}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 12,
              alignItems: "center",
              backgroundColor: activeTab === tab ? primaryColor : "transparent",
            }}
          >
            <Text
              style={{
                color: activeTab === tab ? "#fff" : textSecondary,
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === "Listings" && <MyListingsComponent />}
      {activeTab === "Sold" && <SoldComponent />}
      {activeTab === "Bought" && <BoughtComponent />}
    </View>
  );
};

export default MyItems;

// ─── My Listings Component ────────────────────────────────────
const MyListingsComponent = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { primaryColor, backgroundColortwo } = getColors(theme);

  const isDark = theme === "dark";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const dividerColor = isDark ? "#374151" : "#E5E7EB";

  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");

  const mutation = useMutation({
    mutationFn: getMineProduct,
    onSuccess: (response) => setProducts(response || []),
    onError: () => setProducts([]),
  });

  useEffect(() => {
    mutation.mutate();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    mutation.mutate();
    setRefreshing(false);
  };

  const filteredProducts = products.filter((p) => {
    if (filter === "all") return true;
    if (filter === "approved") return p.approved === true;
    if (filter === "pending") return p.approved === null || p.approved === undefined;
    if (filter === "rejected") return p.approved === false;
    return true;
  });

  const filters = ["all", "approved", "pending", "rejected"] as const;

  const getImageSource = (item: Product) => {
    if (Array.isArray(item.images) && item.images.length > 0 && item.images[0]) {
      return { uri: item.images[0] };
    }
    return require("../../assets/homebg.png");
  };

  const renderProductCard = ({ item }: { item: Product }) => {
    const statusStyle = getApprovalStatusStyle(item.approved, primaryColor, backgroundColortwo);
    const price = Number(item.price);

    return (
      <TouchableOpacity
        onPress={() => router.push(`/productdetailsLayout?id=${item.id}`)}
        activeOpacity={0.7}
        style={{
          backgroundColor: cardBg,
          borderRadius: 16,
          marginBottom: 12,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          {/* Image */}
          <View style={{ width: 110, height: 110, backgroundColor: isDark ? "#374151" : "#F9FAFB" }}>
            <FallbackImage source={getImageSource(item)} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          </View>

          {/* Info */}
          <View style={{ flex: 1, padding: 12, justifyContent: "space-between" }}>
            <View>
              {item.category && (
                <Text
                  style={{ color: primaryColor, fontSize: 10, fontWeight: "600", textTransform: "uppercase", marginBottom: 2 }}
                  numberOfLines={1}
                >
                  {item.category.name}
                </Text>
              )}
              <Text style={{ color: textPrimary, fontSize: 14, fontWeight: "600", marginBottom: 4 }} numberOfLines={2}>
                {item.name}
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: primaryColor, fontSize: 16, fontWeight: "700" }}>
                {formatAmount(price)}
              </Text>
              <Text style={{ color: textSecondary, fontSize: 11 }}>
                Qty: {item.quantity}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Badge */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderTopWidth: 1,
            borderTopColor: dividerColor,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: statusStyle.bg,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              gap: 4,
            }}
          >
            <Ionicons name={statusStyle.icon} size={14} color={statusStyle.text} />
            <Text style={{ color: statusStyle.text, fontSize: 12, fontWeight: "600" }}>
              {statusStyle.label}
            </Text>
          </View>
          {item.createdAt && (
            <Text style={{ color: textSecondary, fontSize: 11 }}>
              {formatDate(item.createdAt)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Filter pills */}
      <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
        {filters.map((f) => {
          const isActive = filter === f;
          const count =
            f === "all"
              ? products.length
              : f === "approved"
              ? products.filter((p) => p.approved === true).length
              : f === "pending"
              ? products.filter((p) => p.approved === null || p.approved === undefined).length
              : products.filter((p) => p.approved === false).length;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={{
                backgroundColor: isActive ? primaryColor : isDark ? "#374151" : "#E5E7EB",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text style={{ color: isActive ? "#fff" : textSecondary, fontSize: 12, fontWeight: "600", textTransform: "capitalize" }}>
                {f}
              </Text>
              <View
                style={{
                  backgroundColor: isActive ? "rgba(255,255,255,0.3)" : isDark ? "#4B5563" : "#D1D5DB",
                  paddingHorizontal: 5,
                  paddingVertical: 1,
                  borderRadius: 8,
                  minWidth: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: isActive ? "#fff" : textSecondary, fontSize: 10, fontWeight: "700" }}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {mutation.isPending && products.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={{ color: textSecondary, marginTop: 12 }}>Loading your products...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => `listing-${item.id}`}
          renderItem={renderProductCard}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={primaryColor} colors={[primaryColor]} />}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Ionicons name="storefront-outline" size={56} color={dividerColor} />
              <Text style={{ color: textSecondary, fontSize: 16, fontWeight: "600", marginTop: 12 }}>No products found</Text>
              <Text style={{ color: textSecondary, fontSize: 13, marginTop: 4 }}>
                {filter !== "all" ? "Try changing the filter" : "Add your first product to the marketplace"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

// ─── Sold Component ───────────────────────────────────────────
const SoldComponent = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { primaryColor, backgroundColortwo } = getColors(theme);

  const isDark = theme === "dark";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const dividerColor = isDark ? "#374151" : "#E5E7EB";

  const [productData, setProductData] = useState<ProductTransaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<"all" | "pending" | "ordered" | "delivered" | "disputed">("all");

  const statuses: Array<"all" | "pending" | "ordered" | "delivered" | "disputed"> = [
    "all", "pending", "ordered", "delivered", "disputed",
  ];

  const mutation = useMutation({
    mutationFn: getSoldProductFn,
    onSuccess: (response) => setProductData(response || []),
    onError: () => setProductData([]),
  });

  useEffect(() => {
    mutation.mutate({ status: status === "all" ? "all" : status });
  }, [status]);

  const handleRefresh = () => {
    setRefreshing(true);
    mutation.mutate({ status: status === "all" ? "all" : status });
    setRefreshing(false);
  };

  const getImageSource = (images: any) => {
    if (Array.isArray(images) && images.length > 0 && images[0]) return { uri: images[0] };
    return require("../../assets/homebg.png");
  };

  const renderCard = ({ item }: { item: ProductTransaction }) => {
    const product = item.product;
    const statusStyle = getTransactionStatusStyle(item.status, primaryColor, backgroundColortwo);
    const buyer = item.buyer;
    const buyerName = buyer?.profile
      ? `${buyer.profile.firstName || ""} ${buyer.profile.lastName || ""}`.trim()
      : "Unknown Buyer";

    return (
      <TouchableOpacity
        onPress={() => router.push(`/orderproductdetails?id=${item.id}`)}
        activeOpacity={0.7}
        style={{
          backgroundColor: cardBg,
          borderRadius: 16,
          marginBottom: 12,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          {/* Image */}
          <View style={{ width: 100, height: 100, backgroundColor: isDark ? "#374151" : "#F9FAFB" }}>
            <FallbackImage source={getImageSource(product.images)} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          </View>

          {/* Info */}
          <View style={{ flex: 1, padding: 12, justifyContent: "space-between" }}>
            <Text style={{ color: textPrimary, fontSize: 14, fontWeight: "600" }} numberOfLines={1}>
              {product.name}
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
              <Ionicons name="person-outline" size={12} color={textSecondary} />
              <Text style={{ color: textSecondary, fontSize: 12 }} numberOfLines={1}>
                {buyerName}
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
              <Text style={{ color: primaryColor, fontSize: 15, fontWeight: "700" }}>
                {formatAmount(Number(item.price))}
              </Text>
              <Text style={{ color: textSecondary, fontSize: 11 }}>
                x{item.quantity}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderTopWidth: 1,
            borderTopColor: dividerColor,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: statusStyle.bg,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              gap: 4,
            }}
          >
            <Ionicons name={statusStyle.icon} size={14} color={statusStyle.text} />
            <Text style={{ color: statusStyle.text, fontSize: 12, fontWeight: "600" }}>
              {statusStyle.label}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons
              name={item.orderMethod === "delivery" ? "bicycle-outline" : "walk-outline"}
              size={14}
              color={textSecondary}
            />
            <Text style={{ color: textSecondary, fontSize: 11, textTransform: "capitalize" }}>
              {item.orderMethod === "delivery" ? "Delivery" : "Pickup"}
            </Text>
          </View>
          <Text style={{ color: textSecondary, fontSize: 11 }}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Status filter pills */}
      <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 8, gap: 8, flexWrap: "wrap" }}>
        {statuses.map((s) => {
          const isActive = status === s;
          const style = s === "all"
            ? { bg: backgroundColortwo + '15', text: backgroundColortwo }
            : getTransactionStatusStyle(s, primaryColor, backgroundColortwo);
          return (
            <TouchableOpacity
              key={s}
              onPress={() => setStatus(s)}
              style={{
                backgroundColor: isActive ? primaryColor : isDark ? "#374151" : style.bg,
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  color: isActive ? "#fff" : isDark ? textSecondary : style.text,
                  fontSize: 12,
                  fontWeight: "600",
                  textTransform: "capitalize",
                }}
              >
                {s}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {mutation.isPending && productData.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={{ color: textSecondary, marginTop: 12 }}>Loading sold items...</Text>
        </View>
      ) : (
        <FlatList
          data={productData}
          keyExtractor={(item) => `sold-${item.id}`}
          renderItem={renderCard}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={primaryColor} colors={[primaryColor]} />}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Ionicons name="receipt-outline" size={56} color={dividerColor} />
              <Text style={{ color: textSecondary, fontSize: 16, fontWeight: "600", marginTop: 12 }}>No sold items</Text>
              <Text style={{ color: textSecondary, fontSize: 13, marginTop: 4 }}>
                Items you sell will appear here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

// ─── Bought Component ─────────────────────────────────────────
const BoughtComponent = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { primaryColor, backgroundColortwo } = getColors(theme);

  const isDark = theme === "dark";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const dividerColor = isDark ? "#374151" : "#E5E7EB";

  const [productData, setProductData] = useState<ProductTransaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<"all" | "pending" | "ordered" | "delivered" | "disputed">("all");

  const statuses: Array<"all" | "pending" | "ordered" | "delivered" | "disputed"> = [
    "all", "pending", "ordered", "delivered", "disputed",
  ];

  const mutation = useMutation({
    mutationFn: getBoughtProductFn,
    onSuccess: (response) => setProductData(response || []),
    onError: () => setProductData([]),
  });

  useEffect(() => {
    mutation.mutate({ status: status === "all" ? "all" : status });
  }, [status]);

  const handleRefresh = () => {
    setRefreshing(true);
    mutation.mutate({ status: status === "all" ? "all" : status });
    setRefreshing(false);
  };

  const getImageSource = (images: any) => {
    if (Array.isArray(images) && images.length > 0 && images[0]) return { uri: images[0] };
    return require("../../assets/homebg.png");
  };

  const renderCard = ({ item }: { item: ProductTransaction }) => {
    const product = item.product;
    const statusStyle = getTransactionStatusStyle(item.status, primaryColor, backgroundColortwo);
    const order = item.order;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/orderproductdetails?id=${item.id}`)}
        activeOpacity={0.7}
        style={{
          backgroundColor: cardBg,
          borderRadius: 16,
          marginBottom: 12,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          {/* Image */}
          <View style={{ width: 100, height: 100, backgroundColor: isDark ? "#374151" : "#F9FAFB" }}>
            <FallbackImage source={getImageSource(product.images)} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          </View>

          {/* Info */}
          <View style={{ flex: 1, padding: 12, justifyContent: "space-between" }}>
            <Text style={{ color: textPrimary, fontSize: 14, fontWeight: "600" }} numberOfLines={1}>
              {product.name}
            </Text>

            {order && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                <Ionicons name="cube-outline" size={12} color={textSecondary} />
                <Text style={{ color: textSecondary, fontSize: 12 }}>
                  Order #{order.id}
                </Text>
                {order.rider && (
                  <>
                    <Text style={{ color: textSecondary, fontSize: 12 }}> | </Text>
                    <Ionicons name="bicycle-outline" size={12} color={textSecondary} />
                    <Text style={{ color: textSecondary, fontSize: 12 }} numberOfLines={1}>
                      {order.rider.profile?.firstName || "Rider"}
                    </Text>
                  </>
                )}
              </View>
            )}

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
              <Text style={{ color: primaryColor, fontSize: 15, fontWeight: "700" }}>
                {formatAmount(Number(item.price))}
              </Text>
              <Text style={{ color: textSecondary, fontSize: 11 }}>
                x{item.quantity}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderTopWidth: 1,
            borderTopColor: dividerColor,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: statusStyle.bg,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              gap: 4,
            }}
          >
            <Ionicons name={statusStyle.icon} size={14} color={statusStyle.text} />
            <Text style={{ color: statusStyle.text, fontSize: 12, fontWeight: "600" }}>
              {statusStyle.label}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons
              name={item.orderMethod === "delivery" ? "bicycle-outline" : "walk-outline"}
              size={14}
              color={textSecondary}
            />
            <Text style={{ color: textSecondary, fontSize: 11, textTransform: "capitalize" }}>
              {item.orderMethod === "delivery" ? "Delivery" : "Pickup"}
            </Text>
          </View>
          <Text style={{ color: textSecondary, fontSize: 11 }}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Status filter pills */}
      <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 8, gap: 8, flexWrap: "wrap" }}>
        {statuses.map((s) => {
          const isActive = status === s;
          const style = s === "all"
            ? { bg: backgroundColortwo + '15', text: backgroundColortwo }
            : getTransactionStatusStyle(s, primaryColor, backgroundColortwo);
          return (
            <TouchableOpacity
              key={s}
              onPress={() => setStatus(s)}
              style={{
                backgroundColor: isActive ? primaryColor : isDark ? "#374151" : style.bg,
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  color: isActive ? "#fff" : isDark ? textSecondary : style.text,
                  fontSize: 12,
                  fontWeight: "600",
                  textTransform: "capitalize",
                }}
              >
                {s}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {mutation.isPending && productData.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={{ color: textSecondary, marginTop: 12 }}>Loading bought items...</Text>
        </View>
      ) : (
        <FlatList
          data={productData}
          keyExtractor={(item) => `bought-${item.id}`}
          renderItem={renderCard}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={primaryColor} colors={[primaryColor]} />}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Ionicons name="bag-outline" size={56} color={dividerColor} />
              <Text style={{ color: textSecondary, fontSize: 16, fontWeight: "600", marginTop: 12 }}>No bought items</Text>
              <Text style={{ color: textSecondary, fontSize: 13, marginTop: 4 }}>
                Items you purchase will appear here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};