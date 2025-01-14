import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { Textstyles } from '../static/textFontsize'
const CenteredTextComponent = ({textcolor, text} : {text: any, textcolor : any}) => {
    const router = useRouter()
  return (
<View>
<Text style={[Textstyles.text_medium,{ color:textcolor }]} className="font-bold text-center">
 {text}
</Text>
</View>
  )
}

export default CenteredTextComponent

