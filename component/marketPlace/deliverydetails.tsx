import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import SelectComponent from "component/dashboardComponent/selectComponent"
import HeaderComponent from "component/headerComp"
import { useEffect, useState } from "react"
import { FlatList, TouchableOpacity, View } from "react-native"
import * as Location from "expo-location"
import { useMutation } from "@tanstack/react-query"
import { getLocationFn, paymentInitiate } from "services/userService"
import { UserLocation } from "types/listofContactType"
import EmptyView from "component/emptyview"
import { ThemeText } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import { AntDesign } from "@expo/vector-icons"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import ButtonFunction from "component/buttonfunction"
import { useRouter } from "expo-router"
import SliderModalTemplate from "component/slideupModalTemplate"
import { getproductByIdFn, selectproductFn } from "services/marketplaceServices"
import { ProductData } from "types/productdataType"
import Divider from "component/divider"
import { createOrderFn } from "services/deliveryServices"
import InputComponent from "component/controls/textinput"
import { formatAmount, formatNaira } from "utilizes/amountFormat"
import { AlertMessageBanner } from "component/AlertMessageBanner"

interface DeliveryDetailsProps {
  productId: number
}

const DeliveryDetails = ({ productId }: DeliveryDetailsProps) => {
  const [productData, setProductData] = useState<ProductData | null>(null)

  const mutationGet = useMutation({
    mutationFn: getproductByIdFn,
    onSuccess: (response) => {
      setProductData(response || null)
    },
    onError: (error: any) => {
      console.warn(error?.response?.data?.message || "Failed to load product")
    },
  })

  const getId = Number(productId)

  useEffect(() => {
    mutationGet.mutate(getId)
  }, [])

  const [data, setData] = useState<UserLocation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [manualInput, setManualInput] = useState("")
  const [manualAddress, setManualAddress] = useState<string>("")
  const [manualLat, setManualLat] = useState<number | null>(null)
  const [manualLong, setManualLong] = useState<number | null>(null)

  const { theme } = useTheme()
  const { primaryColor } = getColors(theme)
  const [showModal, setShowModal] = useState<boolean>(false)

  const [orderResponse, setOrderResponse] = useState<any>("")

  const router = useRouter()

  const mutation = useMutation({
    mutationFn: getLocationFn,
    onSuccess: (response) => {
      setData(response.data || [])
    },
    onError: (error: any) => {
      console.warn(error?.response?.data?.message || "Failed to load locations")
    },
  })

  useEffect(() => {
    mutation.mutate()
  }, [])

  const deliveryMethodValue = ["delivery", "self_pickup"]
  const [orderMethod, setorderMethod] = useState("self_pickup")
  const [quantity, setQuantity] = useState(1)
  const [transproductId,setTransProductId]=useState<number>(0)
  const [price,setPrice]=useState<number>(0)

  const handleAddQuantity = () => setQuantity((q) => q + 1)
  const handleSubQuantity = () => quantity > 1 && setQuantity((q) => q - 1)

  // address selection method
  const addressOptions = ["saved", "manual", "automatic"]
  const [addressMethod, setAddressMethod] = useState<"saved" | "manual" | "automatic">("saved")

  // select product mutation
  const mutationSelect = useMutation({
    mutationFn: selectproductFn,
    onSuccess: (response) => {
      console.log(response.data,'mee')
      const productTransactionId = response.data.id
      setTransProductId(productTransactionId)
      
      // Update price when product is selected
      if (response.data.price) {
        setPrice(Number(response.data.price))
      }
      
      let payload: any = { productTransactionId }
      if(orderMethod==='delivery'){
        if (addressMethod === "saved" && selectedId) {
          payload.locationId = Number(selectedId)
        } else if (addressMethod === "manual" && manualLat && manualLong && manualAddress) {
          payload.receiverLat = manualLat
          payload.receiverLong = manualLong
          payload.address = manualAddress
        } else if (addressMethod === "automatic" && manualLat && manualLong && manualAddress) {
          payload.receiverLat = manualLat
          payload.receiverLong = manualLong
          payload.address = manualAddress
        } else {
          alert("Please provide a valid address before proceeding.")
          return
        }
  
        mutationOrderCreate.mutate(payload)
        
      }
      else{
        setShowModal(true)
        console.log(response.data.price)
      }

     
    },
    onError: (error: any) => {
      console.warn(error?.response?.data?.message || "Failed to select product")
    },
  })

  // create order mutation
  const mutationOrderCreate = useMutation({
    mutationFn: createOrderFn,
    onSuccess: (response) => {
        
      setOrderResponse(response.data)
      setShowModal(true)
    },
    onError: (error: any) => {
      console.warn(error?.response?.data?.message || "Failed to create order")
    },
  })

const handleSelectProduct = () => {
  if (!productId) return
  
  // For self pickup, just select the product
  if (orderMethod === "self_pickup") {
    mutationSelect.mutate(productId)
    return
  }

  // For delivery, validate address first
  if (addressMethod === "saved" && !selectedId) {
    alert("Please select a saved address")
    return
  }
  
  if ((addressMethod === "manual" || addressMethod === "automatic") && (!manualLat || !manualLong || !manualAddress)) {
    alert("Please provide a valid address before proceeding.")
    return
  }

  // Select product with address validation
  mutationSelect.mutate(productId)
}


  // GPS location
  const handleUseCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        alert("Permission denied. Enable location in settings.")
        return
      }
      const position = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = position.coords
      setManualLat(latitude)
      setManualLong(longitude)

      const reverse = await Location.reverseGeocodeAsync({ latitude, longitude })
      if (reverse.length > 0) {
        setManualAddress(`${reverse[0].name || ""} ${reverse[0].street || ""}, ${reverse[0].city || ""}`)
      }
    } catch (err) {
      console.error("Error getting location", err)
    }
  }

  // geocode manual input
  const handleGeocodeAddress = async () => {
    try {
      const geo = await Location.geocodeAsync(manualInput)
      if (geo.length > 0) {
        const { latitude, longitude } = geo[0]
        setManualLat(latitude)
        setManualLong(longitude)
        setManualAddress(manualInput)
      } else {
        alert("Address not found. Try again.")
      }
    } catch (err) {
      console.error("Error geocoding address", err)
    }
  }


  return (
    <>
      <ContainerTemplate>
        <HeaderComponent title={"Delivery Details"} />
        <EmptyView height={40} />
        <View className="w-full">
          <SelectComponent
            title={"Select Delivery Method"}
            width={"100%"}
            data={deliveryMethodValue}
            setValue={setorderMethod}
            value={orderMethod}
          />

          <EmptyView height={20} />
          <View>
            <ThemeText size={Textstyles.text_xsmall}>Add Quantity</ThemeText>
            <View className="flex-row gap-x-3 items-center">
              <TouchableOpacity
                className="rounded-xl items-center justify-center border w-8 h-8"
                style={{ borderColor: primaryColor }}
                onPress={handleAddQuantity}
              >
                <ThemeText size={Textstyles.text_xsmall}>+</ThemeText>
              </TouchableOpacity>
              <ThemeText size={Textstyles.text_xsmall}>{quantity}</ThemeText>
              <TouchableOpacity
                style={{ borderColor: primaryColor }}
                className="rounded-xl items-center justify-center w-8 h-8 border"
                onPress={handleSubQuantity}
              >
                <ThemeText size={Textstyles.text_xsmall}>-</ThemeText>
              </TouchableOpacity>
            </View>
          </View>

          <EmptyView height={20} />

          {orderMethod === "delivery" && (
            <View className="w-full">
              <SelectComponent
                title={"Select Address Method"}
                width={"100%"}
                data={addressOptions}
                setValue={(val) => setAddressMethod(val as any)}
                value={addressMethod}
              />

              <EmptyView height={20} />

              {addressMethod === "saved" && (
                <FlatList
                  data={data.slice(0, 3)}
                  keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                  renderItem={({ item }) => (
                    <AddressCard
                      item={item}
                      isSelected={selectedId === item.id?.toString()}
                      onSelect={() => setSelectedId(item.id?.toString() || null)}
                    />
                  )}
                  ListEmptyComponent={
                    <ThemeText size={Textstyles.text_xsmall}>No saved address found</ThemeText>
                  }
                />
              )}

              {addressMethod === "manual" && (
                <>
                  <InputComponent
                    value={manualInput}
                    onChange={setManualInput}
                    placeholder="Enter address"
                    color={primaryColor}
                    placeholdercolor={primaryColor}
                  />
                  <EmptyView height={10} />
                  <ButtonFunction
                    color={primaryColor}
                    text={"Confirm Address"}
                    textcolor={"#ffffff"}
                    onPress={handleGeocodeAddress}
                  />
                  {manualAddress ? (
                    <ThemeText size={Textstyles.text_xsmall}>
                      Selected: {manualAddress} ({manualLat}, {manualLong})
                    </ThemeText>
                  ) : null}
                </>
              )}

              {addressMethod === "automatic" && (
                <ButtonFunction
                  color={primaryColor}
                  text={"Use Current Location"}
                  textcolor={"#ffffff"}
                  onPress={handleUseCurrentLocation}
                />
              )}

              <EmptyView height={20} />
              <ButtonFunction
                color={primaryColor}
                text={"Checkout"}
                textcolor={"#ffffff"}
                onPress={handleSelectProduct}
              />
            </View>
          )}
          {orderMethod === "self_pickup" &&(
            <View className="w-full">
                <ButtonFunction
                color={primaryColor}
                text={"Checkout"}
                textcolor={"#ffffff"}
                onPress={handleSelectProduct}
              />
              </View>
          

          )}
        </View>
      </ContainerTemplate>

      {/* Order / Payment Modal */}
      <SliderModalTemplate
        showmodal={showModal}
        modalHeight={"80%"}
        setshowmodal={setShowModal}
      >
        <PaymentModal price={price} setShowModal={setShowModal} product={productData!} productTransId={transproductId} orderResponse={orderResponse} />
      </SliderModalTemplate>
    </>
  )
}
export default DeliveryDetails

// Address Card
interface AddressCardProp {
  item: UserLocation
  isSelected: boolean
  onSelect: () => void
}
const AddressCard = ({ item, isSelected, onSelect }: AddressCardProp) => {
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const { theme } = useTheme()
  const { selectioncardColor } = getColors(theme)

  useEffect(() => {
    (async () => {
      try {
        const pickup = await Location.reverseGeocodeAsync({
          latitude: item?.latitude || 0,
          longitude: item?.longitude || 0,
        })
        if (pickup.length > 0) {
          setAddress(`${pickup[0].name || ""} ${pickup[0].street || ""}, ${pickup[0].city || ""}`)
          setCity(pickup[0].city || "")
        }
      } catch (error) {
        console.error("Error getting addresses:", error)
      }
    })()
  }, [item?.latitude, item?.longitude])

  return (
    <TouchableOpacity
      onPress={onSelect}
      style={{ backgroundColor: selectioncardColor }}
      className={`flex-row items-center justify-between border rounded-xl px-3 py-3 mb-3 ${
        isSelected ? "border-green-500" : "border-gray-300"
      }`}
    >
      <View>
        <ThemeText size={Textstyles.text_xsmall}>{address || "Fetching address..."}</ThemeText>
        {city ? <ThemeText size={Textstyles.text_xsmall}>{city}</ThemeText> : null}
      </View>
      {isSelected && <AntDesign name="checkcircle" size={20} color="green" />}
    </TouchableOpacity>
  )
}

// Payment Modal
// Payment Modal
interface PaymentModalProps {
    product: ProductData
    orderResponse: any
    setShowModal: (val: boolean) => void;
    productTransId:number
    price:number
  }
  const PaymentModal = ({ product, orderResponse, setShowModal, productTransId, price }: PaymentModalProps) => {
    const { theme } = useTheme()
    const { primaryColor } = getColors(theme)
  
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [ref, setRef] = useState<string | null>(null)
  console.log(product?.price)
    // ✅ Delivery (has orderResponse)
    const deliveryCost = orderResponse?.cost || 0
    const productPrice = orderResponse?.productTransaction?.price || product?.price || price || 0
    const totalCost = orderResponse ? Number(productPrice) + Number(deliveryCost) : Number(productPrice)
  
    // ✅ ProductTransactionId (self_pickup fallback)
    const productTransactionId = orderResponse?.productTransaction?.id || productTransId
  
    const router = useRouter()
  
    // Auto-clear messages
    useEffect(() => {
      if (errorMessage) {
        const timer = setTimeout(() => setErrorMessage(null), 4000)
        return () => clearTimeout(timer)
      }
    }, [errorMessage])
  
    useEffect(() => {
      if (successMessage) {
        const timer = setTimeout(() => setSuccessMessage(null), 4000)
        return () => clearTimeout(timer)
      }
    }, [successMessage])
  
    const mutation = useMutation({
      mutationFn: paymentInitiate,
      onSuccess: async (data) => {
        const { reference, authorization_url } = data.data
        setRef(reference)
        setSuccessMessage("Payment initiated")
  
        if (authorization_url && reference) {
          router.push({
            pathname: "/paystackViewLayout",
            params: { url: authorization_url, reference },
          })
        }
  
        setShowModal(false)
        console.log("Order updated to PAID ✅")
      },
      onError: (error: any) => {
        let msg = "An unexpected error occurred"
        if (error?.response?.data) {
          msg =
            error.response.data.message ||
            error.response.data.error ||
            JSON.stringify(error.response.data)
        } else if (error?.message) {
          msg = error.message
        }
        setErrorMessage(msg)
        console.error(msg)
      },
    })
  
    const handleSubmit = () => {
      const payload = {
        amount: totalCost,
        description: "Product_Order payment",
        productTransactionId: Number(productTransactionId),
      }
      mutation.mutate(payload)
    }
  
    return (
      <>
        {successMessage && (
          <AlertMessageBanner type="success" message={successMessage} />
        )}
        {errorMessage && (
          <AlertMessageBanner type="error" message={errorMessage} />
        )}
  
        <View className="px-5 py-5">
          <ThemeText size={Textstyles.text_cmedium}>{product?.name}</ThemeText>
          <Divider />
          <EmptyView height={20} />

          <ThemeText size={Textstyles.text_xsmall}>
          Product Cost: {formatNaira(productPrice)}
        </ThemeText>
  
          {orderResponse && (
            <>
              <Divider />
              <EmptyView height={20} />
              <ThemeText size={Textstyles.text_xsmall}>
                Delivery Cost: {formatNaira(deliveryCost)}
              </ThemeText>
            </>
          )}
  
          <Divider />
          <EmptyView height={20} />
  
          <ThemeText size={Textstyles.text_xsmall}>
            Total: {formatNaira(totalCost)}
          </ThemeText>
          <EmptyView height={20} />
  
          <ButtonFunction
            color={primaryColor}
            text={"Make Payment"}
            textcolor={"#ffffff"}
            onPress={handleSubmit}
          />
        </View>
      </>
    )
  }
  
  