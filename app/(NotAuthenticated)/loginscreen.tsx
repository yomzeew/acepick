import { View } from "react-native"
import LoginPage from "@pages/auth/login"
const loginScreen=()=>{
    return(
        <>
        <View className="flex-1">
           <LoginPage/>
        </View>
        </>
    )
}
export default loginScreen