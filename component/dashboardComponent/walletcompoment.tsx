import { ImageBackground, Text, TouchableOpacity, View } from "react-native"
import { Textstyles } from "../../static/textFontsize"
import { FontAwesome5 } from "@expo/vector-icons"
import { useState } from "react"

interface WalletCard{
    setshowmodal:(value:boolean)=>void
    showmodal:boolean
}
const WalletCard = ({setshowmodal,showmodal}:WalletCard) => {
    const [hide, setshowhide] = useState<boolean>(false)
    const handleshow = () => {
        setshowhide(!hide)
    }
    const handleshowfundWallet=()=>{
        setshowmodal(!showmodal)
    }
    return (
        <>
            <ImageBackground resizeMode="cover" source={require('../../assets/walletcard.png')} className="w-full h-24 justify-between items-center px-3 flex-row">
                <View>
                    <Text style={[Textstyles.text_medium, { color: '#ffffff' }]}>
                        {hide ? '₦20,000' : '******'}
                    </Text>
                    <TouchableOpacity onPress={handleshowfundWallet} className="bg-white rounded-2xl py-2 px-2">
                        <Text style={[Textstyles.text_xsma, { color: '#33658A' }]}>
                            Fund Wallet
                        </Text>

                    </TouchableOpacity>


                </View>
                <View className="">
                    <TouchableOpacity onPress={handleshow}>
                        <FontAwesome5 color="#ffffff" size={20} name="eye-slash" />
                    </TouchableOpacity>


                </View>
            </ImageBackground>
        </>
    )
}
export default WalletCard