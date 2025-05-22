import { useTheme } from "hooks/useTheme"
import { ScrollView, View } from "react-native"
import { getColors } from "static/color"
import { ThemeTextsecond } from "./ThemeText"
import { Textstyles } from "static/textFontsize"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"

const JobStatistics=()=>{
    const user=useSelector((state:RootState)=>state.auth.user)
    const completedJob=user?.profile.totalJobsCompleted || 0
    const jobinProgress=user?.profile.totalJobsOngoing || 0
    const jobinPending=user?.profile.totalJobsPending || 0
    const totalJobsCanceled=user?.profile.totalJobsCanceled || 0


    
    return(
        <>
         <View  className="w-full  mt-2">
                            <ScrollView  horizontal   showsHorizontalScrollIndicator={false}>
                            <View className="flex-row gap-x-4">
                                <Cardcomponent Title={"Completed Jobs"} totalnumber={completedJob} />
                                <Cardcomponent Title={"Jobs in Progress"} totalnumber={jobinProgress} />
                                <Cardcomponent Title={"Pending Jobs"} totalnumber={jobinPending} />
                                <Cardcomponent Title={"Canceled Jobs"} totalnumber={totalJobsCanceled} />
                                {/* <Cardcomponent Title={"Rejected Jobs"} totalnumber={0} /> */}
                                </View>
                               
                            </ScrollView>
                        </View>
        </>
    )
}
export default JobStatistics

const Cardcomponent=({Title,totalnumber}:{Title:string,totalnumber:number})=>{
    const { theme } = useTheme()
    const { primaryTextColor, selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme)
    return(
<View  style={{ backgroundColor: selectioncardColor, elevation: 4 }}  className="w-44 h-24 rounded-2xl px-5 py-3 mt-2 -slate-400 ">
<View className="w-full px-3 justify-center items-center h-full">
    <View>
        <ThemeTextsecond size={Textstyles.text_xsma}>{Title}</ThemeTextsecond>
    </View>
    <View>
        <ThemeTextsecond size={Textstyles.text_xmedium}>{totalnumber}</ThemeTextsecond>
    </View>
    
    </View>


</View>
    )


}