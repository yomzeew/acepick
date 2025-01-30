import { useState } from "react";
import { Image, ScrollView, View, Dimensions } from "react-native";
import ContainerTemplate from "../../dashboardComponent/containerTemplate";
import BackComponent from "../../backcomponent";
import { getColors } from "../../../static/color";
import { useTheme } from "../../../hooks/useTheme";
import { ThemeText, ThemeTextsecond } from "../../ThemeText";
import { Textstyles } from "../../../static/textFontsize";
import EmptyView from "component/emptyview";
import RatingStar from "component/rating";

const { height } = Dimensions.get("window");

const ReviewComponent = () => {
    const { theme } = useTheme();
    const { primaryColor } = getColors(theme);
    const [currentPage, setCurrentPage] = useState(0);

    const handleScroll = (event:any) => {
        const scrollPosition = event.nativeEvent.contentOffset.y;
        const pageIndex = Math.round(scrollPosition / height);
        setCurrentPage(pageIndex);
    };

    return (
        <ContainerTemplate>
            <View className="pt-10">
                <BackComponent bordercolor={primaryColor} textcolor={primaryColor} />
            </View>
            <View className="px-3 mt-12">
                <ThemeText type="primary" size={Textstyles.text_medium}>
                    Ratings and Reviews
                </ThemeText>
            </View>
            <View className="flex-1 mt-3 pb-10">
                <ScrollView
                    pagingEnabled
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 50, paddingTop: 10 }}
                    onMomentumScrollEnd={handleScroll}
                >
                    <ReviewCard />
                    <ReviewCard />
                    <ReviewCard />
                    <ReviewCard />
                    <ReviewCard />
                    <ReviewCard />
                    <ReviewCard />
                    <ReviewCard />
                    <ReviewCard />
                    <ReviewCard />
                </ScrollView>

                {/* Pagination Dots */}
                <View className="flex-row justify-center mt-4">
                    {[0, 1, 2, 3, 4].map((index) => (
                        <View
                            key={index}
                            className={`w-2.5 h-2.5 mx-1 rounded-full ${
                                currentPage === index ? "bg-blue-500" : "bg-gray-300"
                            }`}
                        />
                    ))}
                </View>
            </View>
        </ContainerTemplate>
    );
};

export default ReviewComponent;

export const ReviewCard = () => {
    const { theme } = useTheme();
    const { primaryColor, selectioncardColor } = getColors(theme);

    return (
        <View
            style={{ backgroundColor: selectioncardColor, elevation: 4 }}
            className="w-full h-[10%] rounded-2xl shadow-slate-500 shadow-sm px-5 py-3 mt-3"
        >
            <View className="flex-row items-center gap-x-2">
                <Image className="w-12 h-12 rounded-full" source={require("../../../assets/demo.jpg")} />
                <ThemeText type="primary" size={Textstyles.text_cmedium}>Akeem Olayemi</ThemeText>
            </View>
            <View className="mt-3">
                <ThemeTextsecond size={Textstyles.text_xsma}>
                    Adewale is a true electrical wizard! Efficient, knowledgeable, and always professional.
                    They fixed our electrical issues in no time. Highly recommend!
                </ThemeTextsecond>
            </View>
            <View className="border-b border-slate-500 h-1 mt-3"/>
            <EmptyView height={5} />
            <View className="flex-row justify-between">
            <RatingStar numberOfStars={3} />
            <ThemeTextsecond size={Textstyles.text_xsma}>
                Feb 20
            </ThemeTextsecond>
            </View>
        </View>
    );
};
