import { View } from 'react-native'
interface EmptyProp{
  height?:number
}
const EmptyView = ({height=38}) => {
  return (
    <View style={{height:height}}></View>
  )
}

export default EmptyView