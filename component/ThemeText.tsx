import { ReactNode } from "react"
import { Text } from "react-native"
import { useTheme } from "../hooks/useTheme"
import { getColors } from "../static/color";

export const ThemeText=({children,size,type='',className=""}:{children:ReactNode,size:any,type?:string,className?:string})=>{
    const { theme } = useTheme(); // Theme state and toggle function
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
    return(
        <>
        <Text 
        style={[size,{color:type==='secondary'?secondaryTextColor:primaryTextColor}]}
        className={className}
        >
        {children}
        </Text>
       
        </>
    )
}
export const ThemeTextsecond=({children,size}:{children:ReactNode,size:any})=>{
    const { theme } = useTheme(); // Theme state and toggle function
  const { textColor } = getColors(theme);
    return(
        <>
        <Text 
        style={[size,{color:textColor}]}
        >
        {children}
        </Text>
       
        </>
    )
}
