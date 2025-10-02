import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { useMutation } from "@tanstack/react-query"
import ButtonFunction from "component/buttonfunction"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import RatingStar from "component/rating"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { useEffect, useState } from "react"
import { View, Image, ActivityIndicator, TouchableOpacity } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { getproductByIdFn } from "services/marketplaceServices"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"
import { baseUrl } from "utilizes/endpoints"
import * as Location from "expo-location";

import { Modal, FlatList, Dimensions } from "react-native";
import { ProductData } from "types/productdataType"
import { data } from "autoprefixer"
import SliderModalTemplate from "component/slideupModalTemplate"

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const ProductDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { primaryColor, selectioncardColor } = getColors(theme);

  const [productData, setProductData] = useState<ProductData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const userId = useSelector((state: RootState) => state.auth?.user?.id);
  const [pickupAddress, setPickupAddress] = useState('')
  const [city, setCity] = useState('')

  // ✅ State for modal preview
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openPreview = (index: number) => {
    setCurrentIndex(index);
    setPreviewVisible(true);
  };

  const closePreview = () => setPreviewVisible(false);
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const mutation = useMutation({
    mutationFn: getproductByIdFn,
    onSuccess: (response) => {
      setProductData(response || []);
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

  const getId = Number(id)

  useEffect(() => {
    mutation.mutate(getId);
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const latPickup = productData?.pickupLocation.latitude || 0
  const lngPickup = productData?.pickupLocation.longitude || 0

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
  }, [productData?.pickupLocation]);

  if (mutation.isPending) {
    return (
      <ContainerTemplate>
        <View className="justify-center items-center h-full">
          <ActivityIndicator size="large" />
        </View>
      </ContainerTemplate>
    );
  }
  return (
    <>
      <ContainerTemplate>
        <HeaderComponent title={"Item Details"} />
        <EmptyView height={20} />
        {/* Product Images Grid */}
        {productData?.images?.length ? (
          productData.images.length === 1 ? (
            <TouchableOpacity onPress={() => openPreview(0)}>
              <Image
                source={{ uri: `${productData.images[0]}` }}
                resizeMode="cover"
                style={{ width: "100%", height: 250, borderRadius: 10, marginBottom: 10 }}
              />
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: "row", width: "100%", height: 250, marginBottom: 10 }}>
              {/* First image */}
              <TouchableOpacity style={{ width: "60%", height: "100%", marginRight: 5 }} onPress={() => openPreview(0)}>
                <Image
                  source={{ uri: `${productData.images[0]}` }}
                  resizeMode="cover"
                  style={{ width: "100%", height: "100%", borderRadius: 10 }}
                />
              </TouchableOpacity>

              {/* Remaining images */}
              <View style={{ width: "40%", height: "100%", flexDirection: "row", flexWrap: "wrap" }}>
                {productData.images.slice(1, 5).map((img, index) => (
                  <TouchableOpacity
                    key={index + 1}
                    onPress={() => openPreview(index + 1)}
                    style={{ width: "50%", height: "50%", padding: 2 }}
                  >
                    <Image
                      source={{ uri: `${img}` }}
                      resizeMode="cover"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 8,
                      }}
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
            source={require("../../assets/samplework.png")}
          />
        )}


        <EmptyView height={20} />
        <View className="flex-1 w-full">
          <ScrollView>


            <View className="flex-row justify-between">
              <View>
                <ThemeText size={Textstyles.text_cmedium}>{productData?.name || null}</ThemeText>
                <ThemeTextsecond size={Textstyles.text_xxxsmall}>{productData?.category.name || null}</ThemeTextsecond>

              </View>
              <View className="items-end">
                <ThemeText size={Textstyles.text_cmedium}>{productData?.price || null}</ThemeText>
                <ThemeTextsecond size={Textstyles.text_xxxsmall}>{productData?.quantity || null}</ThemeTextsecond>

              </View>

            </View>


            <EmptyView height={20} />
            <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 py-3 ">
              <ThemeTextsecond size={Textstyles.text_xsmall}>
                {productData?.description || null}
              </ThemeTextsecond>
            </View>
            <EmptyView height={20} />
            <View className="w-full">
              <ThemeText size={Textstyles.text_xsmall}>
                Location City:{productData?.pickupLocation.lga || city}
              </ThemeText>
              <ThemeText size={Textstyles.text_xsmall}>
                Address:{pickupAddress}
              </ThemeText>
            </View>
            <EmptyView height={20} />
            {/* {productData?.user.id!==userId &&<> */}
            <SellerDetails
              user={productData?.user}
            />
            <EmptyView height={10} />
            <ButtonFunction
              color={primaryColor}
              text={"Proceed"}
              textcolor={"#fffff"}
              onPress={() => router.push(`/deliverydetailsLayout/${productData?.id}`)} />
            {/* </>} */}


          </ScrollView>
        </View>
        {/* ✅ Fullscreen Image Preview Modal */}
        <Modal visible={previewVisible} transparent={true} animationType="fade">
          <View style={{ flex: 1, backgroundColor: "black" }}>
            {/* Swipeable Image Viewer */}
            <FlatList
              data={productData?.images || []}
              horizontal
              pagingEnabled
              initialScrollIndex={currentIndex}
              getItemLayout={(data, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: `$item}` }}
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

      </ContainerTemplate>


    </>
  )
}
export default ProductDetails

const SellerDetails = ({ user }: any) => {
  const { theme } = useTheme()

  const { selectioncardColor, primaryColor } = getColors(theme)


  const avatar: string = user?.profile.avatar || ' '
  const clientName: string = user?.profile.firstName + ' ' + user?.profile.lastName || ' '
  const numberOfStars: number = user?.profile.rate || 1

  const userIDprofessionalId={userId:user?.id,professionalId:''}

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
            <TouchableOpacity onPress={() => router.push(`/mainchat/${JSON.stringify(userIDprofessionalId)}`)}  style={{ backgroundColor: primaryColor }} className="w-8 h-8 rounded-full justify-center items-center">
              <Ionicons name="chatbubbles-sharp" color={"#ffffff"} size={20} />
            </TouchableOpacity>

          </View>

        </View>



      </View>
    </>
  )
}


