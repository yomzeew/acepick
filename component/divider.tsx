import { useTheme } from 'hooks/useTheme'
import { View } from 'react-native'

const Divider = () => {
  const {theme}=useTheme()
  return (
    <View className={`w-full border-b ${theme==='dark'?'border-b-slate-600':'border-b-slate-200'}`} />
  )
}

export default Divider