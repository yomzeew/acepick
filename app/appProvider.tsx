import { ReactNode } from "react"
import { Provider } from "react-redux"
import '../global.css'
import store from "../redux/store"

const AppProvider=({children}:{children:ReactNode})=>{
    return(
        <Provider store={store}>
             {children}
        </Provider>
       

    )
}
export default AppProvider