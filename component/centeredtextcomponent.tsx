import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { AntDesign } from '@expo/vector-icons'
const CenteredTextComponent = ({textcolor, text} : {text: any, textcolor : any}) => {
    const router = useRouter()
  return (
<View>
<Text style={{ color: textcolor }} className="text-3xl font-bold text-center">
 {text}
</Text>
</View>
  )
}

export default CenteredTextComponent

