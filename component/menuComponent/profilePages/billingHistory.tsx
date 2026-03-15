import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import EmptyView from "component/emptyview"
import { AntDesign, FontAwesome5 } from "@expo/vector-icons"
import { useState } from "react"
import SliderModalTemplate from "component/slideupModalTemplate"
import SelectComponent from "component/dashboardComponent/selectComponent"
import ButtonFunction from "component/buttonfunction"
import InputComponent from "component/controls/textinput"

const BillingHistory = () => {
    const [showmodal,setshowmodal]=useState<boolean>(false)
    const [value,setValue]=useState<string>('')
    const [fromDate, setFromDate] = useState<string>('')
    const [toDate, setToDate] = useState<string>('')
    const [errors, setErrors] = useState<{[key: string]: string}>({})
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme)
    const data=['Plumber','Construction','Mechanics']

    const validateDateRange = () => {
        const newErrors: {[key: string]: string} = {};
        
        if (!fromDate) {
            newErrors.fromDate = 'From date is required';
        }
        if (!toDate) {
            newErrors.toDate = 'To date is required';
        } else if (fromDate && new Date(toDate) < new Date(fromDate)) {
            newErrors.toDate = 'To date must be after from date';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleFilter = () => {
        if (validateDateRange()) {
            setshowmodal(false)
        }
    }

    const clearFilters = () => {
        setFromDate('')
        setToDate('')
        setValue('')
        setErrors({})
    }
    return (
        <>
         {<SliderModalTemplate showmodal={showmodal} setshowmodal={setshowmodal} modalHeight={'80%'}>
            <View className="p-5">
            <View>
                <ThemeText size={Textstyles.text_medium}>
                    Filter
                </ThemeText>
              <View className="mt-5">
               <ThemeTextsecond size={Textstyles.text_cmedium}>
                    By date range <ThemeTextsecond size={Textstyles.text_xsma}>(Date format: DD-MM-YYYY)</ThemeTextsecond>
                </ThemeTextsecond>
                <View className="w-full gap-x-5 flex-row mt-5">
                <View className="w-1/2">
                    <ThemeTextsecond size={Textstyles.text_xsma}>From:</ThemeTextsecond>
                    <InputComponent 
                        color={primaryColor}
                        placeholder="Select from date"
                        placeholdercolor={secondaryTextColor}
                        prefix={true}
                        fieldType="date"
                        value={fromDate}
                        onChange={(value) => {
                            setFromDate(value);
                            setErrors(prev => ({ ...prev, fromDate: '' }));
                        }}
                        icon={<FontAwesome5 name="calendar" size={20} color="#ffffff"/>}
                    />
                    {errors.fromDate && (
                        <Text style={[Textstyles.text_xxxsmall, { color: '#ef4444' }]} className="mt-1">
                            {errors.fromDate}
                        </Text>
                    )}
                </View>
                <View className="w-1/2">
                    <ThemeTextsecond size={Textstyles.text_xsma}>To:</ThemeTextsecond>
                    <InputComponent 
                        color={primaryColor}
                        placeholder="Select to date"
                        placeholdercolor={secondaryTextColor}
                        prefix={true}
                        fieldType="date"
                        value={toDate}
                        onChange={(value) => {
                            setToDate(value);
                            setErrors(prev => ({ ...prev, toDate: '' }));
                        }}
                        icon={<FontAwesome5 name="calendar" size={20} color="#ffffff"/>}
                    />
                    {errors.toDate && (
                        <Text style={[Textstyles.text_xxxsmall, { color: '#ef4444' }]} className="mt-1">
                            {errors.toDate}
                        </Text>
                    )}
                </View>
                </View>
                
                </View>
                <View className="mt-10">
               <ThemeTextsecond size={Textstyles.text_cmedium}>
                    By type
                </ThemeTextsecond>
                <EmptyView height={10} />
                <ThemeTextsecond size={Textstyles.text_xsma} >
                    What type of billing do you want to see?
                </ThemeTextsecond>
                <EmptyView height={10} />
               <SelectComponent setValue={(text)=>setValue(text)} value={value} width={'100%'} title="Select billing type" data={data}/>
                
                </View>
                <EmptyView height={20} />
                <View className="flex-row gap-x-3">
                    <ButtonFunction 
                        textcolor="#ffffff" 
                        onPress={handleFilter}  
                        color={primaryColor} 
                        text="Filter now" 
                    />
                    <ButtonFunction 
                        textcolor={primaryColor} 
                        onPress={clearFilters}  
                        color="transparent"
                        text="Clear"
                    />
                </View>
                
            </View>

            </View>
 
        
        </SliderModalTemplate>
        }

            <ContainerTemplate>
           
                <HeaderComponent title="Billing History" />
                <EmptyView height={10} />
                    <View className="item-center w-full justify-center flex-row gap-x-2 px-3">
                        <View
                            style={{ borderColor: primaryColor }}
                            className="w-8/12 h-12 border rounded-lg flex-row items-center px-4"
                        >
                            <TextInput
                                placeholder="Search By Job"
                                placeholderTextColor={secondaryTextColor}
                                style={{ flex: 1, color: secondaryTextColor }}
                                className="text-base h-12 w-full"
                            />
                        </View>
                        <TouchableOpacity onPress={()=>setshowmodal(true)} style={{ backgroundColor: primaryColor }} className="h-12 w-4/12 flex-row items-center justify-center rounded-lg">
                            <AntDesign name="filter" />
                            <Text> Filter</Text>
                        </TouchableOpacity>
                    </View>
                <View className="h-[70%]">
                    <EmptyView height={10} />
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 2, paddingTop: 10 }}>
                        <CardBill />
                        <CardBill />
                        <CardBill />
                        <CardBill />
                        <CardBill />
                        <CardBill />
                    </ScrollView>
                    
                </View>
                <EmptyView height={10} />
                <View className="items-center flex-row gap-x-2 justify-center ">
                        <TouchableOpacity style={{backgroundColor:primaryColor}} className="w-8 h-8 rounded-full justify-center items-center">
                            <Text>1</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{backgroundColor:primaryColor}} className="w-8 h-8 rounded-full justify-center items-center">
                            <Text>2</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{backgroundColor:primaryColor}} className="w-8 h-8 rounded-full justify-center items-center">
                            <Text>3</Text>
                        </TouchableOpacity>
                    </View>



            </ContainerTemplate>
        </>
    )
}
export default BillingHistory
const CardBill = () => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme)
    return (
        <>
            <EmptyView height={10} />
            <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full h-24 justify-center  rounded-2xl shadow-slate-500 shadow-sm px-5">
                <View className="flex-row justify-between items-center">
                    <View>
                        <ThemeTextsecond size={Textstyles.text_cmedium}>Residential Renovation</ThemeTextsecond>
                        <ThemeTextsecond size={Textstyles.text_xsma}>- Kitchen Remodeling</ThemeTextsecond>
                    </View>

                    <View className="flex-col items-start">
                        <ThemeTextsecond size={Textstyles.text_xsma}>
                            Jul 13, 2023
                        </ThemeTextsecond>
                        <Text  style={[Textstyles.text_cmedium,{ color: "green" }]}>
                            N32,000
                        </Text>
                    </View>
                </View>
            </View>
        </>
    )

}