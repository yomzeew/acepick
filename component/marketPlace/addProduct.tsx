import { useMutation } from "@tanstack/react-query";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import HeaderComponent from "component/headerComp";
import { useTheme } from "hooks/useTheme";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
  Image,
  Text,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { addproductFn, getCategories } from "services/marketplaceServices";
import { uploadProductImages } from "services/supabaseStorage";
import { getColors } from "static/color";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getAllStates, getLgasByState } from "utilizes/fetchlistofstateandlga";

const Addproduct = () => {
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [weight, setWeight] = useState("");
  const [discount, setDiscount] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [productState, setProductState] = useState("");
  const [productLga, setProductLga] = useState("");
  const [address, setAddress] = useState("");
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showLgaPicker, setShowLgaPicker] = useState(false);

  const allStates = getAllStates();
  const lgaList = productState ? getLgasByState(productState) : [];

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { theme } = useTheme();
  const {
    primaryColor,
    secondaryTextColor,
    selectioncardColor,
    borderColor,
    successColor,
    backgroundColortwo,
  } = getColors(theme);
  const router = useRouter();

  const isDark = theme === "dark";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const inputBg = isDark ? "#374151" : "#F9FAFB";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const dividerColor = isDark ? "#374151" : "#E5E7EB";

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const categoryMutation = useMutation({
    mutationFn: getCategories,
    onSuccess: (response) => setCategoryData(response || []),
    onError: (error: any) => {
      setErrorMessage(
        error?.message || "Failed to load categories"
      );
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (uris: string[]) => uploadProductImages(uris),
    onSuccess: (urls: string[]) => {
      setImages((prev) => [...prev, ...urls]);
      setSuccessMessage("Images uploaded!");
    },
    onError: (error: any) => {
      setErrorMessage(error?.message || "Image upload failed");
    },
  });

  const mutationAdd = useMutation({
    mutationFn: addproductFn,
    onSuccess: () => {
      setShowSuccessModal(true);
      resetForm();
    },
    onError: (error: any) => {
      setErrorMessage(
        error?.message || "Failed to add product"
      );
    },
  });

  useEffect(() => {
    categoryMutation.mutate();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setQuantity("");
    setWeight("");
    setDiscount("");
    setImages([]);
    setSelectedCategory(null);
    setProductState("");
    setProductLga("");
    setAddress("");
    setFieldErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = "Product name is required";
    if (!selectedCategory) errors.category = "Please select a category";
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0)
      errors.price = "Enter a valid price";
    if (
      !quantity.trim() ||
      isNaN(Number(quantity)) ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 0
    )
      errors.quantity = "Enter a valid quantity";
    if (weight && (isNaN(Number(weight)) || Number(weight) <= 0))
      errors.weight = "Enter a valid weight";
    if (discount && (isNaN(Number(discount)) || Number(discount) < 0 || Number(discount) > 100))
      errors.discount = "Discount must be 0-100%";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload: any = {
      name: name.trim(),
      description: description.trim() || undefined,
      categoryId: selectedCategory.id,
      quantity: parseInt(quantity, 10),
      price: parseFloat(price),
      images: images.length > 0 ? images : undefined,
    };
    if (discount) payload.discount = parseFloat(discount);
    if (weight) payload.weightPerUnit = parseFloat(weight);
    if (productState) payload.state = productState;
    if (productLga) payload.lga = productLga;
    if (address.trim()) payload.address = address.trim();

    mutationAdd.mutate(payload);
  };

  const onUpload = async () => {
    if (images.length >= 5) {
      setErrorMessage("Maximum 5 images allowed.");
      return;
    }

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== "granted") {
      setErrorMessage("Please allow media library access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - images.length,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const uris = result.assets.slice(0, 5 - images.length).map((img) => img.uri);
    uploadMutation.mutate(uris);
  };

  const renderLabel = (label: string, required?: boolean) => (
    <Text
      style={{
        color: textPrimary,
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 6,
      }}
    >
      {label}
      {required && <Text style={{ color: backgroundColortwo }}> *</Text>}
    </Text>
  );

  const renderError = (field: string) =>
    fieldErrors[field] ? (
      <Text style={{ color: backgroundColortwo, fontSize: 12, marginTop: 4 }}>
        {fieldErrors[field]}
      </Text>
    ) : null;

  if (categoryMutation.isPending) {
    return (
      <ContainerTemplate>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={{ color: textSecondary, marginTop: 12, fontSize: 14 }}>
            Loading categories...
          </Text>
        </View>
      </ContainerTemplate>
    );
  }

  return (
    <>
      {successMessage && (
        <AlertMessageBanner type="success" message={successMessage} />
      )}
      {errorMessage && (
        <AlertMessageBanner type="error" message={errorMessage} />
      )}

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View
            className="w-11/12 max-w-sm rounded-2xl p-6 items-center"
            style={{ backgroundColor: cardBg }}
          >
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: successColor + "15" }}
            >
              <Ionicons
                name="checkmark-circle"
                size={40}
                color={successColor}
              />
            </View>
            <Text
              style={{
                color: textPrimary,
                fontSize: 20,
                fontWeight: "700",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Product Submitted!
            </Text>
            <Text
              style={{
                color: textSecondary,
                fontSize: 14,
                textAlign: "center",
                marginBottom: 24,
                lineHeight: 20,
              }}
            >
              Your product has been submitted for review. It will appear in the
              marketplace once approved.
            </Text>
            <View className="w-full gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowSuccessModal(false);
                  router.back();
                }}
                className="w-full py-3 rounded-xl items-center"
                style={{ backgroundColor: primaryColor }}
              >
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
                  Done
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowSuccessModal(false)}
                className="w-full py-3 rounded-xl items-center"
                style={{ backgroundColor: isDark ? "#374151" : "#F3F4F6" }}
              >
                <Text
                  style={{
                    color: textSecondary,
                    fontWeight: "600",
                    fontSize: 16,
                  }}
                >
                  Add Another Product
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <TouchableOpacity
            activeOpacity={1}
            className="flex-1"
            onPress={() => setShowCategoryPicker(false)}
          />
          <View
            className="rounded-t-3xl pt-4 pb-8"
            style={{ backgroundColor: cardBg, maxHeight: "60%" }}
          >
            <View className="items-center mb-2">
              <View
                className="w-10 h-1 rounded-full"
                style={{ backgroundColor: dividerColor }}
              />
            </View>
            <Text
              style={{
                color: textPrimary,
                fontSize: 18,
                fontWeight: "700",
                textAlign: "center",
                paddingVertical: 12,
              }}
            >
              Select Category
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {categoryData.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setShowCategoryPicker(false);
                    setFieldErrors((prev) => ({ ...prev, category: "" }));
                  }}
                  className="flex-row items-center justify-between px-5 py-4"
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: dividerColor,
                    backgroundColor:
                      selectedCategory?.id === cat.id
                        ? primaryColor + "10"
                        : "transparent",
                  }}
                >
                  <View className="flex-1">
                    <Text
                      style={{
                        color: textPrimary,
                        fontSize: 16,
                        fontWeight:
                          selectedCategory?.id === cat.id ? "600" : "400",
                      }}
                    >
                      {cat.name}
                    </Text>
                    {cat.description && (
                      <Text
                        style={{
                          color: textSecondary,
                          fontSize: 12,
                          marginTop: 2,
                        }}
                      >
                        {cat.description}
                      </Text>
                    )}
                  </View>
                  {selectedCategory?.id === cat.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={primaryColor}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ContainerTemplate>
        <HeaderComponent title="Add Product" />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Image Upload Section */}
            <View
              className="rounded-2xl p-4 mt-4"
              style={{ backgroundColor: cardBg }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text
                  style={{
                    color: textPrimary,
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  Product Images
                </Text>
                <Text style={{ color: textSecondary, fontSize: 12 }}>
                  {images.length}/5
                </Text>
              </View>

              {images.length > 0 ? (
                <View className="flex-row flex-wrap gap-3 mb-3">
                  {images.map((url, index) => (
                    <View
                      key={index}
                      className="relative rounded-xl overflow-hidden"
                      style={{ width: 80, height: 80 }}
                    >
                      <Image
                        source={{ uri: url }}
                        style={{ width: 80, height: 80 }}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        onPress={() =>
                          setImages((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="absolute top-1 right-1 rounded-full p-1"
                        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                      >
                        <Ionicons name="close" size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : null}

              <TouchableOpacity
                onPress={onUpload}
                disabled={images.length >= 5 || uploadMutation.isPending}
                className="rounded-xl items-center justify-center py-4"
                style={{
                  backgroundColor: inputBg,
                  borderWidth: 1.5,
                  borderColor: dividerColor,
                  borderStyle: "dashed",
                  opacity: images.length >= 5 ? 0.5 : 1,
                }}
              >
                {uploadMutation.isPending ? (
                  <ActivityIndicator size="small" color={primaryColor} />
                ) : (
                  <View className="items-center">
                    <Ionicons
                      name="cloud-upload-outline"
                      size={28}
                      color={primaryColor}
                    />
                    <Text
                      style={{
                        color: primaryColor,
                        fontSize: 14,
                        fontWeight: "600",
                        marginTop: 6,
                      }}
                    >
                      {images.length >= 5
                        ? "Max images reached"
                        : "Upload Images"}
                    </Text>
                    <Text style={{ color: textSecondary, fontSize: 11, marginTop: 2 }}>
                      PNG, JPG up to 5 images
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Product Details Section */}
            <View
              className="rounded-2xl p-4 mt-4"
              style={{ backgroundColor: cardBg }}
            >
              <Text
                style={{
                  color: textPrimary,
                  fontSize: 16,
                  fontWeight: "700",
                  marginBottom: 16,
                }}
              >
                Product Details
              </Text>

              {/* Category */}
              {renderLabel("Category", true)}
              <TouchableOpacity
                onPress={() => setShowCategoryPicker(true)}
                className="flex-row items-center justify-between rounded-xl px-4 py-3.5"
                style={{
                  backgroundColor: inputBg,
                  borderWidth: 1,
                  borderColor: fieldErrors.category ? backgroundColortwo : dividerColor,
                }}
              >
                <Text
                  style={{
                    color: selectedCategory ? textPrimary : textSecondary,
                    fontSize: 15,
                  }}
                >
                  {selectedCategory?.name || "Select a category"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={textSecondary}
                />
              </TouchableOpacity>
              {renderError("category")}

              {/* Product Name */}
              <View className="mt-4">
                {renderLabel("Product Name", true)}
                <TextInput
                  value={name}
                  onChangeText={(v) => {
                    setName(v);
                    setFieldErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="e.g. Wireless Bluetooth Speaker"
                  placeholderTextColor={textSecondary}
                  className="rounded-xl px-4 py-3.5"
                  style={{
                    backgroundColor: inputBg,
                    color: textPrimary,
                    fontSize: 15,
                    borderWidth: 1,
                    borderColor: fieldErrors.name ? backgroundColortwo : dividerColor,
                  }}
                />
                {renderError("name")}
              </View>

              {/* Description */}
              <View className="mt-4">
                {renderLabel("Description")}
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe your product..."
                  placeholderTextColor={textSecondary}
                  multiline
                  numberOfLines={4}
                  className="rounded-xl px-4 py-3.5"
                  style={{
                    backgroundColor: inputBg,
                    color: textPrimary,
                    fontSize: 15,
                    borderWidth: 1,
                    borderColor: dividerColor,
                    minHeight: 100,
                    textAlignVertical: "top",
                  }}
                />
              </View>
            </View>

            {/* Pricing Section */}
            <View
              className="rounded-2xl p-4 mt-4"
              style={{ backgroundColor: cardBg }}
            >
              <Text
                style={{
                  color: textPrimary,
                  fontSize: 16,
                  fontWeight: "700",
                  marginBottom: 16,
                }}
              >
                Pricing & Stock
              </Text>

              {/* Price & Discount Row */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  {renderLabel("Price (₦)", true)}
                  <TextInput
                    value={price}
                    onChangeText={(v) => {
                      setPrice(v);
                      setFieldErrors((prev) => ({ ...prev, price: "" }));
                    }}
                    placeholder="0.00"
                    placeholderTextColor={textSecondary}
                    keyboardType="decimal-pad"
                    className="rounded-xl px-4 py-3.5"
                    style={{
                      backgroundColor: inputBg,
                      color: textPrimary,
                      fontSize: 15,
                      borderWidth: 1,
                      borderColor: fieldErrors.price ? backgroundColortwo : dividerColor,
                    }}
                  />
                  {renderError("price")}
                </View>
                <View className="flex-1">
                  {renderLabel("Discount (%)")}
                  <TextInput
                    value={discount}
                    onChangeText={(v) => {
                      setDiscount(v);
                      setFieldErrors((prev) => ({ ...prev, discount: "" }));
                    }}
                    placeholder="0"
                    placeholderTextColor={textSecondary}
                    keyboardType="decimal-pad"
                    className="rounded-xl px-4 py-3.5"
                    style={{
                      backgroundColor: inputBg,
                      color: textPrimary,
                      fontSize: 15,
                      borderWidth: 1,
                      borderColor: fieldErrors.discount ? backgroundColortwo : dividerColor,
                    }}
                  />
                  {renderError("discount")}
                </View>
              </View>

              {/* Quantity & Weight Row */}
              <View className="flex-row gap-3 mt-4">
                <View className="flex-1">
                  {renderLabel("Stock Quantity", true)}
                  <TextInput
                    value={quantity}
                    onChangeText={(v) => {
                      setQuantity(v);
                      setFieldErrors((prev) => ({ ...prev, quantity: "" }));
                    }}
                    placeholder="0"
                    placeholderTextColor={textSecondary}
                    keyboardType="number-pad"
                    className="rounded-xl px-4 py-3.5"
                    style={{
                      backgroundColor: inputBg,
                      color: textPrimary,
                      fontSize: 15,
                      borderWidth: 1,
                      borderColor: fieldErrors.quantity
                        ? backgroundColortwo
                        : dividerColor,
                    }}
                  />
                  {renderError("quantity")}
                </View>
                <View className="flex-1">
                  {renderLabel("Weight (kg)")}
                  <TextInput
                    value={weight}
                    onChangeText={(v) => {
                      setWeight(v);
                      setFieldErrors((prev) => ({ ...prev, weight: "" }));
                    }}
                    placeholder="0.00"
                    placeholderTextColor={textSecondary}
                    keyboardType="decimal-pad"
                    className="rounded-xl px-4 py-3.5"
                    style={{
                      backgroundColor: inputBg,
                      color: textPrimary,
                      fontSize: 15,
                      borderWidth: 1,
                      borderColor: fieldErrors.weight
                        ? backgroundColortwo
                        : dividerColor,
                    }}
                  />
                  {renderError("weight")}
                </View>
              </View>
            </View>

            {/* Location Section */}
            <View
              className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: cardBg }}
            >
              <Text
                style={{
                  color: textPrimary,
                  fontSize: 16,
                  fontWeight: "700",
                  marginBottom: 16,
                }}
              >
                Pickup Location
              </Text>

              {/* State Picker */}
              {renderLabel("State")}
              <TouchableOpacity
                onPress={() => {
                  setShowStatePicker(!showStatePicker);
                  setShowLgaPicker(false);
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
                  marginBottom: showStatePicker ? 0 : 12,
                }}
              >
                <Text
                  style={{
                    color: productState ? textPrimary : textSecondary,
                    fontSize: 15,
                  }}
                >
                  {productState || "Select State"}
                </Text>
                <Ionicons
                  name={showStatePicker ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={textSecondary}
                />
              </TouchableOpacity>
              {showStatePicker && (
                <ScrollView
                  style={{
                    maxHeight: 180,
                    backgroundColor: inputBg,
                    borderBottomLeftRadius: 12,
                    borderBottomRightRadius: 12,
                    borderWidth: 1,
                    borderTopWidth: 0,
                    borderColor: dividerColor,
                    marginBottom: 12,
                  }}
                  nestedScrollEnabled
                >
                  {allStates.map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => {
                        setProductState(s);
                        setProductLga("");
                        setShowStatePicker(false);
                      }}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: dividerColor,
                        backgroundColor:
                          productState === s
                            ? primaryColor + "15"
                            : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color:
                            productState === s ? primaryColor : textPrimary,
                          fontSize: 14,
                        }}
                      >
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* LGA Picker */}
              {renderLabel("LGA")}
              <TouchableOpacity
                onPress={() => {
                  if (!productState) return;
                  setShowLgaPicker(!showLgaPicker);
                  setShowStatePicker(false);
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
                  marginBottom: showLgaPicker ? 0 : 12,
                  opacity: productState ? 1 : 0.5,
                }}
              >
                <Text
                  style={{
                    color: productLga ? textPrimary : textSecondary,
                    fontSize: 15,
                  }}
                >
                  {productLga ||
                    (productState ? "Select LGA" : "Select state first")}
                </Text>
                <Ionicons
                  name={showLgaPicker ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={textSecondary}
                />
              </TouchableOpacity>
              {showLgaPicker && lgaList.length > 0 && (
                <ScrollView
                  style={{
                    maxHeight: 180,
                    backgroundColor: inputBg,
                    borderBottomLeftRadius: 12,
                    borderBottomRightRadius: 12,
                    borderWidth: 1,
                    borderTopWidth: 0,
                    borderColor: dividerColor,
                    marginBottom: 12,
                  }}
                  nestedScrollEnabled
                >
                  {lgaList.map((l) => (
                    <TouchableOpacity
                      key={l}
                      onPress={() => {
                        setProductLga(l);
                        setShowLgaPicker(false);
                      }}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: dividerColor,
                        backgroundColor:
                          productLga === l
                            ? primaryColor + "15"
                            : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color:
                            productLga === l ? primaryColor : textPrimary,
                          fontSize: 14,
                        }}
                      >
                        {l}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Full Address */}
              {renderLabel("Full Address")}
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="e.g. 12 Main Street, Lekki Phase 1"
                placeholderTextColor={textSecondary}
                multiline
                numberOfLines={2}
                style={{
                  backgroundColor: inputBg,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  color: textPrimary,
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: dividerColor,
                  minHeight: 60,
                  textAlignVertical: "top",
                }}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={mutationAdd.isPending}
              className="rounded-xl py-4 items-center mt-6"
              style={{
                backgroundColor: primaryColor,
                opacity: mutationAdd.isPending ? 0.7 : 1,
              }}
            >
              {mutationAdd.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text
                    style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}
                  >
                    Submit Product
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </ContainerTemplate>
    </>
  );
};

export default Addproduct;
