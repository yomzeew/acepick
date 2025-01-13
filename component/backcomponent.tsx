import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { AntDesign } from '@expo/vector-icons'
const BackComponent = ({bordercolor, textcolor} : {bordercolor: any, textcolor : any}) => {
    const router = useRouter()
  return (
<View>
        <TouchableOpacity style={{ borderColor: bordercolor }} className="absolute left-3 border border-buttonGray rounded-xl p-2" onPress={()=>router.back()}>
          <AntDesign name="left" size={20} color={textcolor} />
        </TouchableOpacity>
      </View>
  )
}

export default BackComponent
