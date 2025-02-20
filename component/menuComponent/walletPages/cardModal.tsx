import { FontAwesome5 } from "@expo/vector-icons"
import CustomRadioButton from "component/controls/radioComponent"
import EmptyView from "component/emptyview"
import { useState } from "react"
import { View,Text, TouchableOpacity } from "react-native"
import { Textstyles } from "static/textFontsize"

interface CardModalProps{
    index: number;
    selected: boolean;
    onSelect: () => void;
}
const CardModal=({index,selected,onSelect}:CardModalProps)=>{
   
    return(
        <>
        <View style={{backgroundColor:"#33658A"}} className="h-[20vh] rounded-2xl p-5  w-full">
        <View className="flex-row justify-between items-center">
            <CustomRadioButton label={'Select Card '+ index} selected={selected} onPress={onSelect} />
                <TouchableOpacity>
                    <FontAwesome5 name="trash" size={16} color="white" />
                </TouchableOpacity>
            </View>
            <Text style={[Textstyles.text_cmedium]} className="text-white">
                Oluwasuyi's Card
            </Text>
            <EmptyView height={10}/>
            <View className="flex-row justify-between">
                <View>
                <Text style={[Textstyles.text_x16small]} className="text-white">5456644556xxxxxxx</Text>
                <Text style={[Textstyles.text_xsmall]} className="text-white">Expire date</Text>
                <Text style={[Textstyles.text_small]} className="text-white">xxx</Text>

                </View>
                
            <View className="justify-center">
                <Text style={[Textstyles.text_small]} className="text-white">Cv2</Text>
                <Text style={[Textstyles.text_medium]} className="text-white">xxx</Text>
            </View>
            </View>


        </View>
        </>
    )
}
export default CardModal