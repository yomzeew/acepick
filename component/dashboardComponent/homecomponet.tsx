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
import SliderModalTemplate from "component/slideupModalTemplate";
import PaymentmethodModal from "component/menuComponent/walletPages/paymentmethodModal";
import { useRouter } from "expo-router";

const HomeComp = () => {
    const router=useRouter()
    const [showmodal,setshowmodal]=useState<boolean>(false)
    const { theme } = useTheme(); // Theme state and toggle function
    const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);

    const handlenavcategory=(value:string)=>{
        router.push(`/category/${value}`)

    }

    return (
        <>  
        {showmodal &&<SliderModalTemplate modalHeight={'60%'} showmodal={showmodal} setshowmodal={setshowmodal} >
        <PaymentmethodModal/>
    </SliderModalTemplate>}
            <ContainerTemplate>
                <HeaderComponent />
                <EmptyView height={10} />
                <WalletCard setshowmodal={setshowmodal} showmodal={showmodal} />
                <EmptyView height={10} />
                <FilterCard />
                <EmptyView height={10} />
                <ThemeText size={Textstyles.text_medium} type="secondary">
                    Professional
                </ThemeText>
                <EmptyView height={10} />
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
                {/* <View className=" items-center w-full">
                   <FooterComponent/>
                </View> */}



            </ContainerTemplate>
        </>
    )
}
export default HomeComp