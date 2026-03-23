import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { useEffect, useState } from "react";
import ButtonComponent from "component/buttoncomponent";
import SelectComponent from "component/dashboardComponent/selectComponent";
import { Textstyles } from "static/textFontsize";
import { getAllSector, getProfessionsBySector } from "utilizes/fetchlistofjobs";
import { useToast } from "context/ToastContext";
import { useDispatch } from "react-redux";
import { setRegistrationData } from "redux/slices/authSlice";

interface ProfessionalInfoStepProps {
  onNext: () => void;
}

const ProfessionalInfoStep = ({ onNext }: ProfessionalInfoStepProps) => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor } = getColors(theme);

  const [sectorList, setSectorList] = useState<string[]>([]);
  const [professionArray, setProfessionArray] = useState<string[]>([]);
  const [sectorValue, setSectorValue] = useState("");
  const [professionValue, setProfessionValue] = useState("");
  const toast = useToast();

  const dispatch = useDispatch();

  useEffect(() => {
    const loadSectors = async () => {
      const sectors = await getAllSector();
      setSectorList(sectors.map((item: any) => item.title));
    };
    loadSectors();
  }, []);

  useEffect(() => {
    const loadProfessions = async () => {
      if (!sectorValue) return;
      const professions = await getProfessionsBySector(sectorValue);
      setProfessionArray(professions.map((item: any) => item.title));
    };
    loadProfessions();
  }, [sectorValue]);

  const handleNext = async () => {
    if (!sectorValue || !professionValue) {
      toast.error('Missing Fields', 'Please select a sector and profession.');
      return;
    }

    const professions = await getProfessionsBySector(sectorValue);
    const professionObject = professions.find((item: any) => item.title === professionValue);
    const professionId = professionObject?.id;

    if (!professionId) {
      toast.error('Error', 'Invalid profession selected.');
      return;
    }

    dispatch(setRegistrationData({ professionId }));
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
              Select your sector and profession
            </Text>
            <View className="h-3" />

            <SelectComponent
              title="Select Sector"
              width="100%"
              data={sectorList}
              setValue={(text) => {
                setSectorValue(text);
                setProfessionValue("");
              }}
              value={sectorValue}
            />
            <View className="h-5" />

            <SelectComponent
              title="Select Profession"
              width="100%"
              data={professionArray}
              setValue={(text) => setProfessionValue(text)}
              value={professionValue}
            />
            <View className="h-5" />

            <View className="w-full">
              <ButtonComponent
                color={primaryColor}
                text="Next"
                textcolor="#fff"
                onPress={handleNext}
                disabled={!sectorValue || !professionValue}
              />
            </View>
            <View className="h-5" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default ProfessionalInfoStep;
