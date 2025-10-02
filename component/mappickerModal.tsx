import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { AppleMaps, GoogleMaps } from "expo-maps"; // ✅ correct imports
import * as Location from "expo-location";

type MapPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (latitude: number, longitude: number, address: string) => void;
};

const MapPickerModal: React.FC<MapPickerModalProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate; // ✅ expo-maps event shape
    setSelectedLocation({ latitude, longitude });
  };

  const handleConfirm = async () => {
    if (selectedLocation) {
      let address = "";
      try {
        const geo = await Location.reverseGeocodeAsync({
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        });
        if (geo.length > 0) {
          const g = geo[0];
          address = `${g.name || ""} ${g.street || ""}, ${g.city || ""}`;
        }
      } catch (e) {
        console.warn("Reverse geocoding failed:", e);
      }

      onSelect(selectedLocation.latitude, selectedLocation.longitude, address);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Pick a Location</Text>

        {/* Use AppleMaps on iOS, GoogleMaps on Android */}
       {Platform.OS==='ios'? <AppleMaps.View
          style={styles.map}
          onMapClick={(coordinate)=>setSelectedLocation(coordinate)}

        />:
        <GoogleMaps.View
        style={styles.map}
        onMapClick={(coordinate:any)=>setSelectedLocation(coordinate)}

        />
        }
  
      

      

        <View style={styles.actions}>
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={{ color: "#000", fontWeight: "600" }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirm}
            style={[styles.button, styles.confirm]}
            disabled={!selectedLocation}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "bold", textAlign: "center", margin: 10 },
  map: { flex: 1 },
  actions: { flexDirection: "row", justifyContent: "space-around", padding: 10 },
  button: { padding: 12, backgroundColor: "#ccc", borderRadius: 8 },
  confirm: { backgroundColor: "blue" },
});

export default MapPickerModal;
