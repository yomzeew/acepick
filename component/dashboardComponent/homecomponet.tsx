import { View, ScrollView } from "react-native"
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

const HomeComp = () => {
    const [showmodal,setshowmodal]=useState<boolean>(false)
    const { theme } = useTheme(); // Theme state and toggle function
    const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);

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
                        <ProfessionalCard
                        profession="Contruction and Builders"
                        totalnumber={30}
                        totaluser={635}
                         />
                        
                        <EmptyView height={10} />
                        <ProfessionalCard 
                         profession="Health and Medical"
                         totalnumber={30}
                         totaluser={635}
                        />
                        <EmptyView height={10} />
                        <ProfessionalCard
                         profession="Information and Technology"
                         totalnumber={30}
                         totaluser={635}
                         />
                        <EmptyView height={10} />
                        <ProfessionalCard
                         profession="Education and Tutoring"
                         totalnumber={30}
                         totaluser={635}
                         />
                         <EmptyView height={10} />
                        <ProfessionalCard
                         profession="Art and Entertainment"
                         totalnumber={30}
                         totaluser={635}
                         />

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