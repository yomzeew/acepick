    import { View } from "react-native"
    import { AntDesign } from "@expo/vector-icons"
import { defaults } from "autoprefixer"
    const RatingStar=({numberOfStars}:{numberOfStars:number})=>{
        const remainStar=5-numberOfStars
        return(
            <>
                 <View className="flex-row">
                        {Array.from({ length: numberOfStars }).map((_, index) => (
                            <AntDesign color="gold" key={index} name="star" />
                        ))}
                           {Array.from({ length:remainStar  }).map((_, index) => (
                            <AntDesign color="gold" key={index} name="staro" />
                        ))}
  </View>
            </>
        )

     }
     export default RatingStar
