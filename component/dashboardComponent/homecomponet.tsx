import { View, ScrollView, TouchableOpacity } from "react-native"
import HeaderComponent from "./headercomponent"
import { useTheme } from "../../hooks/useTheme";
import { getColors } from "../../static/color";
import ContainerTemplate from "./containerTemplate";
import WalletCard from "./walletcompoment";
import EmptyView from "../emptyview";
import FilterCard from "./filterCard";
import { ThemeText } from "../ThemeText";
import { Textstyles } from "../../static/textFontsize";
import ProfessionalCard from "./professionalCard";
import { useState } from "react";
import SliderModalTemplate, { SliderModalNoScrollview } from "component/slideupModalTemplate";
import PaymentmethodModal from "component/menuComponent/walletPages/paymentmethodModal";
import { useRouter } from "expo-router";
import JobCard from "component/jobs/jobsCard";
import ListofAPmodal from "./listofA&Pmodal";
import { FontAwesome5 } from "@expo/vector-icons";

const HomeComp = () => {
    const router=useRouter()
    const [showmodal,setshowmodal]=useState<boolean>(false)
    const [showprofession,setshowprofession]=useState(false)
    const { theme } = useTheme(); // Theme state and toggle function
    const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);

    const handlenavcategory=(value:string)=>{
        router.push(`/category/${value}`)

    }

    return (
        <>  
        {showmodal &&<SliderModalTemplate modalHeight={'60%'} showmodal={showmodal} setshowmodal={setshowmodal} >
        <PaymentmethodModal/>
    </SliderModalTemplate>
    }
    {showprofession &&
    <SliderModalNoScrollview
    modalHeight={'80%'} 
    showmodal={showprofession} 
    setshowmodal={setshowprofession}
    >
        <>
        <View className="w-full items-end px-3 py-3">
        <TouchableOpacity onPress={()=>setshowprofession(!showprofession)}>
        <FontAwesome5 name="times-circle" size={20} color="red" />
        </TouchableOpacity>
        </View>
        <ListofAPmodal/>
        </>
     
        </SliderModalNoScrollview>}
            <ContainerTemplate>
                <HeaderComponent />
                <EmptyView height={20} />
                <WalletCard setshowmodal={setshowmodal} showmodal={showmodal} />
                <EmptyView height={20} />
                <FilterCard 
                showprofession={showprofession} 
                setshowprofession={setshowprofession}
                />
                <EmptyView height={20} />
                <ThemeText size={Textstyles.text_medium} type="secondary">
                    Professional
                </ThemeText>
                <View className="flex-1  pb-5">
                    <ScrollView contentContainerStyle={{paddingBottom:60,paddingTop:20}} showsVerticalScrollIndicator={false}>
                        <TouchableOpacity onPress={()=>handlenavcategory('Contruction and Builders')}>
                        <ProfessionalCard
                        profession="Contruction and Builders"
                        totalnumber={30}
                        totaluser={635}
                         />
                        </TouchableOpacity>
                        <EmptyView height={10} />
                        <TouchableOpacity onPress={()=>handlenavcategory('Health and Medical')}>
                        <ProfessionalCard 
                         profession="Health and Medical"
                         totalnumber={30}
                         totaluser={635}
                        />
                        </TouchableOpacity>
                        <EmptyView height={10} />
                        <TouchableOpacity onPress={()=>handlenavcategory('Information and Technology')}>
                        <ProfessionalCard
                         profession="Information and Technology"
                         totalnumber={30}
                         totaluser={635}
                         />

                        </TouchableOpacity>
                        
                        <EmptyView height={10} />
                        <TouchableOpacity onPress={()=>handlenavcategory('Education and Tutoring')}>
                        <ProfessionalCard
                         profession="Education and Tutoring"
                         totalnumber={30}
                         totaluser={635}
                         />
                        </TouchableOpacity>
                         <EmptyView height={10} />
                         <TouchableOpacity onPress={()=>handlenavcategory('Art and Entertainment')}>
                         <ProfessionalCard
                         profession="Art and Entertainment"
                         totalnumber={30}
                         totaluser={635}
                         />

                         </TouchableOpacity>
                        

                    </ScrollView>

                </View>



            </ContainerTemplate>
        </>
    )
}
export default HomeComp