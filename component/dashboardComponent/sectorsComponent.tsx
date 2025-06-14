import { ScrollView, TouchableOpacity, View } from "react-native"
import ProfessionalCard from "./professionalCard"
import EmptyView from "component/emptyview"
import { useRouter } from "expo-router"
import { useMutation } from "@tanstack/react-query"
import { ListofSectors } from "services/listProfessionServices"
import { useEffect, useState } from "react"
import SectorSkeletonCard from "component/sectorSkeletonCard"
import { ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { getSectorByUser } from "services/userService"

interface SectorsComponentProps{
    setErrorMessage:(value:string)=>void
}
const SectorsComponent=({setErrorMessage}:SectorsComponentProps)=>{
    const [data,setData]=useState<any[]>([])
     const router=useRouter()

     const token:string=useSelector((state:RootState)=>(state.auth?.token)?? "") 
     const mutation = useMutation({
        mutationFn:getSectorByUser,
        onSuccess:async (dataResponse) => {
            setData(dataResponse.data)
            
        
        },
        onError: (error: any) => {
          let msg = "An unexpected error occurred";
        
          if (error?.response?.data) {
            // Try multiple common formats
            msg =
              error.response.data.message ||         // Common single message
              error.response.data.error ||           // Alternative key
              JSON.stringify(error.response.data);   // Fallback: dump full error object
          } else if (error?.message) {
            msg = error.message;
          }
        
          setErrorMessage(msg);
          console.error("List of sectors fetch failed:", msg);
        },
      });
    
      // fetch sectors on mount
      useEffect(() => {
        mutation.mutate(token);
      }, []);

    const handlenavcategory=(value:string)=>{
        router.push(`/category/${value}`)

    }
    return(
        <>
 <View className="flex-1 pb-5">
    <ScrollView
      contentContainerStyle={{ paddingBottom: 60, paddingTop: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {mutation.isPending ? (
        // show 4 skeletons while loading
        <>
          {[1, 2, 3, 4].map((_, index) => (
            <SectorSkeletonCard key={index} />
          ))}
        </>
      ) : data.length > 0 ? (
        data.map((item, index) => (
          <View key={index}>
            <TouchableOpacity
              onPress={() => handlenavcategory(item?.title || "Unknown")}
            >
              <ProfessionalCard
                profession={item?.title || "Unknown"}
                numOfProf={item?.numOfProf || 0 }
                numOfJobs={item?.numOfJobs || 0}
              
              />
            </TouchableOpacity>
            <EmptyView height={10} />
          </View>
        ))
      ) : (
        <ThemeTextsecond size={Textstyles.text_cmedium}>
            No Record
        </ThemeTextsecond>
      )}
    </ScrollView>
  </View>
        </>
    )
}
export default SectorsComponent