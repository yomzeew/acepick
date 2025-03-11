import React, { useState } from "react";
import {
    ScrollView,
    View,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from "react-native";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import { ThemeText } from "component/ThemeText";
import { useLocalSearchParams } from "expo-router";
import { Textstyles } from "static/textFontsize";
import HeaderComponent from "../profilePages/headerComp";
import EmptyView from "component/emptyview";
import CardModal from "./cardModal";
import ButtonFunction from "component/buttonfunction";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import Divider from "component/divider";
import InputComponent from "component/controls/textinput";

const CardPaymentComp = () => {
    const { amount } = useLocalSearchParams();
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const cards: number[] = [1, 2, 3, 4, 5];
    const { theme } = useTheme();
    const { primaryColor, backgroundColor, backgroundColortwo, secondaryTextColor } = getColors(theme);

    return (
        <ContainerTemplate>
            <HeaderComponent title="Cards Payment" />
            <EmptyView height={10} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >


                        {/* Card Selection */}
                        <View className="w-full">
                            <ScrollView className="gap-4" horizontal showsHorizontalScrollIndicator={false}>
                                {cards.map((item, index: number) => (
                                    <View key={index} className="w-[80vw] mr-3">
                                        <CardModal
                                            selected={selectedIndex === index}
                                            onSelect={() => setSelectedIndex(index)}
                                            index={index + 1}
                                        />
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                        <EmptyView height={30} />
                        {/* Add New Cards */}
                        <View className="w-full items-center">
                            <ThemeText size={Textstyles.text_cmedium}>
                                Add new cards
                            </ThemeText>
                            <Divider />
                            <EmptyView height={10} />

                            {/* Card Input Fields */}
                            <InputComponent
                                color={primaryColor}
                                placeholder="Enter Card Number"
                                placeholdercolor={secondaryTextColor}
                            />
                            <EmptyView height={10} />
                            <View className="flex-row justify-between w-full items-center">
                                <View className="w-1/2 items-center">
                                    <InputComponent
                                        color={primaryColor}
                                        placeholder="Expired Date"
                                        placeholdercolor={secondaryTextColor}
                                    />
                                </View>
                                <View className="w-1/3 items-center">
                                    <InputComponent
                                        color={primaryColor}
                                        placeholder="CVV2"
                                        placeholdercolor={secondaryTextColor}
                                    />
                                </View>
                            </View>

                            <EmptyView height={20} />

                            {/* Add Card Button */}
                            <View className="px-3 w-full">
                                <ButtonFunction
                                    onPress={() => console.log('ok')}
                                    textcolor="#ffffff"
                                    color={primaryColor}
                                    text="Make payment 20000"
                                />
                            </View>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </ContainerTemplate>
    );
};

export default CardPaymentComp;
