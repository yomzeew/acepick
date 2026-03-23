import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "component/headerComp"
import { useEffect, useState, useCallback } from "react"
import { TouchableOpacity, View, ActivityIndicator, ScrollView, Text } from "react-native"
import * as Location from "expo-location"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getLocationFn, paymentInitiate } from "services/userService"
import { UserLocation } from "types/listofContactType"
import EmptyView from "component/emptyview"
import { ThemeText } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import { AntDesign, Ionicons } from "@expo/vector-icons"
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
import { useToast } from "context/ToastContext"

interface DeliveryDetailsProps {
  productId: number
}

const DeliveryDetails = ({ productId }: DeliveryDetailsProps) => {
  const { theme } = useTheme()
  const { primaryColor, selectioncardColor, borderColor, secondaryTextColor, successColor } = getColors(theme)
  const router = useRouter()
  const queryClient = useQueryClient()
  const toast = useToast()

  // Consolidated state with proper types
  const [orderMethod, setOrderMethod] = useState<"delivery" | "self_pickup">("self_pickup")
  const [quantity, setQuantity] = useState(1)
  const [addressMethod, setAddressMethodRaw] = useState<"saved" | "manual" | "automatic">("saved")
  const setAddressMethod = (method: "saved" | "manual" | "automatic") => {
    setAddressMethodRaw(method)
    setSelectedLocationId(null)
    setManualAddress({ input: "", formatted: "", lat: null, long: null })
  }
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [manualAddress, setManualAddress] = useState({
    input: "",
    formatted: "",
    lat: null as number | null,
    long: null as number | null,
  })
  const [showModal, setShowModal] = useState(false)
  const [productTransactionId, setProductTransactionId] = useState<number>(0)
  const [orderResponse, setOrderResponse] = useState<any>(null)

  // Fetch product data with useQuery
  const { data: productData, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getproductByIdFn(Number(productId)),
    enabled: !!productId,
  })

  // Fetch saved locations
  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: getLocationFn,
  })

  // Validate quantity against stock
  const maxQuantity = productData?.quantity || 1
  const handleAddQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(prev => prev + 1)
    } else {
      toast.error('Stock limit', `Only ${maxQuantity} items available`)
    }
  }
  const handleSubQuantity = () => quantity > 1 && setQuantity(prev => prev - 1)

  // Select product mutation
  const mutationSelect = useMutation({
    mutationFn: selectproductFn,
    onSuccess: (response) => {
      const productTransactionId = response.data.id
      setProductTransactionId(productTransactionId)
      
      if (orderMethod === 'delivery') {
        // Validate address for delivery
        let payload: any = { productTransactionId }
        
        if (addressMethod === "saved" && selectedLocationId) {
          payload.locationId = Number(selectedLocationId)
        } else if ((addressMethod === "manual" || addressMethod === "automatic") && 
                   manualAddress.lat && manualAddress.long && manualAddress.formatted) {
          payload.receiverLat = manualAddress.lat
          payload.receiverLong = manualAddress.long
          payload.address = manualAddress.formatted
        } else {
          toast.error('Address required', 'Please provide a valid delivery address')
          return
        }
        
        mutationOrderCreate.mutate(payload)
      } else {
        // Self pickup - show payment modal directly
        setShowModal(true)
      }
    },
    onError: (error: any) => {
      toast.error('Error', error?.message || 'Failed to select product')
    },
  })

  // Create order mutation
  const mutationOrderCreate = useMutation({
    mutationFn: createOrderFn,
    onSuccess: (response) => {
      setOrderResponse(response.data)
      queryClient.invalidateQueries({ queryKey: ['product', productId] })
      setShowModal(true)
    },
    onError: (error: any) => {
      toast.error('Order Error', error?.message || 'Failed to create delivery order')
    },
  })

  // Handle checkout
  const handleCheckout = useCallback(() => {
    if (!productId) {
      toast.error('Error', 'Product not available')
      return
    }
    
    // Prepare selection parameters
    const selectParams = {
      productId: Number(productId),
      quantity,
      orderMethod
    }
    
    // For self pickup, just select the product
    if (orderMethod === "self_pickup") {
      mutationSelect.mutate(selectParams)
      return
    }

    // For delivery, validate address first
    if (addressMethod === "saved" && !selectedLocationId) {
      toast.error('Address required', 'Please select a saved address')
      return
    }
    
    if ((addressMethod === "manual" || addressMethod === "automatic") && 
        (!manualAddress.lat || !manualAddress.long || !manualAddress.formatted)) {
      toast.error('Address required', 'Please provide a valid delivery address')
      return
    }

    // Select product with address validation
    mutationSelect.mutate(selectParams)
  }, [productId, quantity, orderMethod, addressMethod, selectedLocationId, manualAddress, mutationSelect])


  // GPS location with better error handling
  const handleUseCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        toast.error('Permission denied', 'Please enable location in settings.')
        return
      }
      
      const position = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = position.coords
      
      const reverseRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        { headers: { 'User-Agent': 'AcepickApp/1.0' } }
      )
      const reverseData = await reverseRes.json()
      if (reverseData?.display_name) {
        setManualAddress(prev => ({
          ...prev,
          formatted: reverseData.display_name,
          lat: latitude,
          long: longitude,
        }))
      } else {
        toast.error('Location Error', 'Could not determine address from location')
      }
    } catch (err) {
      console.error("Error getting location", err)
      toast.error('Location Error', 'Failed to get current location. Please try again.')
    }
  }

  // Geocode manual address input
  const handleGeocodeAddress = async () => {
    if (!manualAddress.input.trim()) {
      toast.error('Input required', 'Please enter an address')
      return
    }
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress.input)}&limit=1`,
        { headers: { 'User-Agent': 'AcepickApp/1.0' } }
      )
      const data = await response.json()
      if (data.length > 0) {
        setManualAddress(prev => ({
          ...prev,
          formatted: data[0].display_name || manualAddress.input,
          lat: parseFloat(data[0].lat),
          long: parseFloat(data[0].lon),
        }))
      } else {
        toast.error('Not found', 'Address not found. Please try a different address.')
      }
    } catch (err) {
      console.error("Error geocoding address", err)
      toast.error('Error', 'Failed to find address. Please check your connection.')
    }
  }


  return (
    <>
      
      <ContainerTemplate>
        <HeaderComponent title={"Delivery Details"} />
        <EmptyView height={20} />
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Product Summary Card */}
          {productData && (
            <View style={{ backgroundColor: selectioncardColor }} className="rounded-xl p-3 mb-4 border border-gray-100">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <ThemeText size={Textstyles.text_small} className="font-semibold">
                    {productData.name}
                  </ThemeText>
                  <ThemeText size={Textstyles.text_xsmall} type="secondary">
                    {formatNaira(productData.price)} × {quantity} {quantity > 1 ? 'items' : 'item'}
                  </ThemeText>
                </View>
                <ThemeText size={Textstyles.text_small} type="primary" className="font-bold">
                  {formatNaira(Number(productData.price) * quantity)}
                </ThemeText>
              </View>
            </View>
          )}

          {/* Loading state */}
          {productLoading && (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color={primaryColor} />
              <ThemeText size={Textstyles.text_xsmall}>
                Loading product details...
              </ThemeText>
            </View>
          )}

          {/* Delivery Method */}
          <View className="mb-3">
            <ThemeText size={Textstyles.text_xsmall} className="font-semibold mb-2">
              Delivery Method
            </ThemeText>
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 rounded-xl px-3 py-2 flex-row items-center justify-center gap-2"
                style={{
                  backgroundColor: selectioncardColor,
                  borderWidth: orderMethod === "delivery" ? 2 : 1,
                  borderColor: orderMethod === "delivery" ? primaryColor : '#e5e7eb',
                }}
                onPress={() => setOrderMethod("delivery")}
              >
                <Ionicons name="bicycle-outline" size={16} color={orderMethod === "delivery" ? primaryColor : '#9ca3af'} />
                <ThemeText size={Textstyles.text_xsmall} className="font-semibold">
                  Delivery
                </ThemeText>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 rounded-xl px-3 py-2 flex-row items-center justify-center gap-2"
                style={{
                  backgroundColor: selectioncardColor,
                  borderWidth: orderMethod === "self_pickup" ? 2 : 1,
                  borderColor: orderMethod === "self_pickup" ? primaryColor : '#e5e7eb',
                }}
                onPress={() => setOrderMethod("self_pickup")}
              >
                <Ionicons name="storefront-outline" size={16} color={orderMethod === "self_pickup" ? primaryColor : '#9ca3af'} />
                <ThemeText size={Textstyles.text_xsmall} className="font-semibold">
                  Pickup
                </ThemeText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={{ backgroundColor: selectioncardColor }} className="rounded-xl p-3 mb-3 border border-gray-100">
            <View className="flex-row justify-between items-center">
              <ThemeText size={Textstyles.text_xsmall} className="font-semibold">
                Quantity
              </ThemeText>
              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  className="rounded-full items-center justify-center w-8 h-8"
                  style={{ 
                    backgroundColor: quantity <= 1 ? '#f3f4f6' : primaryColor,
                    opacity: quantity <= 1 ? 0.5 : 1
                  }}
                  onPress={handleSubQuantity}
                  disabled={quantity <= 1}
                >
                  <Text style={{ color: quantity <= 1 ? '#9ca3af' : '#ffffff', fontSize: 16, fontWeight: '600' }}>
                    −
                  </Text>
                </TouchableOpacity>
                <ThemeText size={Textstyles.text_small} className="font-bold">
                  {quantity}
                </ThemeText>
                <TouchableOpacity
                  className="rounded-full items-center justify-center w-8 h-8"
                  style={{ 
                    backgroundColor: quantity >= maxQuantity ? '#f3f4f6' : primaryColor,
                    opacity: quantity >= maxQuantity ? 0.5 : 1
                  }}
                  onPress={handleAddQuantity}
                  disabled={quantity >= maxQuantity}
                >
                  <Text style={{ color: quantity >= maxQuantity ? '#9ca3af' : '#ffffff', fontSize: 16, fontWeight: '600' }}>
                    +
                  </Text>
                </TouchableOpacity>
                <ThemeText size={Textstyles.text_xsmall} type="secondary">
                  /{maxQuantity}
                </ThemeText>
              </View>
            </View>
          </View>

          {/* Delivery Options */}
          {orderMethod === "delivery" && (
            <View className="w-full">
              <ThemeText size={Textstyles.text_small} className="font-semibold mb-3">
                Delivery Address
              </ThemeText>
              <View className="flex-row gap-2 mb-4">
                {([
                  { key: "saved" as const, icon: "bookmark-outline" as const, label: "Saved" },
                  { key: "manual" as const, icon: "create-outline" as const, label: "Enter" },
                  { key: "automatic" as const, icon: "navigate-outline" as const, label: "GPS" },
                ]).map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    className="flex-1 rounded-xl py-3 items-center flex-row justify-center gap-1"
                    style={{
                      backgroundColor: addressMethod === opt.key ? primaryColor : selectioncardColor,
                      borderWidth: 1,
                      borderColor: addressMethod === opt.key ? primaryColor : '#e5e7eb',
                    }}
                    onPress={() => setAddressMethod(opt.key)}
                  >
                    <Ionicons 
                      name={opt.icon} 
                      size={16} 
                      color={addressMethod === opt.key ? '#ffffff' : '#9ca3af'} 
                    />
                    <Text style={{ 
                      color: addressMethod === opt.key ? '#ffffff' : '#6b7280',
                      fontSize: 12,
                      fontWeight: '600',
                    }}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Saved Addresses */}
              {addressMethod === "saved" && (
                <View>
                  {locationsLoading ? (
                    <View className="items-center justify-center py-10">
                      <ActivityIndicator size="small" color={primaryColor} />
                      <ThemeText size={Textstyles.text_xsmall}>
                        Loading saved addresses...
                      </ThemeText>
                    </View>
                  ) : (locations?.data?.slice(0, 3) || []).length > 0 ? (
                    (locations?.data?.slice(0, 3) || []).map((item: UserLocation) => (
                      <AddressCard
                        key={item.id?.toString() || Math.random().toString()}
                        item={item}
                        isSelected={selectedLocationId === item.id?.toString()}
                        onSelect={() => setSelectedLocationId(item.id?.toString() || null)}
                      />
                    ))
                  ) : (
                    <View className="items-center justify-center py-10">
                      <Ionicons name="location-outline" size={32} color={secondaryTextColor} />
                      <EmptyView height={8} />
                      <ThemeText size={Textstyles.text_xsmall} type="secondary">
                        No saved addresses found
                      </ThemeText>
                    </View>
                  )}
                </View>
              )}

              {/* Manual Address Entry */}
              {addressMethod === "manual" && (
                <>
                  <InputComponent
                    value={manualAddress.input}
                    onChange={(value) => setManualAddress(prev => ({ ...prev, input: value }))}
                    placeholder="Enter delivery address"
                    color={primaryColor}
                    placeholdercolor={secondaryTextColor}
                  />
                  <EmptyView height={10} />
                  <ButtonFunction
                    color={primaryColor}
                    text={"Confirm Address"}
                    textcolor={"#ffffff"}
                    onPress={handleGeocodeAddress}
                  />
                  {manualAddress.formatted && (
                    <View style={{ backgroundColor: selectioncardColor }} className="mt-2 p-2 rounded-lg flex-row items-center gap-2">
                      <Ionicons name="checkmark-circle" size={14} color={successColor} />
                      <ThemeText size={Textstyles.text_xsmall} type="secondary" className="flex-1">
                        {manualAddress.formatted}
                      </ThemeText>
                    </View>
                  )}
                </>
              )}

              {/* Current Location */}
              {addressMethod === "automatic" && (
                <View>
                  <TouchableOpacity
                    style={{ backgroundColor: selectioncardColor, borderWidth: 1, borderColor: '#e5e7eb' }}
                    className="rounded-xl p-3 flex-row items-center gap-3"
                    onPress={handleUseCurrentLocation}
                  >
                    <Ionicons name="navigate-outline" size={20} color={primaryColor} />
                    <ThemeText size={Textstyles.text_xsmall} className="font-semibold">
                      Use Current Location
                    </ThemeText>
                  </TouchableOpacity>
                  {manualAddress.formatted && (
                    <View style={{ backgroundColor: selectioncardColor }} className="mt-2 p-2 rounded-lg flex-row items-center gap-2">
                      <Ionicons name="checkmark-circle" size={14} color={successColor} />
                      <ThemeText size={Textstyles.text_xsmall} type="secondary" className="flex-1">
                        {manualAddress.formatted}
                      </ThemeText>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

              {/* Self Pickup Info */}
              {orderMethod === "self_pickup" && (
                <View style={{ backgroundColor: selectioncardColor }} className="rounded-xl p-3 flex-row items-center gap-2">
                  <Ionicons name="information-circle-outline" size={16} color={primaryColor} />
                  <ThemeText size={Textstyles.text_xsmall} type="secondary" className="flex-1">
                    Pick up from seller's location. No delivery fee.
                  </ThemeText>
                </View>
              )}

              <EmptyView height={30} />

              {/* Checkout Button */}
          <View className="mt-2">
            <View className="flex-row justify-between items-center mb-3 px-1">
              <ThemeText size={Textstyles.text_xsmall} type="secondary">
                Estimated Total:
              </ThemeText>
              <ThemeText size={Textstyles.text_small} type="primary" className="font-bold">
                {formatNaira(Number(productData?.price || 0) * quantity)}
              </ThemeText>
            </View>
            <ButtonFunction
              color={primaryColor}
              text={mutationSelect.isPending || mutationOrderCreate.isPending 
                ? "Processing..." 
                : orderMethod === "delivery" ? "Proceed to Payment" : "Continue to Payment"}
              textcolor="#ffffff"
              onPress={handleCheckout}
            />
          </View>
        </ScrollView>
      </ContainerTemplate>

      {/* Order / Payment Modal */}
      <SliderModalTemplate
        showmodal={showModal}
        modalHeight={"80%"}
        setshowmodal={setShowModal}
      >
        <PaymentModal 
          setShowModal={setShowModal} 
          product={productData || null} 
          productTransId={productTransactionId} 
          orderResponse={orderResponse} 
          quantity={quantity}
        />
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
  const { selectioncardColor, primaryColor } = getColors(theme)

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
      style={{ 
        backgroundColor: selectioncardColor,
        borderColor: isSelected ? primaryColor : '#e5e7eb',
        borderWidth: isSelected ? 2 : 1,
      }}
      className="flex-row items-center justify-between rounded-2xl px-4 py-4 mb-3"
    >
      <View className="flex-row items-center gap-3 flex-1">
        <View style={{ backgroundColor: isSelected ? primaryColor + '15' : '#f3f4f6' }} className="rounded-full p-2">
          <Ionicons name="location-outline" size={18} color={isSelected ? primaryColor : '#9ca3af'} />
        </View>
        <View className="flex-1">
          <ThemeText size={Textstyles.text_xsmall} className="font-medium">
            {address || "Fetching address..."}
          </ThemeText>
          {city ? (
            <ThemeText size={Textstyles.text_xsmall} type="secondary" className="mt-0.5">
              {city}
            </ThemeText>
          ) : null}
        </View>
      </View>
      {isSelected && <AntDesign name="checkcircle" size={20} color={primaryColor} />}
    </TouchableOpacity>
  )
}

// Payment Modal
interface PaymentModalProps {
  product: ProductData | null
  orderResponse: any
  setShowModal: (val: boolean) => void;
  productTransId: number
  quantity: number
}

const PaymentModal = ({ product, orderResponse, setShowModal, productTransId, quantity }: PaymentModalProps) => {
  const { theme } = useTheme()
  const { primaryColor, selectioncardColor, secondaryTextColor } = getColors(theme)
  const toast = useToast()
  
  // Calculate costs
  const deliveryCost = orderResponse?.cost || 0
  // productTransaction.price is already unitPrice * quantity from backend
  const productPrice = orderResponse?.productTransaction?.price || Number(product?.price || 0) * quantity
  const totalCost = Number(productPrice) + Number(deliveryCost)
  
  const productTransactionId = orderResponse?.productTransaction?.id || productTransId
  const router = useRouter()
  
  const paymentMutation = useMutation({
    mutationFn: paymentInitiate,
    onSuccess: async (data) => {
      const { reference, authorization_url } = data.data
      toast.success('Payment initiated', 'Redirecting to payment...')
      
      if (authorization_url && reference) {
        router.push({
          pathname: "/paystackViewLayout",
          params: { url: authorization_url, reference },
        })
      }
      
      setShowModal(false)
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Payment initiation failed'
      toast.error('Payment Failed', msg)
    },
  })
  
  const handlePayment = () => {
    if (!productTransactionId) {
      toast.error('Error', 'Invalid product transaction')
      return
    }
    
    const payload = {
      amount: totalCost,
      description: orderResponse ? 'product_order payment' : 'product payment',
      productTransactionId: Number(productTransactionId),
    }
    
    paymentMutation.mutate(payload)
  }
  
    return (
      <View className="px-5 py-5">
        <ThemeText size={Textstyles.text_cmedium}>{product?.name || 'Product'}</ThemeText>
        <Divider />
        <EmptyView height={20} />

        {/* Order Summary */}
        <View style={{ 
          backgroundColor: selectioncardColor,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 3,
          elevation: 2
        }} className="rounded-2xl p-4 mb-4">
          <ThemeText size={Textstyles.text_small} className="font-semibold mb-2">Order Summary</ThemeText>
          
          <View className="flex-row justify-between items-center mb-2">
            <ThemeText size={Textstyles.text_xsmall} type="secondary">
              Product ({quantity}x):
            </ThemeText>
            <ThemeText size={Textstyles.text_xsmall}>
              {formatNaira(Number(productPrice) * quantity)}
            </ThemeText>
          </View>
  
          {orderResponse && (
            <View className="flex-row justify-between items-center mb-2">
              <ThemeText size={Textstyles.text_xsmall} type="secondary">
                Delivery Fee:
              </ThemeText>
              <ThemeText size={Textstyles.text_xsmall}>
                {formatNaira(deliveryCost)}
              </ThemeText>
            </View>
          )}
  
          <Divider />
          <EmptyView height={8} />
  
          <View className="flex-row justify-between items-center">
            <ThemeText size={Textstyles.text_small}>
              Total:
            </ThemeText>
            <ThemeText size={Textstyles.text_small} type="primary">
              {formatNaira(totalCost)}
            </ThemeText>
          </View>
        </View>

        {/* Delivery Info */}
        {orderResponse && (
          <View style={{ 
            backgroundColor: selectioncardColor,
            borderLeftWidth: 3,
            borderLeftColor: primaryColor,
          }} className="rounded-2xl p-4 mb-4">
            <View className="flex-row items-center mb-2 gap-2">
              <View style={{ backgroundColor: primaryColor + '15' }} className="rounded-full p-2">
                <Ionicons name="location-outline" size={16} color={primaryColor} />
              </View>
              <ThemeText size={Textstyles.text_small} className="font-semibold">
                Delivery Details
              </ThemeText>
            </View>
            <View className="ml-10">
              <ThemeText size={Textstyles.text_xsmall} type="secondary">
                {orderResponse.deliveryAddress || 'Address will be confirmed'}
              </ThemeText>
              {orderResponse.distance && (
                <View className="flex-row items-center mt-1 gap-1">
                  <Ionicons name="car-outline" size={12} color={secondaryTextColor} />
                  <ThemeText size={Textstyles.text_xsmall} type="secondary">
                    {orderResponse.distance} km
                  </ThemeText>
                </View>
              )}
            </View>
          </View>
        )}
  
        <ButtonFunction
          color={primaryColor}
          text={paymentMutation.isPending ? "Processing..." : `Pay ${formatNaira(totalCost)}`}
          textcolor={"#ffffff"}
          onPress={handlePayment}
        />
      </View>
  )
}