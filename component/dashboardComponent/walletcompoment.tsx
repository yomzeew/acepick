import { ImageBackground, Text, TouchableOpacity, View, Pressable } from "react-native"
import { Textstyles } from "../../static/textFontsize"
import { FontAwesome5 } from "@expo/vector-icons"
import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../../redux/store"
import { Wallet } from "../../types/type"
import { formatAmount, formatNaira } from "../../utilizes/amountFormat"
import { useRouter } from "expo-router"
import { fetchTransactionsAsync } from "../../redux/slices/walletSlice"

interface WalletCardProps {
    setshowmodal: (value: boolean) => void;
    showmodal: boolean;
    refreshTrigger?: boolean;
    setshowwithdraw?: (value: boolean) => void;
    showwithdraw?: boolean;
  }
  
  const WalletCard = ({ setshowmodal, showmodal, refreshTrigger, setshowwithdraw, showwithdraw }: WalletCardProps) => {
    const role = useSelector((state: RootState) => state?.auth.user?.role)
    const wallet: Wallet | null = useSelector((state: RootState) => state?.auth.user?.wallet) ?? null;
    const [hide, setshowhide] = useState<boolean>(false);
    const currentBalance = wallet?.currentBalance || 0;
    const router = useRouter();
    const dispatch = useDispatch();
  
    const handleshow = () => setshowhide(!hide);
    
    const handleshowfundWallet = () => {
        if (role === 'client') {
            setshowmodal(!showmodal);
        } else if (role === 'delivery' || role === 'professional') {
            setshowwithdraw?.(!showwithdraw);
        }
    };
  
    const handleHistoryPress = () => {
        // Pre-fetch transactions when navigating to history
        dispatch(fetchTransactionsAsync() as any);
        router.push('/billhistorylayout');
    };
  
    return (
      <View>
        <ImageBackground
          resizeMode="cover"
          source={require('../../assets/walletcard.png')}
          className="w-full overflow-hidden rounded-2xl"
          imageStyle={{ borderRadius: 16 }}
        >
          <View className="px-5 py-5">
            <View className="flex-row justify-between items-center mb-1">
              <Text style={{ fontFamily: 'TTFirsNeue', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                Available Balance
              </Text>
              <TouchableOpacity onPress={handleshow} className="p-1">
                <FontAwesome5 color="rgba(255,255,255,0.7)" size={16} name={hide ? "eye" : "eye-slash"} />
              </TouchableOpacity>
            </View>
            
            <Text style={[Textstyles.text_medium, { color: '#ffffff', fontSize: 28, lineHeight: 36, marginBottom: 16 }]}>
              {hide ? `${formatAmount(currentBalance)}` : '••••••'}
            </Text>

            <View className="flex-row" style={{ gap: 10 }}>
              <Pressable
                onPress={handleshowfundWallet}
                className="flex-row items-center justify-center rounded-xl py-2.5 px-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <FontAwesome5 name={role === 'client' ? "plus" : "arrow-down"} size={12} color="#fff" />
                <Text style={{ fontFamily: 'TTFirsNeue', fontSize: 13, color: '#ffffff', marginLeft: 6 }}>
                  {role === 'client' ? 'Fund Wallet' : 'Withdraw'}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleHistoryPress}
                className="flex-row items-center justify-center rounded-xl py-2.5 px-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <FontAwesome5 name="history" size={12} color="#fff" />
                <Text style={{ fontFamily: 'TTFirsNeue', fontSize: 13, color: '#ffffff', marginLeft: 6 }}>
                  History
                </Text>
              </Pressable>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  };
  
  export default WalletCard;