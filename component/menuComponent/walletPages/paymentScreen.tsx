import ButtonComponent from "component/buttoncomponent";
import Checkbox from "component/controls/checkbox";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import HeaderComponent from "component/headerComp";
import PinModal from "component/pinModal";
import { SliderModalNoScrollview } from "component/slideupModalTemplate";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "hooks/useTheme";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";

const PaymentScreen = () => {
  const { jobId, workmanship, materialCost } = useLocalSearchParams();
  const {theme}=useTheme()
  const {primaryColor,selectioncardColor}=getColors(theme)

  const [payMaterial, setPayMaterial] = useState(false);
  const [payWorkmanship, setPayWorkmanship] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "cash" | null>('wallet');
  const [pin,setPin]=useState('')
  const [showmodal,setshowmodal]=useState(false)

  const material = parseFloat(materialCost as string) || 0;
  const work = parseFloat(workmanship as string) || 0;

  const total =
    (payMaterial ? material : 0) + (payWorkmanship ? work : 0);

  const isPaymentReady = total > 0 && paymentMethod !== null;

  const handlepay=()=>{
    console.log(pin)
    setshowmodal(!showmodal)
  }

  return (
    <>
    <ContainerTemplate>
      <View className="h-full w-full px-6 py-4 flex-col">
        <HeaderComponent title="Payment" />

        <ThemeText size={Textstyles.text_xsmall} className="mt-4 mb-2">
          Make payment for:
        </ThemeText>

        <View className="flex-row justify-between items-center mb-4">
          <ThemeTextsecond size={Textstyles.text_xsmall}>Material Cost - ₦{material}</ThemeTextsecond>
          <Checkbox isChecked={payMaterial} onToggle={setPayMaterial} />
        </View>

        <View className="flex-row justify-between items-center mb-6">
          <ThemeTextsecond size={Textstyles.text_xsmall}>Workmanship - ₦{work}</ThemeTextsecond>
          <Checkbox isChecked={payWorkmanship} onToggle={setPayWorkmanship} />
        </View>

        <ThemeText size={Textstyles.text_xsmall} className="mb-2">
          Select Payment Method:
        </ThemeText>

        <View className="flex-row justify-between mb-6">
          <TouchableOpacity
            onPress={() => setPaymentMethod("wallet")}
            className={`px-4 py-2 rounded-lg border ${
              paymentMethod === "wallet" ? "bg-green-500" : selectioncardColor
            }`}
          >
            <ThemeTextsecond size={Textstyles.text_xsmall}>Wallet</ThemeTextsecond>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPaymentMethod("cash")}
            className={`px-4 py-2 rounded-lg border ${
              paymentMethod === "cash" ? "bg-green-500" : selectioncardColor
            }`}
          >
            <ThemeTextsecond size={Textstyles.text_xsmall}>Instant Payment</ThemeTextsecond>
          </TouchableOpacity>
        </View>

        <ThemeText size={Textstyles.text_xsmall} className="mb-4">
          Total: ₦{total}
        </ThemeText>
<ButtonComponent 
color={primaryColor} 
text={"Submit Payment"} 
textcolor={"#ffffff"} 
disabled={!isPaymentReady}

onPress={() => {
    // Handle payment submission here
    console.log("Submitting payment for job", jobId);
    console.log("Total:", total);
    console.log("Method:", paymentMethod);
    handlepay()
  }}
              />
    </View>
    </ContainerTemplate>
    <SliderModalNoScrollview showmodal={showmodal} modalHeight={'80%'} setshowmodal={setshowmodal}>
        <PinModal mode={"transaction"} onComplete={(value: string) => setPin(value)} onClose={() => setshowmodal(!showmodal)} visible={showmodal}/>
    </SliderModalNoScrollview>
    </>
  );
};

export default PaymentScreen;
