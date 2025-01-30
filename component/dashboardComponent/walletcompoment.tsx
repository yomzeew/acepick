import { ImageBackground, Text, TouchableOpacity, View } from "react-native"
import { Textstyles } from "../../static/textFontsize"
import { FontAwesome5 } from "@expo/vector-icons"
import { useState } from "react"

const WalletCard = () => {
    const [hide, setshowhide] = useState<boolean>(false)
    const handleshow = () => {
        setshowhide(!hide)
    }
    return (
        <>
            <ImageBackground resizeMode="contain" source={require('../../assets/walletcard.png')} className="w-full h-24 justify-between items-center px-3 flex-row">
                <View>
                    <Text style={[Textstyles.text_medium, { color: '#ffffff' }]}>
                        {hide ? '₦20,000' : '******'}
                    </Text>
                    <TouchableOpacity>
                        <Text style={[Textstyles.text_xsma, { color: '#ffffff' }]}>
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