import OrderProductDetails from "component/marketPlace/orderProductdetails"
import { useLocalSearchParams } from "expo-router"

const OrderProductDetailsPage=()=>{
    const { id } = useLocalSearchParams()
    return(
        <>
        <OrderProductDetails id={id}/>
        </>
    )
}
export default OrderProductDetailsPage