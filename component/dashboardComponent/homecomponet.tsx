import { View, Text, ScrollView } from "react-native"
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
import FooterComponent from "./footerComponent";

const HomeComp = () => {
    const { theme } = useTheme(); // Theme state and toggle function
    const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);

    return (
        <>
            <ContainerTemplate>
                <HeaderComponent />
                <EmptyView height={10} />
                <WalletCard />
                <EmptyView height={10} />
                <FilterCard />
                <EmptyView height={10} />
                <ThemeText size={Textstyles.text_medium} type="secondary">
                    Professional
                </ThemeText>
                <EmptyView height={10} />
                <View className="flex-1  pb-5">
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <ProfessionalCard />
                        <EmptyView height={10} />
                        <ProfessionalCard />
                        <EmptyView height={10} />
                        <ProfessionalCard />
                        <EmptyView height={10} />
                        <ProfessionalCard />
                        <EmptyView height={10} />
                        <ProfessionalCard />

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