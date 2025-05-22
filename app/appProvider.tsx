import { ReactNode } from "react"
import { Provider } from "react-redux"
import '../global.css'
import store from "../redux/store"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoleProvider } from "context/roleContext"

const AppProvider=({children}:{children:ReactNode})=>{

const queryClient = new QueryClient();

    return(
       <RoleProvider>
          <Provider store={store}>
             <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView>
            {children}
            </GestureHandlerRootView>
            </QueryClientProvider>
        </Provider>
       </RoleProvider>
    )
}
export default AppProvider