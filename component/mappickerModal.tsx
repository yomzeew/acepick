import React, { useState, useRef } from "react"
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native"
import { AppleMaps, GoogleMaps } from "expo-maps"
import * as Location from "expo-location"
import { Ionicons } from "@expo/vector-icons"

type MapPickerModalProps = {
  visible: boolean
  onClose: () => void
  onSelect: (latitude: number, longitude: number, address: string) => void
}

// Default centre: Lagos, Nigeria
const DEFAULT_CENTER = { latitude: 6.5244, longitude: 3.3792 }

const MapPickerModal: React.FC<MapPickerModalProps> = ({ visible, onClose, onSelect }) => {
  // The crosshair always reflects wherever the camera is centred
  const [center, setCenter] = useState(DEFAULT_CENTER)
  const [camera, setCamera] = useState({ coordinates: DEFAULT_CENTER, zoom: 13 })
  const [isDragging, setIsDragging] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  // expo-maps wraps native events — after useNativeEvent unwrap, we get { coordinates, zoom, … }
  const handleCameraMove = (event: any) => {
    const lat = event?.coordinates?.latitude
    const lng = event?.coordinates?.longitude
    if (lat != null && lng != null) {
      setCenter({ latitude: lat, longitude: lng })
      setIsDragging(true)
    }
  }

  // onCameraIdle doesn't exist in expo-maps yet — use a short debounce via onCameraMove settling
  // We treat "not dragging" as soon as the user lifts the finger; the last center value is used on confirm.

  const handleUseCurrentLocation = async () => {
    setIsLocating(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") return
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
      setCenter(coords)
      setCamera({ coordinates: coords, zoom: 16 })
    } catch (e) {
      console.warn("GPS error", e)
    } finally {
      setIsLocating(false)
    }
  }

  const handleConfirm = async () => {
    setIsConfirming(true)
    let address = ""
    try {
      const geo = await Location.reverseGeocodeAsync({
        latitude: center.latitude,
        longitude: center.longitude,
      })
      if (geo.length > 0) {
        const g = geo[0]
        address = [g.name, g.street, g.district, g.city, g.region]
          .filter(Boolean)
          .join(", ")
      }
    } catch (e) {
      console.warn("Reverse geocoding failed:", e)
    }
    if (!address) {
      address = `${center.latitude.toFixed(6)}, ${center.longitude.toFixed(6)}`
    }
    setIsConfirming(false)
    onSelect(center.latitude, center.longitude, address)
    // reset for next open
    setCenter(DEFAULT_CENTER)
    setCamera({ coordinates: DEFAULT_CENTER, zoom: 13 })
    setIsDragging(false)
    onClose()
  }

  const handleClose = () => {
    setCenter(DEFAULT_CENTER)
    setCamera({ coordinates: DEFAULT_CENTER, zoom: 13 })
    setIsDragging(false)
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Pin Delivery Location</Text>
          <TouchableOpacity onPress={handleUseCurrentLocation} disabled={isLocating} style={styles.iconBtn}>
            {isLocating
              ? <ActivityIndicator size="small" color="#2563EB" />
              : <Ionicons name="navigate" size={20} color="#2563EB" />}
          </TouchableOpacity>
        </View>

        {/* Map + crosshair overlay */}
        <View style={styles.mapContainer}>
          {Platform.OS === "ios" ? (
            <AppleMaps.View
              style={StyleSheet.absoluteFill}
              cameraPosition={camera}
              onCameraMove={handleCameraMove}
            />
          ) : (
            <GoogleMaps.View
              style={StyleSheet.absoluteFill}
              cameraPosition={camera}
              onCameraMove={handleCameraMove}
            />
          )}

          {/* Fixed crosshair — always centred, user drags map under it */}
          <View pointerEvents="none" style={styles.crosshairWrapper}>
            {/* shadow dot on the ground */}
            <View style={styles.pinShadow} />
            {/* pin body */}
            <View style={[styles.pinBody, isDragging && styles.pinBodyDragging]}>
              <Ionicons name="location" size={36} color="#2563EB" />
            </View>
          </View>

          {/* Coordinates bubble */}
          <View pointerEvents="none" style={styles.coordBubble}>
            <Ionicons name="location-outline" size={12} color="#2563EB" />
            <Text style={styles.coordBubbleText}>
              {center.latitude.toFixed(5)},  {center.longitude.toFixed(5)}
            </Text>
          </View>
        </View>

        {/* Hint */}
        <View style={styles.hint}>
          <Ionicons name="hand-left-outline" size={14} color="#6B7280" />
          <Text style={styles.hintText}>
            Drag the map to move the pin to your delivery location
          </Text>
        </View>

        {/* Confirm button */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={isConfirming}
            style={[styles.confirmBtn, isConfirming && styles.confirmBtnLoading]}
          >
            {isConfirming
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />}
            <Text style={styles.confirmText}>
              {isConfirming ? "Getting address…" : "Confirm This Location"}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  iconBtn: { padding: 6 },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  mapContainer: {
    flex: 1,
    overflow: "hidden",
  },

  // Crosshair sits dead-centre of the map container
  crosshairWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  pinBody: {
    // nudge up so the tip of the pin icon sits on the map centre
    marginBottom: 36,
    transform: [{ scale: 1 }],
  },
  pinBodyDragging: {
    // lift pin while dragging
    transform: [{ translateY: -8 }, { scale: 1.15 }],
  },
  pinShadow: {
    position: "absolute",
    width: 14,
    height: 6,
    borderRadius: 7,
    backgroundColor: "rgba(0,0,0,0.25)",
    // sits at centre — nudge down slightly under the pin tip
    top: "50%",
    alignSelf: "center",
    marginTop: -3,
  },

  // live coordinate readout in top-left of map
  coordBubble: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  coordBubbleText: { fontSize: 11, color: "#374151", fontWeight: "600" },

  hint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  hintText: { fontSize: 12, color: "#6B7280", flex: 1 },

  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  confirmBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  confirmBtnLoading: { opacity: 0.7 },
  confirmText: { color: "#fff", fontSize: 16, fontWeight: "700" },
})

export default MapPickerModal
