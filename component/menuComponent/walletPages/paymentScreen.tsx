import { useMutation } from "@tanstack/react-query";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import ButtonComponent from "component/buttoncomponent";
import Checkbox from "component/controls/checkbox";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import HeaderComponent from "component/headerComp";
import PinModal from "component/pinModal";
import { SliderModalNoScrollview } from "component/slideupModalTemplate";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "hooks/useTheme";
import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { paymentInitiate, walletDebitFn } from "services/userService";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";

const PaymentScreen = () => {
  const { jobId, workmanship, materialCost } = useLocalSearchParams();
  const {theme}=useTheme()
  const {primaryColor,selectioncardColor}=getColors(theme)

  const [payMaterial, setPayMaterial] = useState(true);
  const [payWorkmanship, setPayWorkmanship] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "instant" | null>('wallet');
  const [pin,setPin]=useState('')
  const [showmodal,setshowmodal]=useState(false)
  const [errorMessage,setErrorMessage]=useState<string| null>(null)
  const [successMessage,setSuccessMessage]=useState<string | null>(null)
  const [ref,setRef]=useState(null)

  const material = parseFloat(materialCost as string) || 0;
  const work = parseFloat(workmanship as string) || 0;

  const total =
    (payMaterial ? material : 0) + (payWorkmanship ? work : 0);

  const isPaymentReady = total > 0 && paymentMethod !== null;

  

  const router = useRouter();
    useEffect(() => {
      if (errorMessage) {
        const timer = setTimeout(() => {
          setErrorMessage(null);
        }, 4000);
        return () => clearTimeout(timer); // Cleanup on unmount or on new error
      }
    }, [errorMessage])
    useEffect(() => {
      if (errorMessage) {
        const timer = setTimeout(() => {
          setSuccessMessage(null);
        }, 4000);
        return () => clearTimeout(timer); // Cleanup on unmount or on new error
      }
    }, [successMessage])
   
  
    // Clear error message after 4 seconds
    useEffect(() => {
      if (errorMessage) {
        const timer = setTimeout(() => setErrorMessage(null), 4000);
        return () => clearTimeout(timer);
      }
    }, [errorMessage]);
  
    const mutation = useMutation({
      mutationFn: paymentInitiate,
      onSuccess: (data) => {
        const { reference, authorization_url } = data.data;
        setRef(reference);
        setSuccessMessage("Payment initiated");
        console.log(authorization_url)
        if (authorization_url && reference) {
          router.push({
            pathname: "/paystackViewLayout",
            params: { url: authorization_url, reference },
          });
        }
      },
      onError: (error: any) => {
        let msg = "An unexpected error occurred";
        if (error?.response?.data) {
          msg =
            error.response.data.message ||
            error.response.data.error ||
            JSON.stringify(error.response.data);
        } else if (error?.message) {
          msg = error.message;
        }
        setErrorMessage(msg);
        console.error(msg);
      },
    });

    const mutationWallet = useMutation({
      mutationFn: walletDebitFn,
      onSuccess: (data) => {
        if(data){
          setSuccessMessage("Payment Successfull");
          router.push('/paymentSuccess')
        }
     
      },
      onError: (error: any) => {
        let msg = "An unexpected error occurred";
        if (error?.response?.data) {
          msg =
            error.response.data.message ||
            error.response.data.error ||
            JSON.stringify(error.response.data);
        } else if (error?.message) {
          msg = error.message;
        }
        setErrorMessage(msg);
        console.error(msg);
      },
    });

  
    const handleSubmit= () => {
      if(paymentMethod==="instant"){
        const payload={amount:total,description:"Job Payment",jobId:Number(jobId)}
        mutation.mutate(payload);
    }
    else{
      setshowmodal(!showmodal)

    }
    
    };
    const handlepay=(pin:any)=>{
      const data={
        "amount": total,
        "pin": pin,
        "reason": "job payment",
        "jobId": parseInt(jobId as string)
    }
    mutationWallet.mutate(data)
   

    
  }
  return (
    <>
     {successMessage && (
                        <AlertMessageBanner type="success" message={successMessage} />
                      )}
                      {errorMessage && (
                        <AlertMessageBanner type="error" message={errorMessage} />
                      )}
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
            onPress={() => setPaymentMethod("instant")}
            className={`px-4 py-2 rounded-lg border ${
              paymentMethod === "instant" ? "bg-green-500" : selectioncardColor
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
isLoading={mutationWallet.isPending || mutation.isPending}

onPress={() => {
    // Handle payment submission here
    console.log("Submitting payment for job", jobId);
    console.log("Total:", total);
    console.log("Method:", paymentMethod);
    handleSubmit();
  }}
              />
    </View>
    </ContainerTemplate>
    <SliderModalNoScrollview showmodal={showmodal} modalHeight={'80%'} setshowmodal={setshowmodal}>
        <PinModal mode={"transaction"} onComplete={(pin: string) =>  handlepay(pin)} onClose={() => setshowmodal(!showmodal)} visible={showmodal}/>
    </SliderModalNoScrollview>
    </>
  );
};

export default PaymentScreen;
