import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import EmptyView from "component/emptyview"
import WalletCard from "component/dashboardComponent/walletcompoment"
import { TouchableOpacity, View } from "react-native"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { AntDesign, FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import SliderModalTemplate, { SliderModalNoScrollview } from "component/slideupModalTemplate"
import { useEffect, useState } from "react"
import PaymentmethodModal from "./paymentModal"
import PinModal from "component/pinModal"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { Wallet } from "type"
import { AlertMessageBanner } from "component/AlertMessageBanner"
import { resetPinFn, setPinFn, walletView } from "services/userService"
import { useMutation } from "@tanstack/react-query"
import { useDelay } from "hooks/useDelay"
import BankDetails, { BankDetailsCard } from "./bankdetails"
import TransferFund from "./transferfund"


const WalletPay=()=>{
    const role=useSelector((state:RootState)=>state.auth.user?.role)
    const wallet: Wallet | null = useSelector((state: RootState) => state?.auth.user?.wallet) ?? null;
    const [showmodal, setshowmodal]=useState<boolean>(false)
    const [showmodalPin, setshowmodalPin]=useState<boolean>(false)
    const [showmodalbankdetails, setshowmodalbankdetails]=useState<boolean>(false)
    const [showmodalwithdraw, setshowmodalwithdraw]=useState<boolean>(false)
    const [pinMode,setpinMode]=useState <'reset' | 'update'>('reset')
    const [pin,setPin]=useState('')
    const [resetPin,setResetpin]=useState("")
    const { theme } = useTheme();
    const[checkpin,setCheckpin]=useState<boolean>(!!wallet?.pin)
    const { primaryColor,selectioncardColor,secondaryTextColor } = getColors(theme);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [shouldProceed, setShouldProceed] = useState<boolean>(false);
  
  
    useEffect(() => {
      if (errorMessage) {
        const timer = setTimeout(() => {
          setErrorMessage(null);
        }, 4000);
        return () => clearTimeout(timer); // Cleanup on unmount or on new error
      }
    }, [errorMessage])
  
  
    useEffect(() => {
      if (successMessage) {
        const timer = setTimeout(() => {
          setSuccessMessage(null);
        }, 4000);
        return () => clearTimeout(timer); // Cleanup on unmount or on new error
      }
    }, [successMessage])
  
  
     useDelay(() => {
        if (shouldProceed) {
          setshowmodal(false)
        }
      }, 2000, [shouldProceed]);
    
  
    const mutationNewpin = useMutation({
      mutationFn:setPinFn ,
      onSuccess: (data) => {
        setSuccessMessage('New Set Successful')
          setShouldProceed(true)
      },
      onError: (error: any) => {
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          "An unexpected error occurred";
        setErrorMessage(msg);
        console.error("Login failed:", msg);
      },
    });

    const onCompleteNew  = (pin:string) => {
        const data={pin}
        mutationNewpin.mutate(data)
    
      }
   
    const mutationReset = useMutation({
        mutationFn: resetPinFn,
        onSuccess: (data) => {
          if(data){
            setSuccessMessage('Pin Reset Successful')
          }else{
            setErrorMessage("Old pin does not match");

          }
         
        },
        onError: (error: any) => {
            const msg =
              error?.response?.data?.message ||
              error?.message ||
              "An unexpected error occurred";
            setErrorMessage(msg);
            console.error("failed:", msg);
          }
      });
    const onCompleteReset = (payload:any) => {
        if (typeof payload === "object" && payload.oldPin && payload.newPin) {
            mutationReset.mutate(payload);
          } else {
            setErrorMessage("Invalid PIN input");
          }
    
      }
       


const handleShowModal=(modeValue:'reset' | 'update')=>{
    setpinMode(modeValue)
    setshowmodalPin(!showmodalPin)
}

    return(
        <>
        {successMessage && (
                <AlertMessageBanner type="success" message={successMessage} />
              )}
              {errorMessage && (
                <AlertMessageBanner type="error" message={errorMessage} />
              )}
        {showmodal &&
        <SliderModalTemplate modalHeight={'60%'} showmodal={showmodal} setshowmodal={setshowmodal} >
            <PaymentmethodModal 
            setSuccessMessage={function (value: any): void {
                        throw new Error("Function not implemented.")
                    } } 
                    setErrorMessage={function (value: any): void {
                        throw new Error("Function not implemented.")
                    } } errorMessage={""} 
                    successMessage={""}/>
        </SliderModalTemplate>}
        <ContainerTemplate>
                <HeaderComponent title="Wallet and payments" />
                <EmptyView height={10} />

                <WalletCard showmodal={showmodal} setshowmodal={setshowmodal}/>

                <EmptyView height={20}/>
                <View   style={{ backgroundColor: selectioncardColor, elevation: 4 }}
            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 pb-5">

                <TouchableOpacity onPress={()=>setshowmodalwithdraw(!showmodalwithdraw)}  className="flex-row justify-between items-center h-20 border-b border-slate-400">
                    <View className="flex-row gap-x-2 items-center">
                    <Ionicons name="remove-circle" color="red" size={16}/>
                    <ThemeTextsecond size={Textstyles.text_xmedium}>Withdraw Money</ThemeTextsecond>
                    </View>
                <AntDesign name="right" size={24} color={secondaryTextColor} />
                </TouchableOpacity>
                
               {!checkpin?<TouchableOpacity onPress={()=>handleShowModal("update")}  className="flex-row justify-between items-center h-20 border-b border-slate-400">
                    <View className="flex-row gap-x-2 items-center">
                    <FontAwesome5 name="lock" color={primaryColor} size={16}/>
                    <ThemeTextsecond size={Textstyles.text_xmedium}>Create Transaction Pin</ThemeTextsecond>
                    </View>
                <AntDesign name="right" size={24} color={secondaryTextColor} />
                </TouchableOpacity>:
                <TouchableOpacity onPress={()=>handleShowModal("reset")}  className="flex-row justify-between items-center h-20 border-b border-slate-400">
                <View className="flex-row gap-x-2 items-center">
                <FontAwesome5 name="lock" color={primaryColor} size={16}/>
                <ThemeTextsecond size={Textstyles.text_xmedium}>Reset Transaction Pin</ThemeTextsecond>
                </View>
            <AntDesign name="right" size={24} color={secondaryTextColor} />
            </TouchableOpacity>
                }
                 <TouchableOpacity onPress={()=>setshowmodalbankdetails(!showmodalbankdetails)}  className="flex-row justify-between items-center h-20 border-b border-slate-400">
                    <View className="flex-row gap-x-2 items-center">
                    <Ionicons name="remove-circle" color="red" size={16}/>
                    <ThemeTextsecond size={Textstyles.text_xmedium}>Add Banks Details</ThemeTextsecond>
                    </View>
                <AntDesign name="right" size={24} color={secondaryTextColor} />
                </TouchableOpacity>
               
                
                
            </View>
            <EmptyView height={10} />
            <View className="flex-1">
            <BankDetailsCard showmodal={showmodalbankdetails}/>

            </View>
            
                

             
            
            </ContainerTemplate>
             <SliderModalNoScrollview showmodal={showmodalPin} modalHeight={'80%'} setshowmodal={setshowmodalPin}>
                   {pinMode==="update" && 
                   <PinModal 
                    mode={"update"} 
                    onComplete={
                        
                        (value: string) =>{ 
                            onCompleteNew(value)
                            setPin(value)
                        }
                        } 
                        onClose={() => setshowmodal(!showmodal)} 
                        visible={showmodal}
                        />}
                        {pinMode==="reset" &&  
                        <PinModal 
                         mode={"reset"} 
                         onComplete={(payload) => {
                            if (typeof payload === 'object') {
                            const { oldPin, newPin }:any = payload;
                            onCompleteReset(payload)
                            console.log("Old:", oldPin, "New:", newPin);
                            // const { oldPin, newPin }:any = setResetpin(payload); 
                            }
                          }}
                        onClose={() => setshowmodal(!showmodal)} 
                        visible={showmodal}
                        />}
             
                </SliderModalNoScrollview>
                <SliderModalNoScrollview showmodal={showmodalbankdetails} modalHeight={'80%'} setshowmodal={setshowmodalbankdetails}>
                  <BankDetails
                  setshowmodal={setshowmodalbankdetails}
                  />
                </SliderModalNoScrollview>
                <SliderModalNoScrollview showmodal={showmodalwithdraw} modalHeight={'80%'} setshowmodal={setshowmodalwithdraw}>
                    <TransferFund 
                    setshowmodal={setshowmodalwithdraw}
                />
                </SliderModalNoScrollview>
                
        
        </>
    )
}
export default WalletPay