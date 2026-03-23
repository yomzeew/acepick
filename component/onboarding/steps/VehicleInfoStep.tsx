import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { useState } from "react";
import InputComponent from "component/controls/textinput";
import ButtonComponent from "component/buttoncomponent";
import SelectComponent from "component/dashboardComponent/selectComponent";
import { Textstyles } from "static/textFontsize";
import { useDispatch } from "react-redux";
import { useToast } from "context/ToastContext";
import { setRegistrationData } from "redux/slices/authSlice";

interface VehicleInfoStepProps {
  onNext: () => void;
}

const VEHICLE_TYPES = ["Motorcycle", "Bicycle", "Car", "Van", "Truck"];

const VehicleInfoStep = ({ onNext }: VehicleInfoStepProps) => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor } = getColors(theme);

  const [vehicleType, setVehicleType] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const toast = useToast();

  const dispatch = useDispatch();

  const handleNext = () => {
    if (!vehicleType) {
      toast.error('Missing Field', 'Please select a vehicle type.');
      return;
    }
    if (!licenseNumber) {
      toast.error('Missing Field', "Please enter your driver's license number.");
      return;
    }

    dispatch(
      setRegistrationData({
        vehicleType,
        licenseNumber,
        plateNumber: plateNumber || undefined,
      })
    );
    onNext();
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={{ width: "100%", alignItems: "center", paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full items-center px-2">
            <Text className="text-center mb-4" style={[Textstyles.text_xsmall, { color: secondaryTextColor }]}>
              Enter your vehicle and license details
            </Text>
            <View className="h-3" />

            <SelectComponent
              title="Select Vehicle Type"
              width="100%"
              data={VEHICLE_TYPES}
              setValue={(text) => setVehicleType(text)}
              value={vehicleType}
            />
            <View className="h-5" />

            <InputComponent
              color={primaryColor}
              placeholder="Driver's License Number"
              placeholdercolor={secondaryTextColor}
              value={licenseNumber}
              onChange={setLicenseNumber}
            />
            <View className="h-5" />

            <InputComponent
              color={primaryColor}
              placeholder="Plate Number (optional)"
              placeholdercolor={secondaryTextColor}
              value={plateNumber}
              onChange={setPlateNumber}
            />
            <View className="h-5" />

            <View className="w-full">
              <ButtonComponent
                color={primaryColor}
                text="Next"
                textcolor="#fff"
                onPress={handleNext}
                disabled={!vehicleType || !licenseNumber}
              />
            </View>
            <View className="h-5" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default VehicleInfoStep;
