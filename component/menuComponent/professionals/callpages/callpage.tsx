import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import { ImageBackground } from "react-native"

 const Call=()=>{
    return(
        <>
        <ContainerTemplate>
            <ImageBackground className="h-full w-full" source={require('../../../../assets/callbg.png')}>

            </ImageBackground>
        </ContainerTemplate>
        </>
    )
 }
 export default Call