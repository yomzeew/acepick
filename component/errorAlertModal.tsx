import { useTheme } from "hooks/useTheme"
import { ReactNode } from "react"
import { View } from "react-native"
import { getColors } from "static/color"

interface ErrorAlertModalProps {
children:ReactNode
bg?:string
}
export const ErrorAlertModal=({children,bg="red"}:ErrorAlertModalProps)=>{
    const {theme}=useTheme()
    const {backgroundColor}=getColors(theme)
    return(
        <>
       <View style={{backgroundColor:bg}} className=" py-3 flex-1 h-full justify-center w-full px-3">
         {children} 
       </View>
        </>
    )
}
