import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "component/headerComp"
import { useEffect, useState, useCallback } from "react"
import { TouchableOpacity, View, ActivityIndicator, ScrollView, Text, Modal } from "react-native"
import * as Location from "expo-location"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addLocationFn, getLocationFn, paymentInitiate, walletDebitProductFn, walletView } from "services/userService"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
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
import MapPickerModal from "component/mappickerModal"

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
  const [addressMethod, setAddressMethodRaw] = useState<"saved" | "manual" | "automatic" | "map">("saved")
  const [showMapPicker, setShowMapPicker] = useState(false)
  const setAddressMethod = (method: "saved" | "manual" | "automatic" | "map") => {
    setAddressMethodRaw(method)
    setSelectedLocationId(null)
    setManualAddress({ input: "", formatted: "", lat: null, long: null })
    setAddressSaved(false)
    setAddressSuggestions([])
    setShowSuggestions(false)
  }
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [manualAddress, setManualAddress] = useState({
    input: "",
    formatted: "",
    lat: null as number | null,
    long: null as number | null,
  })
  const [addressSaved, setAddressSaved] = useState(false)
  const [addressSuggestions, setAddressSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [productTransactionId, setProductTransactionId] = useState<number>(0)
  const [orderResponse, setOrderResponse] = useState<any>(null)
  const [selectProductData, setSelectProductData] = useState<any>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

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

  // Save address mutation
  const mutationSaveAddress = useMutation({
    mutationFn: addLocationFn,
    onSuccess: () => {
      setAddressSaved(true)
      toast.success('Address Saved', 'Address added to your saved locations')
      // Refresh saved locations list so it's available immediately
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to save address'
      toast.error('Save Failed', msg)
    },
  })

  const handleSaveAddress = () => {
    if (!manualAddress.formatted || !manualAddress.lat || !manualAddress.long) return
    mutationSaveAddress.mutate({
      address: manualAddress.formatted,
      latitude: manualAddress.lat,
      longitude: manualAddress.long,
    })
  }

  // Select product mutation
  const mutationSelect = useMutation({
    mutationFn: selectproductFn,
    onSuccess: (response) => {
      const productTransactionId = response.data.id
      setProductTransactionId(productTransactionId)
      setSelectProductData(response.data)  // save full response for exact price
      
      if (orderMethod === 'delivery') {
        // Validate address for delivery
        let payload: any = { productTransactionId }
        
        if (addressMethod === "saved" && selectedLocationId) {
          payload.locationId = Number(selectedLocationId)
        } else if ((addressMethod === "manual" || addressMethod === "automatic" || addressMethod === "map") &&
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
    
    if ((addressMethod === "manual" || addressMethod === "automatic" || addressMethod === "map") &&
        !manualAddress.formatted) {
      toast.error('Address required', 'Please provide a valid delivery address')
      return
    }

    // Coordinates are required by backend for non-saved addresses
    if ((addressMethod === "manual" || addressMethod === "automatic" || addressMethod === "map") &&
        (!manualAddress.lat || !manualAddress.long)) {
      toast.error('Address Required', 'Could not get coordinates for this address. Please use GPS or pin on map.')
      return
    }

    // Select product with address validation
    mutationSelect.mutate(selectParams)
  }, [productId, quantity, orderMethod, addressMethod, selectedLocationId, manualAddress, mutationSelect])


  // GPS location with better error handling
  const handleUseCurrentLocation = async () => {
    setIsGettingLocation(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        toast.error('Permission denied', 'Please enable location in settings.')
        return
      }
      
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      const { latitude, longitude } = position.coords
      
      const reverseRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'AcepickApp/1.0' } }
      )
      
      if (!reverseRes.ok) {
        throw new Error(`HTTP ${reverseRes.status}: ${reverseRes.statusText}`)
      }
      
      const reverseData = await reverseRes.json()
      if (reverseData?.display_name) {
        setManualAddress(prev => ({
          ...prev,
          formatted: reverseData.display_name,
          lat: latitude,
          long: longitude,
        }))
        toast.success('Location Found', 'Current location detected successfully')
      } else {
        // Fallback: use coordinates as address
        setManualAddress(prev => ({
          ...prev,
          formatted: `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`,
          lat: latitude,
          long: longitude,
        }))
        toast.info('Location Found', 'Coordinates captured. Please verify address manually.')
      }
    } catch (err: any) {
      console.error("Error getting location", err)
      let errorMessage = 'Failed to get current location. Please try again.'
      
      if (err.code === 'E_LOCATION_PERMISSION_DENIED') {
        errorMessage = 'Location permission denied. Please enable location in settings.'
      } else if (err.code === 'E_LOCATION_UNAVAILABLE') {
        errorMessage = 'Location services unavailable. Please check your GPS settings.'
      } else if (err.code === 'TIMEOUT') {
        errorMessage = 'Location request timed out. Please try again.'
      } else if (err.message?.includes('HTTP')) {
        errorMessage = 'Address lookup failed. Using coordinates only.'
        // Still set coordinates even if reverse geocoding fails
        if (err.coords) {
          setManualAddress(prev => ({
            ...prev,
            formatted: `Lat: ${err.coords.latitude.toFixed(6)}, Lon: ${err.coords.longitude.toFixed(6)}`,
            lat: err.coords.latitude,
            long: err.coords.longitude,
          }))
        }
      }
      
      toast.error('Location Error', errorMessage)
    } finally {
      setIsGettingLocation(false)
    }
  }

  // ── Geocoding helpers ──────────────────────────────────────────────────────

  /** Nominatim – returns up to `limit` results for a free-text query */
  const nominatimSearch = async (q: string, limit = 5) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=${limit}&addressdetails=1&countrycodes=ng`,
      { headers: { 'User-Agent': 'AcepickApp/1.0' } }
    )
    if (!res.ok) throw new Error(`Nominatim ${res.status}`)
    return res.json() as Promise<Array<{ display_name: string; lat: string; lon: string }>>
  }

  /** Google Geocoding – accurate, Nigeria-restricted, returns up to `limit` results */
  const googleGeocodeSearch = async (q: string, limit = 5) => {
    const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY
    if (!key) throw new Error('No Google Maps key')
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&components=country:NG&key=${key}`,
      { headers: { 'User-Agent': 'AcepickApp/1.0' } }
    )
    if (!res.ok) throw new Error(`Google Geocode ${res.status}`)
    const json = await res.json()
    if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') throw new Error(`Google status: ${json.status}`)
    return ((json.results || []) as any[]).slice(0, limit).map((r: any) => ({
      display_name: r.formatted_address as string,
      lat: String(r.geometry.location.lat),
      lon: String(r.geometry.location.lng),
    })) as Array<{ display_name: string; lat: string; lon: string }>
  }

  /** Photon (Komoot) – free, no key, returns ranked suggestions via GeoJSON */
  const photonSearch = async (q: string, limit = 5) => {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=${limit}&lang=en&bbox=2.6,4.2,14.7,13.9`, // Nigeria bounding box
      { headers: { 'User-Agent': 'AcepickApp/1.0' } }
    )
    if (!res.ok) throw new Error(`Photon ${res.status}`)
    const json = await res.json()
    // Normalise to the same shape as Nominatim results
    return (json.features || []).map((f: any) => ({
      display_name: [
        f.properties.name,
        f.properties.street,
        f.properties.city || f.properties.town || f.properties.village,
        f.properties.state,
        f.properties.country,
      ].filter(Boolean).join(', '),
      lat: String(f.geometry.coordinates[1]),
      lon: String(f.geometry.coordinates[0]),
    })) as Array<{ display_name: string; lat: string; lon: string }>
  }

  /** Pick a suggestion from the list and apply it */
  const handleSelectSuggestion = (s: { display_name: string; lat: string; lon: string }) => {
    setManualAddress(prev => ({
      ...prev,
      formatted: s.display_name,
      lat: parseFloat(s.lat),
      long: parseFloat(s.lon),
    }))
    setAddressSuggestions([])
    setShowSuggestions(false)
    setAddressSaved(false)
    toast.success('Address Selected', 'Location confirmed with coordinates')
  }

  // ── Main geocode handler ────────────────────────────────────────────────────

  const handleGeocodeAddress = async () => {
    const query = manualAddress.input.trim()
    if (!query) {
      toast.error('Input required', 'Please enter an address')
      return
    }

    setIsGeocoding(true)
    setAddressSuggestions([])
    setShowSuggestions(false)

    try {
      // ── Tier 1: Nominatim exact search (up to 5 results) ──────────────────
      let results = await nominatimSearch(query, 5).catch(() => [] as any[])

      if (results.length > 0) {
        // Best match found — apply immediately
        const best = results[0]
        setManualAddress(prev => ({
          ...prev,
          formatted: best.display_name,
          lat: parseFloat(best.lat),
          long: parseFloat(best.lon),
        }))
        toast.success('Address Found', 'Location confirmed with coordinates')
        return
      }

      // ── Tier 2: Google Geocoding (most accurate, Nigeria-restricted) ──────────
      const googleResults = await googleGeocodeSearch(query, 5).catch(() => [] as any[])
      if (googleResults.length > 0) {
        if (googleResults.length === 1) {
          const best = googleResults[0]
          setManualAddress(prev => ({
            ...prev,
            formatted: best.display_name,
            lat: parseFloat(best.lat),
            long: parseFloat(best.lon),
          }))
          toast.success('Address Found', 'Location confirmed via Google Maps')
          return
        }
        // Multiple Google results — let user pick
        setAddressSuggestions(googleResults)
        setShowSuggestions(true)
        toast.info('Select an Address', 'Multiple matches found. Choose the correct one below.')
        return
      }

      // ── Tier 3: Nominatim with simplified query (strip house numbers, etc.) ─
      const simplified = query.replace(/\d+/g, '').replace(/,\s*,/g, ',').trim()
      if (simplified && simplified !== query) {
        results = await nominatimSearch(simplified, 5).catch(() => [])
        if (results.length > 0) {
          const best = results[0]
          setManualAddress(prev => ({
            ...prev,
            formatted: best.display_name,
            lat: parseFloat(best.lat),
            long: parseFloat(best.lon),
          }))
          toast.success('Address Found', 'Closest matching address located')
          return
        }
      }

      // ── Tier 4: Photon suggestions (different engine, better fuzzy matching) ─
      let photonResults = await photonSearch(query, 5).catch(() => [] as any[])

      if (photonResults.length > 0) {
        if (photonResults.length === 1) {
          // Only one suggestion — apply it directly
          handleSelectSuggestion(photonResults[0])
          return
        }
        // Multiple suggestions — let the user pick
        setAddressSuggestions(photonResults)
        setShowSuggestions(true)
        toast.info('Select an Address', 'Exact match not found. Choose the closest option below.')
        return
      }

      // ── Tier 5: Nominatim broad suggestions (last resort) ─────────────────
      const broadResults = await nominatimSearch(query.split(',')[0], 5).catch(() => [])
      if (broadResults.length > 0) {
        setAddressSuggestions(broadResults)
        setShowSuggestions(true)
        toast.info('Select an Address', 'Showing nearby matches. Choose the closest option.')
        return
      }

      // ── Nothing found anywhere ─────────────────────────────────────────────
      toast.error('Address Not Found', 'No matching location found. Please try a different address or use GPS.')

    } catch (err: any) {
      console.error('Geocoding error', err)
      const msg = err.name === 'TypeError' && err.message.includes('fetch')
        ? 'Network error. Please check your connection and try again.'
        : 'Could not verify address. Please try again.'
      toast.error('Geocoding Failed', msg)
    } finally {
      setIsGeocoding(false)
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
                  { key: "map" as const, icon: "map-outline" as const, label: "Map" },
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
                    onChange={(value) => {
                      setManualAddress(prev => ({ ...prev, input: value, formatted: "", lat: null, long: null }))
                      setAddressSaved(false)
                      setAddressSuggestions([])
                      setShowSuggestions(false)
                    }}
                    placeholder="Enter delivery address"
                    color={primaryColor}
                    placeholdercolor={secondaryTextColor}
                  />
                  <EmptyView height={10} />
                  <View style={{ opacity: isGeocoding ? 0.6 : 1 }}>
                    <ButtonFunction
                      color={primaryColor}
                      text={isGeocoding ? "Verifying Address..." : "Confirm Address"}
                      textcolor={"#ffffff"}
                      onPress={isGeocoding ? () => {} : handleGeocodeAddress}
                    />
                  </View>

                  {/* Address suggestions list */}
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <View style={{
                      marginTop: 10,
                      borderRadius: 12,
                      overflow: 'hidden',
                      borderWidth: 1,
                      borderColor: primaryColor + '40',
                      backgroundColor: selectioncardColor,
                    }}>
                      <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: primaryColor + '20', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="search-outline" size={14} color={primaryColor} />
                        <ThemeText size={Textstyles.text_xsmall} style={{ color: primaryColor, fontWeight: '600' }}>
                          Select closest address:
                        </ThemeText>
                      </View>
                      {addressSuggestions.map((s, i) => (
                        <TouchableOpacity
                          key={i}
                          onPress={() => handleSelectSuggestion(s)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            gap: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            borderBottomWidth: i < addressSuggestions.length - 1 ? 1 : 0,
                            borderBottomColor: primaryColor + '15',
                          }}
                        >
                          <Ionicons name="location-outline" size={15} color={primaryColor} style={{ marginTop: 1 }} />
                          <ThemeText size={Textstyles.text_xsmall} type="secondary" style={{ flex: 1, lineHeight: 18 }}>
                            {s.display_name}
                          </ThemeText>
                          <Ionicons name="chevron-forward" size={14} color={secondaryTextColor} style={{ marginTop: 2 }} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {manualAddress.formatted && (
                    <View className="mt-2 gap-2">
                      <View style={{ backgroundColor: selectioncardColor }} className="p-2 rounded-lg flex-row items-center gap-2">
                        <Ionicons
                          name={manualAddress.lat && manualAddress.long ? "checkmark-circle" : "information-circle"}
                          size={14}
                          color={manualAddress.lat && manualAddress.long ? successColor : primaryColor}
                        />
                        <ThemeText size={Textstyles.text_xsmall} type="secondary" className="flex-1">
                          {manualAddress.formatted}
                        </ThemeText>
                        {!manualAddress.lat && !manualAddress.long && (
                          <ThemeText size={Textstyles.text_xsmall} type="secondary">
                            (Manual entry)
                          </ThemeText>
                        )}
                      </View>

                      {/* Save address — only available when we have coordinates */}
                      {manualAddress.lat && manualAddress.long && (
                        <TouchableOpacity
                          onPress={addressSaved ? undefined : handleSaveAddress}
                          disabled={mutationSaveAddress.isPending || addressSaved}
                          style={{
                            backgroundColor: addressSaved ? successColor + '20' : primaryColor + '15',
                            borderWidth: 1,
                            borderColor: addressSaved ? successColor : primaryColor,
                            borderRadius: 10,
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            opacity: mutationSaveAddress.isPending ? 0.6 : 1,
                          }}
                        >
                          {mutationSaveAddress.isPending ? (
                            <ActivityIndicator size="small" color={primaryColor} />
                          ) : (
                            <Ionicons
                              name={addressSaved ? "checkmark-circle" : "bookmark-outline"}
                              size={14}
                              color={addressSaved ? successColor : primaryColor}
                            />
                          )}
                          <ThemeText
                            size={Textstyles.text_xsmall}
                            style={{ color: addressSaved ? successColor : primaryColor, fontWeight: '600' }}
                          >
                            {addressSaved ? 'Address Saved' : mutationSaveAddress.isPending ? 'Saving…' : 'Save Address'}
                          </ThemeText>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </>
              )}

              {/* Map Picker */}
              {addressMethod === "map" && (
                <View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: selectioncardColor,
                      borderWidth: 1,
                      borderColor: manualAddress.formatted ? primaryColor : '#e5e7eb',
                      borderRadius: 12,
                      padding: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}
                    onPress={() => setShowMapPicker(true)}
                  >
                    <View style={{ backgroundColor: primaryColor + '15', borderRadius: 22, padding: 8 }}>
                      <Ionicons name="map-outline" size={22} color={primaryColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemeText size={Textstyles.text_xsmall} className="font-semibold">
                        {manualAddress.formatted ? 'Change Pin Location' : 'Pin on Map'}
                      </ThemeText>
                      <ThemeText size={Textstyles.text_xsmall} type="secondary">
                        {manualAddress.formatted ? 'Tap to reposition' : 'Tap to open map and drop a pin'}
                      </ThemeText>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={secondaryTextColor} />
                  </TouchableOpacity>

                  {manualAddress.formatted && (
                    <View className="mt-2 gap-2">
                      <View style={{ backgroundColor: selectioncardColor }} className="p-2 rounded-lg flex-row items-center gap-2">
                        <Ionicons name="checkmark-circle" size={14} color={successColor} />
                        <ThemeText size={Textstyles.text_xsmall} type="secondary" className="flex-1">
                          {manualAddress.formatted}
                        </ThemeText>
                      </View>

                      {/* Save pinned address */}
                      <TouchableOpacity
                        onPress={addressSaved ? undefined : handleSaveAddress}
                        disabled={mutationSaveAddress.isPending || addressSaved}
                        style={{
                          backgroundColor: addressSaved ? successColor + '20' : primaryColor + '15',
                          borderWidth: 1,
                          borderColor: addressSaved ? successColor : primaryColor,
                          borderRadius: 10,
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          opacity: mutationSaveAddress.isPending ? 0.6 : 1,
                        }}
                      >
                        {mutationSaveAddress.isPending ? (
                          <ActivityIndicator size="small" color={primaryColor} />
                        ) : (
                          <Ionicons
                            name={addressSaved ? "checkmark-circle" : "bookmark-outline"}
                            size={14}
                            color={addressSaved ? successColor : primaryColor}
                          />
                        )}
                        <ThemeText
                          size={Textstyles.text_xsmall}
                          style={{ color: addressSaved ? successColor : primaryColor, fontWeight: '600' }}
                        >
                          {addressSaved ? 'Address Saved' : mutationSaveAddress.isPending ? 'Saving…' : 'Save Address'}
                        </ThemeText>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* Current Location */}
              {addressMethod === "automatic" && (
                <View>
                  <TouchableOpacity
                    style={{ 
                      backgroundColor: selectioncardColor, 
                      borderWidth: 1, 
                      borderColor: '#e5e7eb',
                      opacity: isGettingLocation ? 0.6 : 1
                    }}
                    className="rounded-xl p-3 flex-row items-center gap-3"
                    onPress={isGettingLocation ? () => {} : handleUseCurrentLocation}
                  >
                    {isGettingLocation ? (
                      <ActivityIndicator size="small" color={primaryColor} />
                    ) : (
                      <Ionicons name="navigate-outline" size={20} color={primaryColor} />
                    )}
                    <ThemeText size={Textstyles.text_xsmall} className="font-semibold">
                      {isGettingLocation ? "Getting Location..." : "Use Current Location"}
                    </ThemeText>
                  </TouchableOpacity>
                  {manualAddress.formatted && (
                    <View className="mt-2 gap-2">
                      <View style={{ backgroundColor: selectioncardColor }} className="p-2 rounded-lg flex-row items-center gap-2">
                        <Ionicons name="checkmark-circle" size={14} color={successColor} />
                        <ThemeText size={Textstyles.text_xsmall} type="secondary" className="flex-1">
                          {manualAddress.formatted}
                        </ThemeText>
                      </View>

                      {/* Save GPS address */}
                      <TouchableOpacity
                        onPress={addressSaved ? undefined : handleSaveAddress}
                        disabled={mutationSaveAddress.isPending || addressSaved}
                        style={{
                          backgroundColor: addressSaved ? successColor + '20' : primaryColor + '15',
                          borderWidth: 1,
                          borderColor: addressSaved ? successColor : primaryColor,
                          borderRadius: 10,
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          opacity: mutationSaveAddress.isPending ? 0.6 : 1,
                        }}
                      >
                        {mutationSaveAddress.isPending ? (
                          <ActivityIndicator size="small" color={primaryColor} />
                        ) : (
                          <Ionicons
                            name={addressSaved ? "checkmark-circle" : "bookmark-outline"}
                            size={14}
                            color={addressSaved ? successColor : primaryColor}
                          />
                        )}
                        <ThemeText
                          size={Textstyles.text_xsmall}
                          style={{ color: addressSaved ? successColor : primaryColor, fontWeight: '600' }}
                        >
                          {addressSaved ? 'Address Saved' : mutationSaveAddress.isPending ? 'Saving…' : 'Save Address'}
                        </ThemeText>
                      </TouchableOpacity>
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

      {/* Map Picker */}
      <MapPickerModal
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onSelect={(latitude, longitude, address) => {
          setManualAddress({ input: address, formatted: address, lat: latitude, long: longitude })
          setAddressSaved(false)
          toast.success('Location Pinned', 'Address confirmed from map')
        }}
      />

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
          selectProductData={selectProductData}
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
  const [isLoading, setIsLoading] = useState(true)
  const { theme } = useTheme()
  const { selectioncardColor, primaryColor } = getColors(theme)

  useEffect(() => {
    let cancelled = false
    const fetchAddress = async () => {
      setIsLoading(true)
      try {
        // Use item.address if available as immediate fallback
        if (item?.address) {
          setAddress(item.address)
          setCity(item?.lga || item?.state || "")
        }
        
        if (item?.latitude && item?.longitude) {
          const pickup = await Promise.race([
            Location.reverseGeocodeAsync({
              latitude: item.latitude,
              longitude: item.longitude,
            }),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
          ])
          if (!cancelled && pickup.length > 0) {
            setAddress(`${pickup[0].name || ""} ${pickup[0].street || ""}, ${pickup[0].city || ""}`)
            setCity(pickup[0].city || "")
          }
        }
      } catch (error) {
        console.error("Error getting addresses:", error)
        // Fallback to stored address or coordinates
        if (!cancelled && !address) {
          setAddress(item?.address || `${item?.state || ''}, ${item?.lga || ''}`)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchAddress()
    return () => { cancelled = true }
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
            {isLoading && !address ? "Loading address..." : address || "Address unavailable"}
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
  selectProductData?: any   // raw selectProduct response — has the exact backend-stored price
}

const PaymentModal = ({ product, orderResponse, setShowModal, productTransId, quantity, selectProductData }: PaymentModalProps) => {
  const { theme } = useTheme()
  const { primaryColor, selectioncardColor, secondaryTextColor } = getColors(theme)
  const toast = useToast()
  const router = useRouter()
  const isDark = theme === "dark"

  const deliveryCost = Number(orderResponse?.cost || 0)
  const productPrice = Number(product?.price || 0) * quantity

  // Use the exact price the backend stored in productTransaction — avoids amount-mismatch errors.
  // For delivery: totalCost = order.cost + productTransaction.price (backend already aggregated in totalCost).
  // For self-pickup: use selectProductData.price which is exactly what the backend stored.
  const transactionStoredPrice = selectProductData?.price !== undefined
    ? Number(selectProductData.price)
    : Number(product?.price || 0) * quantity

  const totalCost = orderResponse?.totalCost
    ? Number(orderResponse.totalCost)
    : transactionStoredPrice

  const productTransactionId = orderResponse?.productTransaction?.id || productTransId

  // Wallet balance — seed from Redux, then refresh from API when modal opens
  const reduxBalance = Number(useSelector((state: RootState) => state.auth.user?.wallet?.currentBalance) ?? 0)
  const [walletBalance, setWalletBalance] = useState<number>(reduxBalance)
  const [loadingBalance, setLoadingBalance] = useState(false)

  useEffect(() => {
    setLoadingBalance(true)
    walletView()
      .then((res) => {
        // Backend returns: { data: { currentBalance, ... } }
        const bal = res?.data?.currentBalance ?? res?.data?.balance ?? res?.currentBalance ?? res?.balance ?? reduxBalance
        setWalletBalance(Number(bal))
      })
      .catch(() => setWalletBalance(reduxBalance))
      .finally(() => setLoadingBalance(false))
  }, [])

  const hasSufficientBalance = walletBalance >= totalCost

  // ── Paystack payment ──
  const paystackMutation = useMutation({
    mutationFn: paymentInitiate,
    onSuccess: (data) => {
      const { reference, authorization_url } = data.data
      toast.success('Payment initiated', 'Redirecting to Paystack...')
      // Close modal before navigation
      setShowModal(false)
      if (authorization_url && reference) {
        router.push({
          pathname: "/paystackViewLayout",
          params: { url: authorization_url, reference, context: 'marketplace' },
        })
      }
    },
    onError: (error: any) => {
      if (error?.bvnRequired) {
        toast.error('BVN Required', 'Verify your BVN before making payments')
        router.push('/bvnactivationlayout' as any)
        return
      }
      const msg = error?.response?.data?.message || error?.message || 'Payment initiation failed'
      toast.error('Payment Failed', msg)
    },
  })

  // PIN input state for wallet payment
  const [showPinStep, setShowPinStep] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')

  // ── Wallet payment ──
  const walletMutation = useMutation({
    mutationFn: walletDebitProductFn,
    onSuccess: () => {
      toast.success('Payment Successful', 'Your wallet was charged successfully!')
      setShowModal(false)
      setShowPinStep(false)
      setPin('')
      router.replace('/(Authenticated)/(marketplace)/myItemsLayout?tab=Bought' as any)
    },
    onError: (error: any) => {
      console.log('[WalletPay] error →', JSON.stringify(error?.response?.data || error?.message))
      if (error?.bvnRequired) {
        toast.error('BVN Required', 'Verify your BVN before making payments')
        router.push('/bvnactivationlayout' as any)
        return
      }
      const msg = error?.response?.data?.message || error?.message || 'Wallet payment failed'
      const lowerMsg = msg.toLowerCase()
      if (lowerMsg.includes('pin') || lowerMsg.includes('incorrect')) {
        setPinError('Incorrect PIN. Please try again.')
        setPin('')
      } else if (lowerMsg.includes('insufficient') || lowerMsg.includes('balance')) {
        toast.error('Insufficient Balance', msg)
        setShowPinStep(false)
        setPin('')
      } else {
        toast.error('Payment Failed', msg)
        setShowPinStep(false)
        setPin('')
      }
    },
  })

  const handlePaystack = () => {
    if (!productTransactionId) { toast.error('Error', 'Invalid transaction'); return }
    paystackMutation.mutate({
      amount: totalCost,
      description: orderResponse ? 'product_order payment' : 'product payment',
      productTransactionId: Number(productTransactionId),
    })
  }

  const handleWallet = () => {
    if (!productTransactionId) { toast.error('Error', 'Invalid transaction'); return }
    if (!hasSufficientBalance) {
      toast.error('Insufficient Balance', `You need ${formatNaira(totalCost)} but have ${formatNaira(walletBalance)}`)
      return
    }
    setShowPinStep(true)
    setPinError('')
    setPin('')
  }

  const handleConfirmWalletPin = () => {
    if (pin.length !== 4) { setPinError('Enter your 4-digit wallet PIN'); return }
    const payload = {
      amount: totalCost,
      pin,
      productTransactionId: Number(productTransactionId),
      reason: orderResponse ? 'product_order payment' : 'product payment',
    }
    console.log('[WalletPay] payload →', JSON.stringify({ ...payload, pin: '****' }))
    walletMutation.mutate(payload)
  }

  const isLoading = paystackMutation.isPending || walletMutation.isPending || loadingBalance

  const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  }

  // ── PIN Entry Step ──
  if (showPinStep) {
    return (
      <View className="px-5 py-6">
        <TouchableOpacity onPress={() => { setShowPinStep(false); setPin(''); setPinError('') }} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 6 }}>
          <Ionicons name="arrow-back" size={20} color={primaryColor} />
          <Text style={{ color: primaryColor, fontSize: 14, fontWeight: '600' }}>Back</Text>
        </TouchableOpacity>

        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#16A34A15', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Ionicons name="lock-closed-outline" size={32} color="#16A34A" />
          </View>
          <Text style={{ color: isDark ? '#F9FAFB' : '#111827', fontSize: 18, fontWeight: '700' }}>Enter Wallet PIN</Text>
          <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 13, marginTop: 4, textAlign: 'center' }}>
            Confirm payment of {formatNaira(totalCost)}
          </Text>
        </View>

        {/* PIN dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{
              width: 16, height: 16, borderRadius: 8,
              backgroundColor: pin.length > i ? '#16A34A' : (isDark ? '#374151' : '#E5E7EB'),
              borderWidth: pin.length > i ? 0 : 1.5,
              borderColor: isDark ? '#4B5563' : '#D1D5DB',
            }} />
          ))}
        </View>

        {pinError ? (
          <Text style={{ color: '#EF4444', fontSize: 13, textAlign: 'center', marginBottom: 8 }}>{pinError}</Text>
        ) : <EmptyView height={22} />}

        {/* Numpad */}
        <View style={{ gap: 12 }}>
          {[['1','2','3'],['4','5','6'],['7','8','9'],['','0','⌫']].map((row, ri) => (
            <View key={ri} style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
              {row.map((key, ki) => (
                <TouchableOpacity
                  key={ki}
                  disabled={!key}
                  onPress={() => {
                    setPinError('')
                    if (key === '⌫') { setPin(p => p.slice(0, -1)); return }
                    if (key && pin.length < 4) setPin(p => p + key)
                  }}
                  style={{
                    width: 72, height: 56, borderRadius: 14,
                    backgroundColor: key ? (isDark ? '#374151' : '#F3F4F6') : 'transparent',
                    alignItems: 'center', justifyContent: 'center',
                    opacity: !key ? 0 : 1,
                  }}
                >
                  <Text style={{ color: isDark ? '#F9FAFB' : '#111827', fontSize: 22, fontWeight: '600' }}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <EmptyView height={20} />

        <TouchableOpacity
          onPress={handleConfirmWalletPin}
          disabled={pin.length !== 4 || walletMutation.isPending}
          style={{
            backgroundColor: pin.length === 4 ? '#16A34A' : (isDark ? '#374151' : '#E5E7EB'),
            borderRadius: 14, paddingVertical: 16,
            alignItems: 'center', justifyContent: 'center',
            flexDirection: 'row', gap: 8,
          }}
        >
          {walletMutation.isPending
            ? <ActivityIndicator size="small" color="#fff" />
            : <>
                <Ionicons name="checkmark-circle-outline" size={20} color={pin.length === 4 ? '#fff' : (isDark ? '#6B7280' : '#9CA3AF')} />
                <Text style={{ color: pin.length === 4 ? '#fff' : (isDark ? '#6B7280' : '#9CA3AF'), fontSize: 16, fontWeight: '700' }}>
                  Confirm Payment
                </Text>
              </>
          }
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="px-5 py-5">
      <ThemeText size={Textstyles.text_cmedium}>{product?.name || 'Product'}</ThemeText>
      <Divider />
      <EmptyView height={16} />

      {/* Order Summary */}
      <View style={{ backgroundColor: selectioncardColor, ...cardShadow }} className="rounded-2xl p-4 mb-4">
        <ThemeText size={Textstyles.text_small} className="font-semibold mb-2">Order Summary</ThemeText>

        <View className="flex-row justify-between items-center mb-2">
          <ThemeText size={Textstyles.text_xsmall} type="secondary">Product ({quantity}x):</ThemeText>
          <ThemeText size={Textstyles.text_xsmall}>{formatNaira(productPrice)}</ThemeText>
        </View>

        {orderResponse && (
          <View className="flex-row justify-between items-center mb-2">
            <ThemeText size={Textstyles.text_xsmall} type="secondary">Delivery Fee:</ThemeText>
            <ThemeText size={Textstyles.text_xsmall}>{formatNaira(deliveryCost)}</ThemeText>
          </View>
        )}

        <Divider />
        <EmptyView height={8} />

        <View className="flex-row justify-between items-center">
          <ThemeText size={Textstyles.text_small}>Total:</ThemeText>
          <ThemeText size={Textstyles.text_small} type="primary">{formatNaira(totalCost)}</ThemeText>
        </View>
      </View>

      {/* Delivery Info */}
      {orderResponse && (
        <View style={{ backgroundColor: selectioncardColor, borderLeftWidth: 3, borderLeftColor: primaryColor, ...cardShadow }} className="rounded-2xl p-4 mb-4">
          <View className="flex-row items-center mb-2 gap-2">
            <View style={{ backgroundColor: primaryColor + '15' }} className="rounded-full p-2">
              <Ionicons name="location-outline" size={16} color={primaryColor} />
            </View>
            <ThemeText size={Textstyles.text_small} className="font-semibold">Delivery Details</ThemeText>
          </View>
          <View className="ml-10">
            <ThemeText size={Textstyles.text_xsmall} type="secondary">
              {orderResponse.deliveryAddress || 'Address will be confirmed'}
            </ThemeText>
            {orderResponse.distance && (
              <View className="flex-row items-center mt-1 gap-1">
                <Ionicons name="car-outline" size={12} color={secondaryTextColor} />
                <ThemeText size={Textstyles.text_xsmall} type="secondary">{orderResponse.distance} km</ThemeText>
              </View>
            )}
          </View>
        </View>
      )}

      {/* ── Payment Options ── */}
      <Text style={{
        color: isDark ? '#9CA3AF' : '#6B7280',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 10,
      }}>
        Choose Payment Method
      </Text>

      {/* Wallet option */}
      <TouchableOpacity
        onPress={handleWallet}
        disabled={isLoading}
        style={{
          backgroundColor: hasSufficientBalance
            ? (isDark ? '#1F2937' : '#F0FDF4')
            : (isDark ? '#1F2937' : '#FFF7F7'),
          borderWidth: 1.5,
          borderColor: hasSufficientBalance ? '#16A34A' : '#EF4444',
          borderRadius: 16,
          padding: 16,
          marginBottom: 10,
          opacity: isLoading ? 0.6 : 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View style={{
          width: 44, height: 44, borderRadius: 22,
          backgroundColor: hasSufficientBalance ? '#16A34A15' : '#EF444415',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons
            name="wallet-outline"
            size={22}
            color={hasSufficientBalance ? '#16A34A' : '#EF4444'}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: isDark ? '#F9FAFB' : '#111827', fontSize: 15, fontWeight: '700' }}>
            Pay with Wallet
          </Text>
          {loadingBalance ? (
            <ActivityIndicator size="small" color="#16A34A" style={{ marginTop: 4 }} />
          ) : (
            <Text style={{ color: hasSufficientBalance ? '#16A34A' : '#EF4444', fontSize: 13, marginTop: 2 }}>
              Balance: {formatNaira(walletBalance)}
              {!hasSufficientBalance && '  (Insufficient)'}
            </Text>
          )}
        </View>
        {walletMutation.isPending ? (
          <ActivityIndicator size="small" color="#16A34A" />
        ) : (
          <Ionicons name="chevron-forward" size={18} color={isDark ? '#6B7280' : '#9CA3AF'} />
        )}
      </TouchableOpacity>

      {/* Paystack option */}
      <TouchableOpacity
        onPress={handlePaystack}
        disabled={isLoading}
        style={{
          backgroundColor: isDark ? '#1F2937' : '#F0F9FF',
          borderWidth: 1.5,
          borderColor: primaryColor,
          borderRadius: 16,
          padding: 16,
          marginBottom: 4,
          opacity: isLoading ? 0.6 : 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View style={{
          width: 44, height: 44, borderRadius: 22,
          backgroundColor: primaryColor + '15',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name="card-outline" size={22} color={primaryColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: isDark ? '#F9FAFB' : '#111827', fontSize: 15, fontWeight: '700' }}>
            Pay with Card / Bank
          </Text>
          <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 13, marginTop: 2 }}>
            Powered by Paystack  ·  Secure checkout
          </Text>
        </View>
        {paystackMutation.isPending ? (
          <ActivityIndicator size="small" color={primaryColor} />
        ) : (
          <Ionicons name="chevron-forward" size={18} color={isDark ? '#6B7280' : '#9CA3AF'} />
        )}
      </TouchableOpacity>

      <EmptyView height={8} />
    </View>
  )
}