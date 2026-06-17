import { Ionicons } from "@expo/vector-icons";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import FallbackImage from "component/FallbackImage";
import { useRouter } from "expo-router";
import { useTheme } from "hooks/useTheme";
import { useCallback, useEffect, useState, useRef } from "react";
import { useDebounce } from "hooks/useDebounce";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  RefreshControl,
  Modal,
} from "react-native";
import { getColors } from "static/color";
import { useMutation } from "@tanstack/react-query";
import { getCategories, getproductFn } from "services/marketplaceServices";
import { Product } from "types/type";
import { formatAmount } from "utilizes/amountFormat";
import { getAllStates, getLgasByState } from "utilizes/fetchlistofstateandlga";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const HomeMarketScreen = () => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColortwo } = getColors(theme);
  const router = useRouter();

  const isDark = theme === "dark";
  const bgColor = isDark ? "#111827" : "#F3F4F6";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const inputBg = isDark ? "#374151" : "#FFFFFF";
  const dividerColor = isDark ? "#374151" : "#E5E7EB";
  const chipBg = isDark ? "#374151" : "#F3F4F6";
  const chipActiveBg = primaryColor;

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms debounce
  const [products, setProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [limit] = useState(20);
  const [page, setPage] = useState(1);
  const flatListRef = useRef<FlatList>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Filter state
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [appliedMinPrice, setAppliedMinPrice] = useState("");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterLga, setFilterLga] = useState("");
  const [appliedState, setAppliedState] = useState("");
  const [appliedLga, setAppliedLga] = useState("");
  const [showStateList, setShowStateList] = useState(false);
  const [showLgaList, setShowLgaList] = useState(false);

  const allStates = getAllStates();
  const lgaList = filterState ? getLgasByState(filterState) : [];
  const hasActiveFilters = appliedMinPrice || appliedMaxPrice || appliedState || appliedLga;

  // Fetch categories
  const categoryMutation = useMutation({
    mutationFn: getCategories,
    onSuccess: (response) => setCategories(response || []),
  });

  // Fetch products
  const productMutation = useMutation({
    mutationFn: getproductFn,
    onSuccess: (response) => {
      const newProducts = response || [];
      if (page === 1) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
      setHasMore(newProducts.length === limit);
    },
    onError: (error: any) => {
      console.log("Error fetching products:", error);
    },
  });

  const fetchProducts = useCallback(() => {
    const queryParts: string[] = [];
    if (debouncedSearchTerm) queryParts.push(`search=${debouncedSearchTerm}`);
    if (selectedCategoryId) queryParts.push(`categoryId=${selectedCategoryId}`);
    if (appliedMinPrice) queryParts.push(`minPrice=${appliedMinPrice}`);
    if (appliedMaxPrice) queryParts.push(`maxPrice=${appliedMaxPrice}`);
    if (appliedState) queryParts.push(`state=${appliedState}`);
    if (appliedLga) queryParts.push(`lga=${appliedLga}`);
    queryParts.push(`limit=${limit}`);
    queryParts.push(`page=${page}`);
    productMutation.mutate(queryParts.join("&"));
  }, [debouncedSearchTerm, selectedCategoryId, appliedMinPrice, appliedMaxPrice, appliedState, appliedLga, limit, page]);

  useEffect(() => {
    categoryMutation.mutate();
  }, []);

  // Handle screen focus to refresh data when coming back from product details
  useFocusEffect(
    useCallback(() => {
      // Refresh data when screen comes into focus
      if (page === 1 && (products.length > 0 || hasActiveFilters)) {
        fetchProducts();
      }
      // Restore scroll position after a short delay to allow list to render
      setTimeout(() => {
        if (flatListRef.current && scrollOffset > 0) {
          flatListRef.current.scrollToOffset({ offset: scrollOffset, animated: false });
        }
      }, 100);
      return undefined;
    }, [])
  );

  useEffect(() => {
    if (page === 1) {
      setProducts([]);
    }
    fetchProducts();
  }, [selectedCategoryId, page, appliedMinPrice, appliedMaxPrice, appliedState, appliedLga, debouncedSearchTerm]);

  const applyPriceFilter = () => {
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
    setPage(1);
    setShowPriceModal(false);
  };

  const clearPriceFilter = () => {
    setMinPrice("");
    setMaxPrice("");
    setAppliedMinPrice("");
    setAppliedMaxPrice("");
    setPage(1);
  };

  const applyLocationFilter = () => {
    setAppliedState(filterState);
    setAppliedLga(filterLga);
    setPage(1);
    setShowLocationModal(false);
  };

  const clearLocationFilter = () => {
    setFilterState("");
    setFilterLga("");
    setAppliedState("");
    setAppliedLga("");
    setPage(1);
  };

  const clearAllFilters = () => {
    clearPriceFilter();
    clearLocationFilter();
    setSelectedCategoryId(null);
    setSearchTerm("");
    setPage(1);
  };

  const handleCategorySelect = (id: number | null) => {
    setSelectedCategoryId(id);
    setPage(1);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    fetchProducts();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const loadMore = () => {
    if (!productMutation.isPending && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const renderFooter = () => {
    if (!hasMore && products.length > 0) {
      return (
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <Text style={{ color: textSecondary, fontSize: 13 }}>
            End of results
          </Text>
        </View>
      );
    }
    if (productMutation.isPending && page > 1) {
      return (
        <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 20 }}>
          <ActivityIndicator size="small" color={primaryColor} />
          <Text style={{ color: textSecondary, fontSize: 13, marginLeft: 8 }}>
            Loading more...
          </Text>
        </View>
      );
    }
    return null;
  };

  const getImageSource = (item: Product) => {
    if (Array.isArray(item.images) && item.images.length > 0 && item.images[0]) {
      return { uri: item.images[0] };
    }
    if (typeof item.images === "string" && item.images) {
      return { uri: item.images };
    }
    return require("../../assets/homebg.png");
  };

  const getDiscountPrice = (price: number, discount: number) => {
    if (!discount) return null;
    return price - (price * discount) / 100;
  };

  const renderProductCard = ({ item, index }: { item: Product; index: number }) => {
    const price = Number(item.price);
    const discountedPrice = getDiscountPrice(price, item.discount);
    const isLeft = index % 2 === 0;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/productdetailsLayout?id=${item.id}`)}
        activeOpacity={0.7}
        style={{
          width: CARD_WIDTH,
          backgroundColor: cardBg,
          marginLeft: isLeft ? 0 : 8,
          marginRight: isLeft ? 8 : 0,
          marginBottom: 12,
          borderRadius: 16,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {/* Image */}
        <View style={{ width: "100%", height: CARD_WIDTH * 0.85, backgroundColor: isDark ? "#374151" : "#F9FAFB" }}>
          <FallbackImage
            source={getImageSource(item)}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          {item.quantity > 0 && (
            <View
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                backgroundColor: primaryColor,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "600" }}>
                In Stock
              </Text>
            </View>
          )}
          {item.discount > 0 && (
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: backgroundColortwo,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
                -{item.discount}%
              </Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={{ padding: 10 }}>
          {item.category && (
            <Text
              style={{
                color: primaryColor,
                fontSize: 10,
                fontWeight: "600",
                marginBottom: 2,
                textTransform: "uppercase",
              }}
              numberOfLines={1}
            >
              {item.category.name}
            </Text>
          )}
          <Text
            style={{
              color: textPrimary,
              fontSize: 13,
              fontWeight: "600",
              marginBottom: 4,
            }}
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text
              style={{
                color: discountedPrice ? backgroundColortwo : primaryColor,
                fontSize: 15,
                fontWeight: "700",
              }}
            >
              {formatAmount(discountedPrice || price)}
            </Text>
            {discountedPrice && (
              <Text
                style={{
                  color: textSecondary,
                  fontSize: 11,
                  textDecorationLine: "line-through",
                }}
              >
                {formatAmount(price)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 }}>
      <Ionicons name="bag-outline" size={64} color={dividerColor} />
      <Text style={{ color: textSecondary, fontSize: 16, fontWeight: "600", marginTop: 16 }}>
        No products found
      </Text>
      <Text style={{ color: textSecondary, fontSize: 13, marginTop: 4, textAlign: "center" }}>
        Try adjusting your search or category filters
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: primaryColor,
          paddingTop: 50,
          paddingBottom: 16,
          paddingHorizontal: 16,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Text style={{ color: "#fff", fontSize: 24, fontWeight: "700" }}>
            Marketplace
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.push("/myItemsLayout")}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="bag-handle-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 14,
            paddingHorizontal: 14,
            height: 48,
          }}
        >
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search products..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={{
              flex: 1,
              color: "#fff",
              fontSize: 15,
              marginLeft: 10,
            }}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchTerm("");
                setPage(1);
              }}
            >
              <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Chips */}
      <View style={{ paddingTop: 12, paddingBottom: 4 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          <TouchableOpacity
            onPress={() => handleCategorySelect(null)}
            style={{
              backgroundColor: selectedCategoryId === null ? chipActiveBg : chipBg,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                color: selectedCategoryId === null ? "#fff" : textSecondary,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => handleCategorySelect(cat.id)}
              style={{
                backgroundColor: selectedCategoryId === cat.id ? chipActiveBg : chipBg,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  color: selectedCategoryId === cat.id ? "#fff" : textSecondary,
                  fontSize: 13,
                  fontWeight: "600",
                }}
                numberOfLines={1}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filter Buttons */}
      <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingTop: 8, gap: 8 }}>
        <TouchableOpacity
          onPress={() => {
            setMinPrice(appliedMinPrice);
            setMaxPrice(appliedMaxPrice);
            setShowPriceModal(true);
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: appliedMinPrice || appliedMaxPrice ? primaryColor : chipBg,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            gap: 4,
          }}
        >
          <Ionicons
            name="pricetag-outline"
            size={14}
            color={appliedMinPrice || appliedMaxPrice ? "#fff" : textSecondary}
          />
          <Text
            style={{
              color: appliedMinPrice || appliedMaxPrice ? "#fff" : textSecondary,
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {appliedMinPrice || appliedMaxPrice
              ? `${appliedMinPrice || "0"} - ${appliedMaxPrice || "Any"}`
              : "Price"}
          </Text>
          {(appliedMinPrice || appliedMaxPrice) && (
            <TouchableOpacity onPress={clearPriceFilter} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={14} color="#fff" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setFilterState(appliedState);
            setFilterLga(appliedLga);
            setShowLocationModal(true);
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: appliedState ? primaryColor : chipBg,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            gap: 4,
          }}
        >
          <Ionicons
            name="location-outline"
            size={14}
            color={appliedState ? "#fff" : textSecondary}
          />
          <Text
            style={{
              color: appliedState ? "#fff" : textSecondary,
              fontSize: 12,
              fontWeight: "600",
            }}
            numberOfLines={1}
          >
            {appliedState
              ? appliedLga
                ? `${appliedLga}, ${appliedState}`
                : appliedState
              : "Location"}
          </Text>
          {appliedState ? (
            <TouchableOpacity onPress={clearLocationFilter} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={14} color="#fff" />
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>

        {hasActiveFilters && (
          <TouchableOpacity
            onPress={clearAllFilters}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: backgroundColortwo,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              gap: 4,
            }}
          >
            <Ionicons name="trash-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Price Filter Modal */}
      <Modal visible={showPriceModal} transparent animationType="slide" onRequestClose={() => setShowPriceModal(false)}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={() => setShowPriceModal(false)} />
          <View style={{ backgroundColor: cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 }}>
            <View style={{ alignItems: "center", marginBottom: 8 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: dividerColor }} />
            </View>
            <Text style={{ color: textPrimary, fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 20 }}>
              Price Range
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: textSecondary, fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Min Price</Text>
                <TextInput
                  value={minPrice}
                  onChangeText={setMinPrice}
                  placeholder="0"
                  placeholderTextColor={textSecondary}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: inputBg,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    height: 48,
                    color: textPrimary,
                    fontSize: 15,
                    borderWidth: 1,
                    borderColor: dividerColor,
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: textSecondary, fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Max Price</Text>
                <TextInput
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  placeholder="Any"
                  placeholderTextColor={textSecondary}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: inputBg,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    height: 48,
                    color: textPrimary,
                    fontSize: 15,
                    borderWidth: 1,
                    borderColor: dividerColor,
                  }}
                />
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 12, marginTop: 20, marginBottom: 16 }}>
              <TouchableOpacity
                onPress={() => {
                  setMinPrice("");
                  setMaxPrice("");
                  setAppliedMinPrice("");
                  setAppliedMaxPrice("");
                  setShowPriceModal(false);
                  setPage(1);
                }}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: dividerColor,
                }}
              >
                <Text style={{ color: textSecondary, fontWeight: "600" }}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyPriceFilter}
                style={{
                  flex: 2,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: primaryColor,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Location Filter Modal */}
      <Modal visible={showLocationModal} transparent animationType="slide" onRequestClose={() => setShowLocationModal(false)}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={() => setShowLocationModal(false)} />
          <View style={{ backgroundColor: cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "70%" }}>
            <View style={{ alignItems: "center", marginBottom: 8 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: dividerColor }} />
            </View>
            <Text style={{ color: textPrimary, fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 20 }}>
              Filter by Location
            </Text>

            {/* State Selector */}
            <Text style={{ color: textSecondary, fontSize: 12, fontWeight: "600", marginBottom: 6 }}>State</Text>
            <TouchableOpacity
              onPress={() => { setShowStateList(!showStateList); setShowLgaList(false); }}
              style={{
                backgroundColor: inputBg,
                borderRadius: 12,
                paddingHorizontal: 14,
                height: 48,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderWidth: 1,
                borderColor: dividerColor,
                marginBottom: showStateList ? 0 : 12,
              }}
            >
              <Text style={{ color: filterState ? textPrimary : textSecondary, fontSize: 15 }}>
                {filterState || "Select State"}
              </Text>
              <Ionicons name={showStateList ? "chevron-up" : "chevron-down"} size={18} color={textSecondary} />
            </TouchableOpacity>
            {showStateList && (
              <ScrollView style={{ maxHeight: 180, backgroundColor: inputBg, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, borderWidth: 1, borderTopWidth: 0, borderColor: dividerColor, marginBottom: 12 }}>
                {allStates.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => {
                      setFilterState(s);
                      setFilterLga("");
                      setShowStateList(false);
                    }}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: dividerColor,
                      backgroundColor: filterState === s ? primaryColor + "15" : "transparent",
                    }}
                  >
                    <Text style={{ color: filterState === s ? primaryColor : textPrimary, fontSize: 14 }}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* LGA Selector */}
            <Text style={{ color: textSecondary, fontSize: 12, fontWeight: "600", marginBottom: 6 }}>LGA</Text>
            <TouchableOpacity
              onPress={() => {
                if (!filterState) return;
                setShowLgaList(!showLgaList);
                setShowStateList(false);
              }}
              style={{
                backgroundColor: inputBg,
                borderRadius: 12,
                paddingHorizontal: 14,
                height: 48,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderWidth: 1,
                borderColor: dividerColor,
                marginBottom: showLgaList ? 0 : 12,
                opacity: filterState ? 1 : 0.5,
              }}
            >
              <Text style={{ color: filterLga ? textPrimary : textSecondary, fontSize: 15 }}>
                {filterLga || (filterState ? "Select LGA" : "Select state first")}
              </Text>
              <Ionicons name={showLgaList ? "chevron-up" : "chevron-down"} size={18} color={textSecondary} />
            </TouchableOpacity>
            {showLgaList && lgaList.length > 0 && (
              <ScrollView style={{ maxHeight: 180, backgroundColor: inputBg, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, borderWidth: 1, borderTopWidth: 0, borderColor: dividerColor, marginBottom: 12 }}>
                {lgaList.map((l) => (
                  <TouchableOpacity
                    key={l}
                    onPress={() => {
                      setFilterLga(l);
                      setShowLgaList(false);
                    }}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: dividerColor,
                      backgroundColor: filterLga === l ? primaryColor + "15" : "transparent",
                    }}
                  >
                    <Text style={{ color: filterLga === l ? primaryColor : textPrimary, fontSize: 14 }}>
                      {l}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={{ flexDirection: "row", gap: 12, marginTop: 8, marginBottom: 16 }}>
              <TouchableOpacity
                onPress={() => {
                  setFilterState("");
                  setFilterLga("");
                  setAppliedState("");
                  setAppliedLga("");
                  setShowLocationModal(false);
                  setPage(1);
                }}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: dividerColor,
                }}
              >
                <Text style={{ color: textSecondary, fontWeight: "600" }}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyLocationFilter}
                style={{
                  flex: 2,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: primaryColor,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Products Grid */}
      {productMutation.isPending && products.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={{ color: textSecondary, marginTop: 12, fontSize: 14 }}>
            Loading products...
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={products}
          renderItem={renderProductCard}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={2}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            setScrollOffset(event.nativeEvent.contentOffset.y);
          }}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={primaryColor}
              colors={[primaryColor]}
            />
          }
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
        />
      )}

      {/* Floating Sell Button */}
      <TouchableOpacity
        onPress={() => router.push("/addproductLayout")}
        activeOpacity={0.85}
        style={{
          position: "absolute",
          bottom: 90,
          right: 16,
          backgroundColor: primaryColor,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 18,
          paddingVertical: 14,
          borderRadius: 28,
          gap: 6,
          shadowColor: primaryColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Ionicons name="add-circle-outline" size={22} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>Sell</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeMarketScreen;
