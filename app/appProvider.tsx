import { ReactNode } from "react"
import { Provider } from "react-redux"
import '../global.css'
import store from "../redux/store"
import { GestureHandlerRootView } from "react-native-gesture-handler"

const AppProvider=({children}:{children:ReactNode})=>{
    return(
        <Provider store={store}>
            <GestureHandlerRootView>
            {children}
            </GestureHandlerRootView>
        </Provider>
       

    )
}
export default AppProvider