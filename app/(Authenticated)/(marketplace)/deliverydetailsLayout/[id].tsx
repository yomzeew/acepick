
//import DeliveryDetails from "../../../../component/marketPlace/deliverydetails"; // adjust path
import DeliveryDetailPage from '@pages/marketPlace/deliverydetialsPage';
import { useLocalSearchParams } from 'expo-router';


export default function DeliveryDetailLayout() {
  const { id } = useLocalSearchParams();
  
  return (
    
        <DeliveryDetailPage productId={Number(id)}/>

   

  )
}

