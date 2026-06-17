import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import FallbackImage from "component/FallbackImage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "hooks/useTheme";
import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Dimensions,
  StatusBar,
  Animated,
  Alert,
  Linking,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { getproductByIdFn } from "services/marketplaceServices";
import { getColors } from "static/color";
import { ProductData } from "types/productdataType";
import { formatAmount } from "utilizes/amountFormat";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ProductDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { primaryColor, backgroundColortwo } = getColors(theme);

  const isDark = theme === "dark";
  const bgColor = isDark ? "#111827" : "#F3F4F6";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const dividerColor = isDark ? "#374151" : "#E5E7EB";

  const [productData, setProductData] = useState<ProductData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const userId = useSelector((state: RootState) => state.auth?.user?.id);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const mutation = useMutation({
    mutationFn: getproductByIdFn,
    onSuccess: (response) => setProductData(response || null),
    onError: (error: any) => {
      setErrorMessage(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load product"
      );
    },
  });

  useEffect(() => {
    if (id) mutation.mutate(Number(id));
  }, [id]);

  const images = productData?.images || [];
  const hasImages = images.length > 0;
  const isOwner = productData?.userId === userId;

  const getImageSource = (uri?: string) => {
    if (uri) return { uri };
    return require("../../assets/homebg.png");
  };

  // ── Loading State ──
  if (mutation.isPending) {
    return (
      <View style={{ flex: 1, backgroundColor: bgColor, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={{ color: textSecondary, marginTop: 12 }}>Loading product...</Text>
      </View>
    );
  }

  // ── Error State ──
  if (errorMessage && !productData) {
    return (
      <View style={{ flex: 1, backgroundColor: bgColor, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
        <Ionicons name="alert-circle-outline" size={64} color={backgroundColortwo} />
        <Text style={{ color: textPrimary, fontSize: 18, fontWeight: "700", marginTop: 16 }}>Oops!</Text>
        <Text style={{ color: textSecondary, fontSize: 14, textAlign: "center", marginTop: 8 }}>{errorMessage}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 24, backgroundColor: primaryColor, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!productData) return null;

  const price = Number(productData.price);
  const discountedPrice = productData.discount
    ? price - (price * productData.discount / 100)
    : price;
  const seller = productData.user;
  const sellerName = seller?.profile
    ? `${seller.profile.firstName || ""} ${seller.profile.lastName || ""}`.trim()
    : "Seller";
  const sellerAvatar = seller?.profile?.avatar;
  const location = productData.pickupLocation;

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar barStyle="light-content" />

      <ScrollView style={{ flex: 1 }} bounces={false} showsVerticalScrollIndicator={false}>
        {/* ── Image Carousel ── */}
        <View style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.85, backgroundColor: isDark ? "#374151" : "#E5E7EB" }}>
          {hasImages ? (
            <>
              <FlatList
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, i) => `img-${i}`}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false }
                )}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => { setCurrentIndex(index); setPreviewVisible(true); }}
                    style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.85 }}
                  >
                    <FallbackImage
                      source={getImageSource(item)}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
              />
              {/* Dots */}
              {images.length > 1 && (
                <View style={{
                  position: "absolute",
                  bottom: 16,
                  alignSelf: "center",
                  flexDirection: "row",
                  gap: 6,
                  backgroundColor: "rgba(0,0,0,0.4)",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 12,
                }}>
                  {images.map((_, i) => {
                    const inputRange = [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH];
                    const scale = scrollX.interpolate({ inputRange, outputRange: [0.8, 1.2, 0.8], extrapolate: "clamp" });
                    const opacity = scrollX.interpolate({ inputRange, outputRange: [0.4, 1, 0.4], extrapolate: "clamp" });
                    return (
                      <Animated.View
                        key={i}
                        style={{
                          width: 8, height: 8, borderRadius: 4,
                          backgroundColor: "#fff",
                          opacity, transform: [{ scale }],
                        }}
                      />
                    );
                  })}
                </View>
              )}
              {/* Image count badge */}
              <View style={{
                position: "absolute", top: 56, right: 16,
                backgroundColor: "rgba(0,0,0,0.5)",
                flexDirection: "row", alignItems: "center", gap: 4,
                paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16,
              }}>
                <Ionicons name="images-outline" size={14} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>{images.length}</Text>
              </View>
            </>
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="image-outline" size={64} color={textSecondary} />
              <Text style={{ color: textSecondary, marginTop: 8 }}>No images</Text>
            </View>
          )}

          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute", top: 50, left: 16,
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: "rgba(0,0,0,0.5)",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── Content ── */}
        <View style={{ marginTop: -24, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: bgColor, paddingTop: 20, paddingBottom: 120 }}>

          {/* Title & Price Card */}
          <View style={{
            marginHorizontal: 16, backgroundColor: cardBg, borderRadius: 20, padding: 16,
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.06, shadowRadius: 8, elevation: 3,
          }}>
            {/* Category badge */}
            {productData.category && (
              <View style={{
                alignSelf: "flex-start",
                backgroundColor: primaryColor + "15",
                paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8,
              }}>
                <Text style={{ color: primaryColor, fontSize: 11, fontWeight: "700", textTransform: "uppercase" }}>
                  {productData.category.name}
                </Text>
              </View>
            )}

            <Text style={{ color: textPrimary, fontSize: 20, fontWeight: "700", marginBottom: 8 }}>
              {productData.name}
            </Text>

            {/* Price row */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={{ color: primaryColor, fontSize: 24, fontWeight: "800" }}>
                {formatAmount(discountedPrice)}
              </Text>
              {productData.discount > 0 && (
                <>
                  <Text style={{ color: textSecondary, fontSize: 14, textDecorationLine: "line-through" }}>
                    {formatAmount(price)}
                  </Text>
                  <View style={{
                    backgroundColor: backgroundColortwo + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
                  }}>
                    <Text style={{ color: backgroundColortwo, fontSize: 11, fontWeight: "700" }}>
                      -{productData.discount}%
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Quick stats */}
            <View style={{ flexDirection: "row", marginTop: 12, gap: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="cube-outline" size={16} color={textSecondary} />
                <Text style={{ color: textSecondary, fontSize: 13 }}>
                  {productData.quantity > 0 ? `${productData.quantity} in stock` : "Out of stock"}
                </Text>
              </View>
              {productData.weightPerUnit && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="scale-outline" size={16} color={textSecondary} />
                  <Text style={{ color: textSecondary, fontSize: 13 }}>{productData.weightPerUnit}kg / unit</Text>
                </View>
              )}
            </View>
          </View>

          {/* Description Card */}
          {productData.description && (
            <View style={{
              marginHorizontal: 16, marginTop: 12, backgroundColor: cardBg, borderRadius: 16, padding: 16,
              shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.2 : 0.04, shadowRadius: 4, elevation: 2,
            }}>
              <Text style={{ color: textPrimary, fontSize: 15, fontWeight: "700", marginBottom: 8 }}>Description</Text>
              <Text style={{ color: textSecondary, fontSize: 14, lineHeight: 22 }}>
                {productData.description}
              </Text>
            </View>
          )}

          {/* Location Card */}
          {location && (
            <View style={{
              marginHorizontal: 16, marginTop: 12, backgroundColor: cardBg, borderRadius: 16, padding: 16,
              shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.2 : 0.04, shadowRadius: 4, elevation: 2,
            }}>
              <Text style={{ color: textPrimary, fontSize: 15, fontWeight: "700", marginBottom: 10 }}>Pickup Location</Text>
              <View style={{ gap: 8 }}>
                {(location.state || location.lga) && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={{
                      width: 32, height: 32, borderRadius: 10,
                      backgroundColor: primaryColor + "15", alignItems: "center", justifyContent: "center",
                    }}>
                      <Ionicons name="location-outline" size={18} color={primaryColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: textPrimary, fontSize: 14, fontWeight: "600" }}>
                        {[location.lga, location.state].filter(Boolean).join(", ")}
                      </Text>
                    </View>
                  </View>
                )}
                {location.address && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={{
                      width: 32, height: 32, borderRadius: 10,
                      backgroundColor: primaryColor + "15", alignItems: "center", justifyContent: "center",
                    }}>
                      <Ionicons name="map-outline" size={18} color={primaryColor} />
                    </View>
                    <Text style={{ color: textSecondary, fontSize: 13, flex: 1 }}>{location.address}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Seller Card */}
          {seller && (
            <View style={{
              marginHorizontal: 16, marginTop: 12, backgroundColor: cardBg, borderRadius: 16, padding: 16,
              shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.2 : 0.04, shadowRadius: 4, elevation: 2,
            }}>
              <Text style={{ color: textPrimary, fontSize: 15, fontWeight: "700", marginBottom: 12 }}>Seller</Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                  {/* Avatar */}
                  <View style={{
                    width: 48, height: 48, borderRadius: 24,
                    backgroundColor: isDark ? "#374151" : "#E5E7EB",
                    overflow: "hidden",
                  }}>
                    {sellerAvatar ? (
                      <FallbackImage source={{ uri: sellerAvatar }} style={{ width: 48, height: 48 }} resizeMode="cover" />
                    ) : (
                      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="person" size={24} color={textSecondary} />
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: textPrimary, fontSize: 15, fontWeight: "600" }} numberOfLines={1}>
                      {sellerName}
                    </Text>
                    {seller.profile?.rate && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                        <Ionicons name="star" size={13} color={backgroundColortwo} />
                        <Text style={{ color: textSecondary, fontSize: 12 }}>
                          {Number(seller.profile.rate).toFixed(1)} rating
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Action buttons */}
                {!isOwner && (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => {
                        // Make a phone call to seller
                        if (seller.phone) {
                          Linking.openURL(`tel:${seller.phone}`);
                        } else {
                          // Fallback: show alert that phone number is not available
                          Alert.alert("Contact Info", "Phone number not available for this seller.");
                        }
                      }}
                      style={{
                        width: 40, height: 40, borderRadius: 20,
                        backgroundColor: "#FF3B30", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Ionicons name="call" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        const chatData = { userId: seller.id, professionalId: "" };
                        router.push(`/(Authenticated)/(chatcallmessage)/mainchat/${JSON.stringify(chatData)}`);
                      }}
                      style={{
                        width: 40, height: 40, borderRadius: 20,
                        backgroundColor: primaryColor, alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Ionicons name="chatbubbles" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Bottom Action Bar ── */}
      {!isOwner && productData.quantity > 0 && (
        <View style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: cardBg,
          borderTopWidth: 1, borderTopColor: dividerColor,
          paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 28,
          flexDirection: "row", alignItems: "center", gap: 12,
          shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10,
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: textSecondary, fontSize: 11 }}>Total Price</Text>
            <Text style={{ color: primaryColor, fontSize: 20, fontWeight: "800" }}>
              {formatAmount(discountedPrice)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push(`/deliverydetailsLayout/${productData.id}`)}
            style={{
              flex: 1,
              backgroundColor: primaryColor,
              paddingVertical: 14, borderRadius: 14,
              alignItems: "center", justifyContent: "center",
              flexDirection: "row", gap: 8,
            }}
          >
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Out of stock overlay */}
      {!isOwner && productData.quantity <= 0 && (
        <View style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: cardBg,
          borderTopWidth: 1, borderTopColor: dividerColor,
          paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 28,
          alignItems: "center",
        }}>
          <View style={{
            backgroundColor: backgroundColortwo + '15', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,
            flexDirection: "row", alignItems: "center", gap: 8,
          }}>
            <Ionicons name="alert-circle" size={20} color={backgroundColortwo} />
            <Text style={{ color: backgroundColortwo, fontSize: 15, fontWeight: "600" }}>Out of Stock</Text>
          </View>
        </View>
      )}

      {/* ── Fullscreen Image Preview Modal ── */}
      <Modal visible={previewVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            initialScrollIndex={currentIndex}
            getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => `preview-${i}`}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
                resizeMode="contain"
              />
            )}
          />

          {/* Close */}
          <TouchableOpacity
            onPress={() => setPreviewVisible(false)}
            style={{
              position: "absolute", top: 50, right: 20,
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Counter */}
          <View style={{
            position: "absolute", bottom: 40, alignSelf: "center",
            backgroundColor: "rgba(0,0,0,0.6)",
            paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16,
          }}>
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProductDetails;
