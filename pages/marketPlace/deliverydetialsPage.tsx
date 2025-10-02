import DeliveryDetails from "component/marketPlace/deliverydetails"
import {Text} from "react-native"
interface DeliveryDetailsProps{
    productId:number
}
const DeliveryDetailPage=({productId}:DeliveryDetailsProps)=>{
    return(
        <>
        <DeliveryDetails productId={productId} />
        </>
        
    )
}
export default DeliveryDetailPage