import { Text, View } from "react-native"
import { useTheme } from "../../hooks/useTheme";

const LoginPage=()=>{
    

    const { theme } = useTheme();
    <>

    <View className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} flex-1 items-center justify-center`}>
    <Text className="text-red-600">
        login
    </Text>

    </View>
    
    </>
}
export default LoginPage