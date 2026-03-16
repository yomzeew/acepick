import { ScrollView } from "react-native"
import ProfilePage from "@pages/dashboard/profile"
const Profilelayout=()=>{
   return(
    <>
    <ScrollView 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      <ProfilePage/>
    </ScrollView>
    </>
   ) 
}
export default Profilelayout
