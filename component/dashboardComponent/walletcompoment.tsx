import { ImageBackground, Text, TouchableOpacity, View } from "react-native"
import { Textstyles } from "../../static/textFontsize"
import { FontAwesome5 } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { Wallet } from "type"
import { useMutation } from "@tanstack/react-query"
import { walletView } from "services/userService"
import { formatAmount, formatNaira } from "utilizes/amountFormat"

interface WalletCardProps {
    setshowmodal: (value: boolean) => void;
    showmodal: boolean;
    refreshTrigger?: boolean; // 👈 Optional prop
  }
  
  const WalletCard = ({ setshowmodal, showmodal, refreshTrigger }: WalletCardProps) => {
    const role=useSelector((state:RootState)=>state.auth.user?.role)
    const wallet: Wallet | null = useSelector((state: RootState) => state?.auth.user?.wallet) ?? null;
    const [hide, setshowhide] = useState<boolean>(false);
    const [currentBalance, setCurrentBalance] = useState<number>(wallet?.currentBalance || 0);
  
    const mutation = useMutation({
      mutationFn: walletView,
      onSuccess: async (response) => {
        setCurrentBalance(response.data?.currentBalance || 0);
      },
      onError: (error: any) => {
        console.error("Wallet fetch failed:", error.message);
      },
    });
  
    useEffect(() => {
      mutation.mutate();
    }, [refreshTrigger]); // 👈 Re-fetch on refreshTrigger change
  
    const handleshow = () => setshowhide(!hide);
    const handleshowfundWallet = () => setshowmodal(!showmodal);
  
    return (
      <ImageBackground
        resizeMode="cover"
        source={require('../../assets/walletcard.png')}
        className="w-full h-24 justify-between items-center px-3 flex-row"
      >
        <View>
          <Text style={[Textstyles.text_medium, { color: '#ffffff' }]}>
            {hide ? `${formatAmount(currentBalance)}` : '******'}
          </Text>
          <TouchableOpacity onPress={handleshowfundWallet} className="bg-white rounded-2xl py-2 px-2 w-24 items-center justify-center">
            <Text style={[Textstyles.text_xsma, { color: '#33658A' }]}>
              {role==='client'?'Fund Wallet':'Withdraw'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleshow}>
          {hide?<FontAwesome5 color="#ffffff" size={20} name="eye" />:<FontAwesome5 color="#ffffff" size={20} name="eye-slash" />}
        </TouchableOpacity>
      </ImageBackground>
    );
  };
  
  export default WalletCard;

  
  